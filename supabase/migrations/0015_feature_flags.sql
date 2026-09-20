-- 0015_feature_flags.sql
-- Table des feature flags genériques pour les SaaS connectés.

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  enabled boolean not null default false,
  scope text not null default 'global',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feature_flags_key_format check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint feature_flags_key_length check (char_length(key) between 1 and 100),
  constraint feature_flags_name_length check (char_length(name) between 1 and 100),
  constraint feature_flags_description_length check (
    description is null or char_length(description) <= 500
  ),
  constraint feature_flags_scope_check check (scope in ('global', 'organization'))
);

comment on table public.feature_flags is
  'Feature flags generiques pouvant être consommés par les SaaS connectés.';

create unique index feature_flags_key_idx on public.feature_flags (key);

create trigger set_feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

alter table public.feature_flags enable row level security;

-- Lecture : tout utilisateur authentifié peut lire les feature flags.
create policy "feature_flags_select_authenticated"
  on public.feature_flags for select
  to authenticated
  using (true);

-- Modification : seuls les utilisateurs autorisés (owner/admin) peuvent modifier.
-- Note: le RBAC est vérifié côté application via le service.
-- RLS permet l'écriture à tout utilisateur authentifié ; l'autorisation fine est dans le service.
create policy "feature_flags_insert_authenticated"
  on public.feature_flags for insert
  to authenticated
  with check (true);

create policy "feature_flags_update_authenticated"
  on public.feature_flags for update
  to authenticated
  using (true);

create policy "feature_flags_delete_authenticated"
  on public.feature_flags for delete
  to authenticated
  using (true);

-- Grants minimaux côté client.
revoke all on public.feature_flags from anon;
revoke all on public.feature_flags from public;
grant select, insert, update, delete on public.feature_flags to authenticated;
