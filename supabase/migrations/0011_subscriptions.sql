-- 0011_subscriptions.sql
-- Table des abonnements génériques pour les organisations connectées au Panel.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id text not null,
  status text not null default 'active',
  start_date timestamptz not null default now(),
  end_date timestamptz,
  renewal_date timestamptz,
  canceled_at timestamptz,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_status_check check (
    status in (
      'active', 'canceled', 'past_due', 'trialing',
      'incomplete', 'incomplete_expired', 'unpaid', 'paused'
    )
  ),
  constraint subscriptions_plan_id_format check (char_length(plan_id) between 1 and 100),
  constraint subscriptions_provider_reference_format check (
    provider_reference is null or char_length(provider_reference) <= 255
  ),
  constraint subscriptions_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.subscriptions is
  'Abonnements génériques rattachés à une organisation. Le provider de paiement reste derrière un adapter.';

create index subscriptions_organization_id_idx on public.subscriptions (organization_id);
create index subscriptions_status_idx on public.subscriptions (status);
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index subscriptions_renewal_date_idx on public.subscriptions (renewal_date);

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Lecture : réservée aux membres de l'organisation.
create policy "subscriptions_select_member"
  on public.subscriptions for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Insertion : les membres de l'organisation peuvent créer un abonnement.
create policy "subscriptions_insert_member"
  on public.subscriptions for insert
  to authenticated
  with check (public.is_org_member(organization_id));

-- Modification : les membres de l'organisation peuvent modifier leur abonnement.
create policy "subscriptions_update_member"
  on public.subscriptions for update
  to authenticated
  using (public.is_org_member(organization_id));

-- Suppression : les membres de l'organisation peuvent supprimer leur abonnement.
create policy "subscriptions_delete_member"
  on public.subscriptions for delete
  to authenticated
  using (public.is_org_member(organization_id));

-- Grants minimaux côté client.
revoke all on public.subscriptions from anon;
revoke all on public.subscriptions from public;
grant select, insert, update, delete on public.subscriptions to authenticated;