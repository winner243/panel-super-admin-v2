-- 0020_api_keys.sql
-- Table des clés API génériques pour les SaaS connectés.

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  key_prefix text,
  key_hash text not null,
  status text not null default 'active',
  environment text not null default 'production',
  scopes jsonb not null default '[]'::jsonb,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint api_keys_status_check check (status in ('active', 'revoked', 'expired')),
  constraint api_keys_environment_check check (environment in ('production', 'staging', 'development')),
  constraint api_keys_name_length check (char_length(name) between 1 and 100),
  constraint api_keys_key_prefix_length check (
    key_prefix is null or char_length(key_prefix) <= 20
  ),
  constraint api_keys_key_hash_length check (char_length(key_hash) between 1 and 255),
  constraint api_keys_scopes_is_array check (jsonb_typeof(scopes) = 'array')
);

comment on table public.api_keys is
  'Clés API génériques pour les SaaS connectés. Le hash est stocké, jamais la clé en clair.';

create index api_keys_organization_id_idx on public.api_keys (organization_id);
create index api_keys_status_idx on public.api_keys (status);
create index api_keys_environment_idx on public.api_keys (environment);

create trigger set_api_keys_updated_at
  before update on public.api_keys
  for each row execute function public.set_updated_at();

alter table public.api_keys enable row level security;

-- Lecture : réservée aux membres de l'organisation.
create policy "api_keys_select_member"
  on public.api_keys for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Insertion : les membres de l'organisation peuvent créer une clé API.
create policy "api_keys_insert_member"
  on public.api_keys for insert
  to authenticated
  with check (public.is_org_member(organization_id));

-- Modification : les membres de l'organisation peuvent modifier une clé API.
create policy "api_keys_update_member"
  on public.api_keys for update
  to authenticated
  using (public.is_org_member(organization_id));

-- Suppression : les membres de l'organisation peuvent supprimer une clé API.
create policy "api_keys_delete_member"
  on public.api_keys for delete
  to authenticated
  using (public.is_org_member(organization_id));

-- Grants minimaux côté client.
revoke all on public.api_keys from anon;
revoke all on public.api_keys from public;
grant select, insert, update, delete on public.api_keys to authenticated;
