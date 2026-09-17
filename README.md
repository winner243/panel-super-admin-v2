# Super Admin Panel

Panneau de supervision centralisé pour les applications SaaS : gestion des
utilisateurs, organisations, abonnements, sécurité et observabilité.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture générique
- [`docs/SETUP.md`](docs/SETUP.md) — installation locale, Supabase, compte DEV
- [`docs/SECURITY.md`](docs/SECURITY.md) — auth, RBAC/RLS, audit, hardening
- [`docs/TESTING.md`](docs/TESTING.md) — Vitest + Playwright
- [`docs/EXTENDING.md`](docs/EXTENDING.md) — ajouter entité / permission / page

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- TypeScript (mode strict)
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (style new-york) avec les tokens du
  thème définis dans `src/app/css/globals.css`
- [Lucide](https://lucide.dev) pour les icônes (seule bibliothèque d'icônes)
- [next-themes](https://github.com/pacocoursey/next-themes) pour le mode
  clair/sombre

## Prérequis

- Node.js >= 20
- pnpm >= 11

## Installation

```bash
pnpm install
cp .env.example .env.local   # obligatoire pour l'authentification (voir docs/SETUP.md)
```

## Scripts

| Commande         | Description                          |
|------------------|--------------------------------------|
| `pnpm dev`       | Serveur de développement             |
| `pnpm build`     | Build de production                  |
| `pnpm start`     | Démarrage de la build de production  |
| `pnpm lint`      | ESLint (Next.js core-web-vitals)     |
| `pnpm typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `pnpm test`      | Tests unitaires (`vitest run`)       |
| `pnpm test:e2e`  | Tests e2e Playwright (`playwright test`) |
| `pnpm test:e2e:install` | Installe Chromium pour Playwright |

## Architecture

Couches, du plus haut niveau au plus bas :

```
src/app              → UI (routes, pages, layouts)
src/components/ui    → UI (composants primitifs shadcn/ui)
src/components/layout → UI (navigation, en-tête)
src/services         → Services (cas d'utilisation)
src/repositories     → Repositories (interfaces + implémentation Supabase)
src/adapters         → Adapters (mapping lignes Supabase ↔ domaine)
src/validators       → Validators (schémas Zod)
src/types            → Types domaine purs (profils, organisations, rôles, …)
src/infrastructure   → Infrastructure (clients Supabase, config, types Database)
supabase/migrations  → Migrations SQL versionnées (schéma + RLS)
```

Les règles applicatives ne dépendent pas de Next.js ni de l'interface : elles
sont exprimées dans les couches Services / Repositories / Adapters /
Infrastructure.

## État

- **V1 — livrée** : authentification (login / inscription / callback / logout,
  sessions serveur HTTP-only, proxy `src/proxy.ts`, garde des routes du
  tableau de bord, redirections sûres, limitation des tentatives) ; profils,
  organisations, membres/rôles, catalogue rôles-permissions ; journal
  d'audit append-only ; thème clair/sombre ; responsive (menu mobile) ;
  accessible (headings, focus clavier). Valide : **lint, typecheck, build,
  94 tests unitaires PASS (Vitest), 39 specs Playwright (6 PASS publics / 33
  DEV conditionnels, 0 échec)**. Durcissement : cookies `httpOnly` +
  `sameSite=lax` + `secure` en production, CSP production, `X-Frame-Options
  DENY`, RLS multi-tenant, protection du dernier propriétaire.
- **Compte DEV requis** pour les tests e2e authentifiés (voir
  `docs/SETUP.md`).
- Aucune donnée sensible ne doit être ajoutée sans passer par les couches
  Services / Repositories / Adapters / Infrastructure.