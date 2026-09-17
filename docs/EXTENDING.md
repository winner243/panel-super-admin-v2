# Étendre le panel — V1

Guide générique pour ajouter une entité, une permission ou une page sans
sortir de l'architecture en couches.

## Ajouter une permission

1. **Base** : créer une migration `0011_*.sql` et :
   ```sql
   insert into public.permissions (key, name, description)
   values ('<domaine>.<action>', '<Nom>', '<Description>');
   insert into public.role_permissions (role_id, permission_id)
   select r.id, p.id from public.roles r
   cross join public.permissions p
   where r.name = 'owner' and p.key = '<domaine>.<action>';
   ```
2. **App** : contrôler l'accès avec le helper de permission existant
   (`hasOrgPermission` côté service) et le filtre UI de la navigation.

## Ajouter une entité métier simple

Suivre le chemin d'une entité existante (ex. `organizations`) :

1. **DB** — migration : table + contraintes + indexes + RLS (une politique
   d'insertion par le/les rôles autorisés, lecture par co-membres) + grants.
   Ne jamais ouvrir d'écriture sans `WITH CHECK` explicite.
2. **Types** — `src/types/<entite>.ts` : types domaine purs.
3. **Validators** — `src/validators/<entite>.ts` : schémas Zod
   (création, mise à jour, params d'URL).
4. **Adapters** — `src/adapters/<entite>.ts` : mapping lignes Supabase ↔
   domaine.
5. **Repository** — `src/repositories/<entite>-repository.ts` : interface +
   implémentation Supabase (jamais de RLS bypass ; pas de `service_role`).
6. **Service** — `src/services/<entite>-service.ts` : cas d'utilisation qui
   orchestre repository + permissions + audit.
7. **UI** — route dans `src/app/(DashboardLayout)/<entite>/page.tsx` avec
   états loading/empty/error/unauthorized (suivre le modèle d'une page
   existante), composants dans `src/components/`.
8. **Nav** — ajouter l'entrée dans
   `src/components/layout/nav-items.ts` (avec son icône Lucide et les
   permissions requises).
9. **Tests** — `*.test.ts` Vitest (validators + service + repository fake) +
   scénarios Playwright publics ou DEV dans `e2e/`.
10. **Audit** — enregistrer les actions via le service d'audit
   (`action` au format `domaine.action`, `metadata` = identifiants/notes,
   jamais de secret).

## Ajouter une page sans entité

- Route dans le groupe `(DashboardLayout)` → bénéficie de la garde serveur.
- Composant Server Component + Server Actions (`actions.ts`) avec validation
  Zod et messages d'erreur génériques.
- Ajouter l'entrée de navigation si nécessaire.

## Règles de non-régression

- Ne **jamais** importer `createServerSupabaseClient` depuis un composant
  client (App Router : reserver aux RSC/Server Actions).
- Ne **jamais** mettre de clé privée / service_role côté app ; la clé anon est
  la seule exposée, verrouillée par RLS.
- Chaque permission côté UI doit être **ré-vérifiée** côté service (la
  visibilité d'un bouton n'est jamais une autorisation).
- Journaliser toute action d'administration dans `audit_logs` (append-only).
- Les migrations RLS doivent rester cumulatives et idempotentes au niveau
  d'un environnement vierge : les appliquer dans l'ordre numérique.