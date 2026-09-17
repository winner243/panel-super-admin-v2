-- 0004_organization_members.sql
-- Appartenance des utilisateurs aux organisations, avec un rôle par adhésion.

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

comment on table public.organization_members is
  'Un utilisateur appartient au plus une fois à une organisation, avec un rôle.';

-- Index pour les joints inverses (organisations d'un utilisateur, rôles).
create index organization_members_user_id_idx on public.organization_members (user_id);
create index organization_members_role_id_idx on public.organization_members (role_id);