# Tests — V1

## Vue d'ensemble

| Niveau      | Outil      | Cible                              | Commande          |
|-------------|------------|------------------------------------|-------------------|
| Unitaire    | Vitest     | 15 fichiers, **94 tests** (PASS)   | `pnpm test`       |
| E2E         | Playwright | 39 specs sur chromium + mobile     | `pnpm test:e2e`   |

## Tests unitaires (Vitest)

Couvrent : validators Zod (entrées/créations/mis-à-jour), adapters,
repositories (avec fake), services métier (RBAC, protections), route-guard,
redirection sûre. La logique applicative (couches
`services`/`repositories`/`adapters`/`validators`) ne dépend pas de Next.js
et est testable isolément.

```bash
pnpm test
```

## Tests e2e (Playwright)

Installation préalable : `pnpm test:e2e:install` (Chromium).

Les tests e2e sont **découplés en deux niveaux** :

1. **Publics — toujours exécutés** (aucune session requise) :
   - `auth-public.spec.ts` : accès à `/auth/login`, redirection des routes
     privées vers `/auth/login`, navigation clavier du formulaire.
2. **DEV — gated par variables d'environnement** (compte DEV requis) :
   - `auth.spec.ts`, `users.spec.ts`, `organizations.spec.ts`,
     `members.spec.ts`, `audit.spec.ts`, `ux.spec.ts`.

Le projet Playwright `setup` se connecte **une seule fois** via l'UI et
enregistre l'état dans `e2e/.auth/user.json` (storageState), réutilisé par les
deux projets navigateur (`chromium`, `mobile-chromium` = Pixel 7).

### Variables d'environnement e2e

| Variable             | Description                                            |
|----------------------|--------------------------------------------------------|
| `E2E_BASE_URL`       | URL du serveur (défaut `http://localhost:3000`)        |
| `E2E_TEST_EMAIL`     | Email du compte **DEV** (connexion)                    |
| `E2E_TEST_PASSWORD`  | Mot de passe du compte **DEV**                         |
| `E2E_TEST_ORG_ID`    | UUID d'une organisation lisible par le compte DEV      |
| `E2E_RUN_MUTATIONS`  | `1` pour autoriser les scénarios d'écriture (DEV)      |

Sans `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`, le projet setup est sauté et tous
les tests DEV sont automatiquement **skippés** (le rapport Playwright reste
vert : 6 PASS publics sur les 2 projets, 0 échec).

### Créer un compte DEV

Voir `docs/SETUP.md` → « Compte de test DEV ». Toujours utiliser un projet
**DEV dédié**, jamais de production.

### Scénarios d'écriture (mutations)

Gateds par `E2E_RUN_MUTATIONS=1` :
- modification du nom complet du profil (`users.spec.ts`) ;
- création d'une organisation avec un slug unique `e2e-org-<timestamp>`
  (`organizations.spec.ts`).

Ceux-ci ne s'exécutent que si l'utilisateur les demande explicitement, pour
ne jamais polluer un environnement partagé par défaut.

### Comment lancer

```bash
pnpm test:e2e:install   # première fois
pnpm test:e2e           # lance chromium + mobile (39 specs, workers=1)
```

Report HTML : `playwright-report/index.html`.

## Convention

Ajouter une fonctionnalité = ajouter ses scénarios e2e publics ou DEV dans
`e2e/` + tests unitaires dans `src/**/*.test.ts`. La section
`README.md` et `docs/ARCHITECTURE.md` listent les surfaces testées.