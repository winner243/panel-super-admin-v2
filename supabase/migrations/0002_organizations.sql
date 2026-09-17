-- 0002_organizations.sql
-- Table des organisations (tenants d'une application SaaS multi-tenant).

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.organizations.slug is
  'Slug unique et lisible pour identifier l''organisation en URL.';

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- Index sur le créateur (join / filtre fréquent).
create index organizations_created_by_idx on public.organizations (created_by);