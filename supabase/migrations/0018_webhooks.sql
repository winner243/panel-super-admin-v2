-- 0018_webhooks.sql
-- Table des webhooks génériques pour les SaaS connectés.

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source text not null,
  event_type text not null,
  endpoint text not null,
  status text not null default 'active',
  delivery_status text not null default 'pending',
  attempts integer not null default 0,
  last_delivered_at timestamptz,
  next_retry_at timestamptz,
  error_category text,
  correlation_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint webhooks_status_check check (status in ('active', 'inactive', 'failed')),
  constraint webhooks_delivery_status_check check (
    delivery_status in ('pending', 'success', 'failed', 'retrying')
  ),
  constraint webhooks_attempts_check check (attempts >= 0),
  constraint webhooks_source_length check (char_length(source) between 1 and 100),
  constraint webhooks_event_type_length check (char_length(event_type) between 1 and 100),
  constraint webhooks_endpoint_length check (char_length(endpoint) between 1 and 500),
  constraint webhooks_error_category_length check (
    error_category is null or char_length(error_category) <= 100
  ),
  constraint webhooks_correlation_id_length check (
    correlation_id is null or char_length(correlation_id) <= 255
  ),
  constraint webhooks_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.webhooks is
  'Webhooks génériques pour les SaaS connectés. Le Panel supervise les livraisons.';

create index webhooks_organization_id_idx on public.webhooks (organization_id);
create index webhooks_status_idx on public.webhooks (status);
create index webhooks_delivery_status_idx on public.webhooks (delivery_status);
create index webhooks_event_type_idx on public.webhooks (event_type);
create index webhooks_created_at_idx on public.webhooks (created_at desc);

create trigger set_webhooks_updated_at
  before update on public.webhooks
  for each row execute function public.set_updated_at();

alter table public.webhooks enable row level security;

-- Lecture : réservée aux membres de l'organisation.
create policy "webhooks_select_member"
  on public.webhooks for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Insertion : les membres de l'organisation peuvent créer un webhook.
create policy "webhooks_insert_member"
  on public.webhooks for insert
  to authenticated
  with check (public.is_org_member(organization_id));

-- Modification : les membres de l'organisation peuvent modifier un webhook.
create policy "webhooks_update_member"
  on public.webhooks for update
  to authenticated
  using (public.is_org_member(organization_id));

-- Suppression : les membres de l'organisation peuvent supprimer un webhook.
create policy "webhooks_delete_member"
  on public.webhooks for delete
  to authenticated
  using (public.is_org_member(organization_id));

-- Grants minimaux côté client.
revoke all on public.webhooks from anon;
revoke all on public.webhooks from public;
grant select, insert, update, delete on public.webhooks to authenticated;
