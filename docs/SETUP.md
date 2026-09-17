# Installation et mise en route — V1

## Prérequis

- Node.js >= 20
- pnpm >= 11
- Un projet Supabase (hébergé ou CLI local) disposant des migrations
  `supabase/migrations/`

## Installation locale

```bash
pnpm install
cp .env.example .env.local
```

Compléter `.env.local` :

| Variable                       | Obligatoire | Description                                |
|--------------------------------|-------------|--------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | oui (auth) | URL du projet Supabase (ex. `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| oui (auth) | Clé **publique** anon (role `anon`)      |
| `SUPABASE_SERVICE_ROLE_KEY`    | non         | Réservée aux backends de confiance ; **jamais utilisée par l'app** (commentée dans `.env.example`) |

> Les clés `anon` sont conçues pour être exposées au client ; elles sont
> verrouillées par les politiques RLS. La clé `service_role` ne doit **jamais**
> être déclarée dans un fichier servant au Next.js.

## Base de données

Appliquer les migrations dans l'ordre (`0001_profiles.sql` … `0010_audit_logs.sql`)
sur l'environnement Supabase **DEV / de staging** seulement — jamais de
modification d'un environnement de production depuis ce dépôt.

```bash
# via Supabase CLI (si configuré)
supabase link --project-ref <ref>
supabase db push
```

Conseils :
- Un projet connecté à l'app ne doit pas être un projet de production partagé.
- Les politiques RLS, seeds et triggers sont versionnés ; appliquer le tout ou
  rien, dans l'ordre numérique.

## Compter de test DEV (e2e authentifiés)

Les tests Playwright authentifiés (connexion, organisations, membres, audit,
thème) exigent un **compte DEV dédié** sur le projet Supabase de test :

1. Passer l'authentification : l'inscription via `/auth/register` crée le
   profil automatiquement (`0006_auth_bootstrap`).
2. Créer une organisation via l'UI (le créateur devient `owner`).
3. Renseigner les variables ci-dessous dans l'environnement qui lance
   `pnpm test:e2e` (fichier `.env.local` du workspace ou shell) :
   - `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` — identifiants du compte DEV
   - `E2E_TEST_ORG_ID` — identifiant (UUID) d'une organisation que ce compte
     peut consulter
   - `E2E_RUN_MUTATIONS=1` — autoriser les scénarios **d'écriture** (profil,
     création d'organisation) sur le DEV uniquement

Variables optionnelles :
- `E2E_BASE_URL` — URL du serveur (défaut : `http://localhost:3000`)
- `E2E_RUN_MUTATIONS` — voir ci-dessus ; sans valeur, les écritures sont sautées

## Lancer l'application

```bash
pnpm dev       # développement (http://localhost:3000)
pnpm build     # build de production
pnpm start     # sert la build de production
```

## Scripts

| Commande              | Description                                         |
|-----------------------|-----------------------------------------------------|
| `pnpm dev`            | Serveur de développement (Turbopack)                |
| `pnpm build`          | Build de production + vérification TypeScript/lint  |
| `pnpm start`          | Démarre la build de production                      |
| `pnpm lint`           | ESLint                                              |
| `pnpm typecheck`      | `tsc --noEmit`                                      |
| `pnpm test`           | Vitest (unitaires) : 15 fichiers, 94 tests          |
| `pnpm test:e2e`       | Playwright (e2e) — installer le navigateur d'abord  |
| `pnpm test:e2e:install` | Installe Chromium pour Playwright                |

> Build/start en local : les cookies de session sont marqués `secure` en
> production ; pour tester `pnpm start` en local pur HTTP, le navigateur ne
> persistera pas la session (comportement volontaire de durcissement).

## Déploiement de référence

- Build statique/dynamique Next sur n'importe quel hôte Node (Vercel,
  Railway, fly.io, VM) — l'application n'utilise **pas** de service role ni de
  secret coté Next au-delà des clés anon.
- Appliquer les migrations Supabase en amont.
- Mettre les variables d'environnement sur l'hôte (les mêmes que `.env.local`).
- Le proxy (`src/proxy.ts`) s'exécute côté serveur : inutile d'exposer des
  headers supplémentaires excepté ceux déjà définis dans `next.config.mjs`.