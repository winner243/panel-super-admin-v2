-- 0005_rls.sql
-- Activation de Row Level Security et politiques d'accès multi-tenant.

-- Helpers SQL utilisés par les politiques (security definer, search_path borné).

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_permission(org_id uuid, perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    join public.role_permissions rp on rp.role_id = m.role_id
    join public.permissions p on p.id = rp.permission_id
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
      and p.key = perm_key
  );
$$;

-- Activation de RLS sur toutes les tables métier.
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- profiles : un utilisateur ne lit/modifie que son propre profil.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- organizations : lecture réservée aux membres, création au créateur,
-- modification réservée aux rôles owner/admin.
create policy "organizations_select_member"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "organizations_insert_creator"
  on public.organizations for insert
  with check (auth.uid() = created_by);

create policy "organizations_update_manage"
  on public.organizations for update
  using (public.has_org_permission(id, 'organizations.update'));

-- organization_members : lecture aux membres de l'organisation,
-- gestion par détenteur de organizations.members.manage,
-- création du propriétaire par le créateur de l'organisation (pas d'escalade vers owner).
create policy "organization_members_select"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "organization_members_insert"
  on public.organization_members for insert
  with check (
    (
      auth.uid() = user_id
      and exists (
        select 1
        from public.roles r
        where r.id = role_id and r.name = 'owner'
      )
      and exists (
        select 1
        from public.organizations o
        where o.id = organization_id and o.created_by = auth.uid()
      )
    )
    or (
      public.has_org_permission(organization_id, 'organizations.members.manage')
      and exists (
        select 1
        from public.roles r
        where r.id = role_id and r.name <> 'owner'
      )
    )
  );

create policy "organization_members_update_manage"
  on public.organization_members for update
  using (public.has_org_permission(organization_id, 'organizations.members.manage'));

create policy "organization_members_delete_manage"
  on public.organization_members for delete
  using (public.has_org_permission(organization_id, 'organizations.members.manage'));

-- Catalogue rôles / permissions / associations : lecture pour tout utilisateur
-- connecté. Aucune politique d'écriture (gestion via migrations uniquement).
create policy "roles_select_authenticated"
  on public.roles for select
  to authenticated
  using (true);

create policy "permissions_select_authenticated"
  on public.permissions for select
  to authenticated
  using (true);

create policy "role_permissions_select_authenticated"
  on public.role_permissions for select
  to authenticated
  using (true);