-- 0007_org_member_profile_visibility.sql
-- Les co-membres d'une organisation peuvent lire un profil minimal
-- (id, full_name, avatar_url) des autres membres de la même organisation.
-- Les autres colonnes du profil restent inaccessibles aux rôles exposés
-- (pas d'email, pas de dates de création/modification).

-- Helper : l'utilisateur courant partage-t-il une organisation avec target_user_id ?
create or replace function public.is_shared_org_member(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members other
      on other.organization_id = mine.organization_id
    where mine.user_id = (select auth.uid())
      and other.user_id = target_user_id
  );
$$;

-- Politique de lecture par co-membres ; s'ajoute à profiles_select_own
-- (la lecture de son propre profil reste disponible).
create policy "profiles_select_org_members"
  on public.profiles for select
  to authenticated
  using (public.is_shared_org_member(id));

-- Restriction au niveau des colonnes : les rôles exposés ne lisent que le profil
-- minimal. service_role conserve l'accès complet (opérations privilégiées).
revoke select on public.profiles from anon;
revoke select on public.profiles from authenticated;
grant select (id, full_name, avatar_url) on public.profiles to authenticated;

-- Correctif de sécurité : la politique de mise à jour des membres n'avait pas de
-- WITH CHECK, permettant à un détenteur de organizations.members.manage d'attribuer
-- le rôle owner par mise à jour. On aligne le comportement sur la politique
-- d'insertion (le rôle owner ne peut pas être attribué par simple gestion).
drop policy "organization_members_update_manage" on public.organization_members;
create policy "organization_members_update_manage"
  on public.organization_members for update
  using (public.has_org_permission(organization_id, 'organizations.members.manage'))
  with check (
    public.has_org_permission(organization_id, 'organizations.members.manage')
    and exists (
      select 1
      from public.roles r
      where r.id = role_id and r.name <> 'owner'
    )
  );