# Sécurité — V1

## Principe

Les règles de sécurité sont exprimées **au plus bas niveau** (SQL/RLS), puis
redondées par les services applicatifs (UI + Server Actions). Le client
navigateur ne possède que la clé `anon`, verrouillée par RLS.

## Authentification

- Login / inscription / callback par **Server Actions** côté serveur
  (`src/app/auth/*/actions.ts`).
- Sessions **HTTP-only** côté serveur via `@supabase/ssr`, rafraîchies par le
  proxy (`src/proxy.ts` → `updateSession()`).
- Cookies forcés à l'écriture :
  `path=/`, `sameSite=lax`, `httpOnly=true`, `secure=true` en production.
- Redirections post-login validées par `resolveSafeRedirect` (anti open
  redirect) : seules les URLs internes relatives sont acceptées.
- Tentatives de connexion limitées (5 / 15 min par IP, en mémoire).

## Protection des routes

- `src/proxy.ts` enveloppe toutes les routes ; les routes protégées
  (`requiresAuthentication`) sont gardées.
- Le layout `(DashboardLayout)` ré-vérifie la session (garde serveur).
- Une session expirée redirige vers `/auth/login?reason=session_expired` ;
  une route publique consultée connecté redirige vers `/`.

## RBAC / permissions

Catalogue réutilisable : `roles` (owner / admin / member), `permissions`
(`domaine.action`), `role_permissions`.

Attribution V1 :

| Permission                   | owner | admin | member |
|------------------------------|:-----:|:-----:|:------:|
| `organizations.read`         |   x   |   x   |   x    |
| `organizations.update`       |   x   |   x   |        |
| `organizations.members.manage`|   x   |   x   |        |
| `roles.read`                 |   x   |   x   |        |
| `roles.manage`               |   x   |       |        |
| `permissions.read`           |   x   |   x   |        |
| `permissions.manage`         |   x   |       |        |

La gestion passe par migrations uniquement (aucune politique d'écriture sur le
catalogue : il n'est pas modifiable côté client).

## Row Level Security (résumé)

Helpers security definer (`search_path` borné) : `is_org_member`,
`has_org_permission`, `is_shared_org_member`.

- `profiles` : lecture/modification de **son propre** profil ; lecture du
  profil minimal co-membres (id, full_name, avatar_url) ; **aucune** lecture
  d'email/dates par les rôles exposés.
- `organizations` : lecture aux membres (+ créateur via
  `organizations_select_creator`), insertion par le créateur, mise à jour
  `organizations.update`.
- `organization_members` : lecture aux membres ; insertion du propriétaire
  uniquement par le créateur de l'org ; gestion par
  `organizations.members.manage` avec **blocage de l'attribution du rôle
  `owner`** (insert + update via `WITH CHECK`).
- `roles` / `permissions` / `role_permissions` : lecture pour tout
  utilisateur connecté, aucune écriture.
- `audit_logs` : append-only ; chaque événement est rattaché à `auth.uid()`
  (anti-usurpation) et isolé par organisation.

## Protections additionnelles en base

- Trigger `protect_last_owner` (`0009`) : impossible de supprimer ou de
  rétrograder le **dernier** propriétaire d'une organisation (avec verrou
  logique anti-course). Fonction revoke sur les rôles exposés.
- Trigger `on_auth_user_created` (`0006`) : création automatique du profil ;
  exécution directe interdite aux rôles exposés.
- `audit_logs` : aucune politique UPDATE/DELETE, `revoke` des rôles
  d'exécution de la fonction de trigger.

## Journal d'audit

Table append-only `public.audit_logs` (actor_id, organization_id, action,
resource_type, resource_id, status, metadata→jsonb). Écrit via les services
(`recordAuditLog`). N'écrit **jamais** de valeurs sensibles (mots de passe,
jetons) : seulement des références (identifiants, champs modifiés).

## En-têtes HTTP

Définis dans `next.config.mjs` (toutes réponses) :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` **en production uniquement** :
  `default-src 'self'` ; scripts self (+ unsafe-eval/inline requis par
  Next/React) ; connect-src `https://*.supabase.co wss://*.supabase.co`
  (couverture générique de tout projet Supabase) ; `frame-ancestors 'none'`.

## Vérifications effectuées (V1)

- Aucune clé/secret dans le code ni dans le `supabase/` versionné (le seul
  fichier `.env*` autorisé est `_.env.example`_ avec des placeholders).
- `.gitignore` couvre `.env`, `.env*.local`, `test-results/`,
  `playwright-report/`, `e2e/.auth/`, `supabase/.temp/`.
- `SERVICE_ROLE` / `service_role` : uniquement en commentaire dans
  `.env.example` ; jamais utilisé par le code applicatif.
- Aucune erreur sensible exposée au client (messages génériques,
  `redirectTo` validé).

## Limitations connues (volontairement hors périmètre V1)

- Pas de CSP nonce-based (CSP conservative et compatible Next/React) : un
  durcissement CSP strict nonce+hash est recommandé en V2.
- Limitation des tentatives de connexion par **processus mémoire** (non
  distribuée) : à remplacer par un store partagé en production multi-instances.
- Les comptes DEV de test e2e sont documentés (`docs/TESTING.md`) et non
  fournis dans le dépôt.