# Architecture — Super Admin Panel

Documentation générique et réutilisable de la V1 : panneau de supervision
centralisé pour applications SaaS (utilisateurs, organisations, rôles,
permissions, audit).

## Vue d'ensemble

- **Framework** : Next.js 16 (App Router, Turbopack) + React 19.
- **Client Supabase server-side** : `@supabase/ssr` (`createServerClient`).
- **Langage** : TypeScript en mode strict.
- **UI** : Tailwind CSS v4, composants shadcn/ui (style new-york), icônes
  Lucide, thème clair/sombre via `next-themes`.
- **Validation** : schémas Zod dans `src/validators`.
- **Tests** : Vitest (unitaires) + Playwright (e2e).

## Couches applicatives

Règles du haut vers le bas ; les règles métier ne dépendent pas de Next.js :

```
src/app                 → UI : routes, pages, layouts, server actions
src/components/ui       → Composants primitifs (shadcn/ui)
src/components/layout   → Sidebar, header, bouton éclair, navigation
src/services            → Cas d'utilisation (business rules)
src/repositories        → Interfaces (ports) + implémentation Supabase
src/adapters            → Mapping lignes Supabase ↔ objets domaine
src/validators          → Schémas Zod (entrée, création, mise à jour)
src/types               → Types domaine purs (Profils, Organisations, …)
src/infrastructure      → Clients Supabase (server/browser/middleware/env),
                          type généré Database
supabase/migrations     → SQL versionné : schéma + seed + RLS
e2e                     → Tests Playwright + support
docs                    → Cette documentation
```

### Flux d'une requête authentifiée

1. `src/proxy.ts` (middleware Next 16) matche toutes les routes sauf assets
   statiques. Il appelle `updateSession()` (`src/infrastructure/supabase/
   middleware.ts`) qui rafraîchit la session Supabase et en propage les cookies.
2. Si la route est protégée (`src/lib/route-guard.ts`) et non authentifiée,
   redirection vers `/auth/login` avec `reason` (`unauthenticated` ou
   `session_expired`) et `next` pour l'URL de retour.
3. Si l'utilisateur est connecté et demande une route d'auth publique
   (`/auth/login`, `/auth/register`), redirection vers le tableau de bord.
4. Le layout `src/app/(DashboardLayout)/layout.tsx` vérifie de nouveau la
   session (garde serveur) et fournit la navigation.

### Session et cookies

- Cookies de session Supabase (`sb-*`), configurés **côté serveur uniquement**.
- Options forcées lors de l'écriture (middleware + server client) :
  - `path: "/"`, `sameSite: "lax"`, `httpOnly: true`
  - `secure: true` en production (`NODE_ENV === 'production'`)
- Aucun client navigateur n'est utilisé par l'application :
  `createBrowserSupabaseClient()` est défini mais non référencé.

## Modèle de données

| Table                 | Rôle                                                        |
|-----------------------|-------------------------------------------------------------|
| `profiles`            | 1:1 avec `auth.users` (nom complet, avatar)                 |
| `organizations`       | Tenants SaaS (nom, slug unique)                             |
| `organization_members`| Appartenance user ↔ org avec rôle (`owner`/`admin`/`member`)|
| `roles`               | Catalogue de rôles (`is_system` pour owner/admin/member)    |
| `permissions`         | Catalogue de permissions (`domaine.action`)                 |
| `role_permissions`    | Associations rôle ↔ permission                              |
| `audit_logs`          | Journal append-only des événements d'administration         |

Migrations : `supabase/migrations/0001_…0010_*.sql` (schéma, indexes, seed,
RLS, triggers). Voir `docs/SECURITY.md` pour la matrice RLS.

## Organisation front

- Groupe de routes authentifié : `src/app/(DashboardLayout)/`.
- Routes publiques : `/auth/login`, `/auth/register`, `/auth/callback`.
- Pages V1 : tableau de bord (`/`), `/users`, `/organizations`,
  `/organizations/[orgId]` (détail + membres/rôles), `/roles`, `/permissions`,
  `/audit`, `/settings`.
- États gérés par page : **loading** (squelettes), **error** (cartes d'erreur),
  **empty**, **unauthorized** (404 pour une organisation non autorisée).
- Navigation centralisée : `src/components/layout/nav-items.ts` (éléments
  visibles selon l'authentification / l'état mobile).

## Edition de la session en dev

- `.env.local` requis : `NEXT_PUBLIC_SUPABASE_URL` et
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé **anon** : publique côté client par
  conception).
- Sans ces variables, l'app tourne mais l'auth est inactive et `requireEnv()`
  lève une erreur explicite dans les routes qui en ont besoin.

## Provisioning d'un nouveau projet

1. Copier le projet (structure entièrement portable).
2. `pnpm install && cp .env.example .env.local` puis remplir les clés.
3. Déployer les migrations sur le projet Supabase cible.
4. Créer un compte de test DEV pour les tests e2e authentifiés.

Détails : `docs/SETUP.md`.