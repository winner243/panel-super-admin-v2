-- 0003_roles_permissions.sql
-- Catalogue des rôles, des permissions et de leurs associations.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.roles.is_system is
  'Les rôles système (owner, admin, member) sont gérés par les migrations et ne sont pas supprimables.';

create trigger set_roles_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique
    check (key ~ '^[a-z0-9]+(\.[a-z0-9]+)+$'),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

comment on column public.permissions.key is
  'Clé unique au format domaine.action (ex. organizations.read).';

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- Index pour la recherche inversée permission -> rôles.
create index role_permissions_permission_id_idx on public.role_permissions (permission_id);

-- Seed : rôles système.
insert into public.roles (name, description, is_system) values
  ('owner', 'Propriétaire de l''organisation', true),
  ('admin', 'Administrateur de l''organisation', true),
  ('member', 'Membre de l''organisation', true);

-- Seed : catalogue de permissions.
insert into public.permissions (key, name, description) values
  ('organizations.read', 'Lire les organisations', 'Consulter les informations d''une organisation.'),
  ('organizations.update', 'Modifier les organisations', 'Modifier le nom ou le slug d''une organisation.'),
  ('organizations.members.manage', 'Gérer les membres', 'Ajouter, modifier ou retirer des membres d''une organisation.'),
  ('roles.read', 'Lire les rôles', 'Consulter le catalogue des rôles.'),
  ('roles.manage', 'Gérer les rôles', 'Créer ou modifier des rôles.'),
  ('permissions.read', 'Lire les permissions', 'Consulter le catalogue des permissions.'),
  ('permissions.manage', 'Gérer les permissions', 'Créer ou modifier des permissions.');

-- Seed : associations rôle -> permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where
  r.name = 'owner'
  or (r.name = 'admin' and p.key not in ('roles.manage', 'permissions.manage'))
  or (r.name = 'member' and p.key = 'organizations.read');