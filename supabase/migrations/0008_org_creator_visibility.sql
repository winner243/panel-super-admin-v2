-- 0008_org_creator_visibility.sql
-- Déblocage de la création d'organisation.
--
-- Le créateur doit pouvoir lire l'organisation qu'il vient de créer avant même
-- que son adhésion de propriétaire n'existe. C'est nécessaire pour :
--   1. l'INSERT ... RETURNING (return=representation) du repository
--      SupabaseOrganizationRepository.create() ;
--   2. le WITH CHECK de organization_members_insert (0005), dont la sous-requête
--      porte sur public.organizations et est filtrée par RLS.
--
-- Politique additive : elle ne modifie aucune politique existante.
-- Réserve connue : un créateur retiré de l'organisation conserve la lecture de
-- celle-ci tant que created_by le référence.

create policy "organizations_select_creator"
  on public.organizations for select
  to authenticated
  using (created_by = auth.uid());
