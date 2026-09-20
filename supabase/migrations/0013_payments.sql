-- 0013_payments.sql
-- Table des paiements génériques pour les organisations connectées au Panel.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null,
  provider_payment_reference text,
  status text not null default 'pending',
  currency text not null,
  amount numeric,
  payment_method_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (
    status in (
      'succeeded', 'pending', 'failed', 'canceled',
      'refunded', 'partially_refunded', 'disputed'
    )
  ),
  constraint payments_currency_check check (char_length(currency) = 3),
  constraint payments_amount_check check (amount is null or amount >= 0),
  constraint payments_payment_method_type_check check (
    payment_method_type is null or
    payment_method_type in ('card', 'bank_transfer', 'mobile_money', 'paypal', 'other')
  ),
  constraint payments_provider_check check (char_length(provider) between 1 and 100),
  constraint payments_provider_payment_reference_check check (
    provider_payment_reference is null or char_length(provider_payment_reference) <= 255
  ),
  constraint payments_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.payments is
  'Paiements génériques rattachés à une organisation. Le provider de paiement reste derrière un adapter.';

create index payments_organization_id_idx on public.payments (organization_id);
create index payments_subscription_id_idx on public.payments (subscription_id);
create index payments_status_idx on public.payments (status);
create index payments_provider_idx on public.payments (provider);
create index payments_created_at_idx on public.payments (created_at desc);

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

-- Lecture : réservée aux membres de l'organisation.
create policy "payments_select_member"
  on public.payments for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Insertion : les membres de l'organisation peuvent créer un paiement.
create policy "payments_insert_member"
  on public.payments for insert
  to authenticated
  with check (public.is_org_member(organization_id));

-- Modification : les membres de l'organisation peuvent modifier un paiement.
create policy "payments_update_member"
  on public.payments for update
  to authenticated
  using (public.is_org_member(organization_id));

-- Suppression : les membres de l'organisation peuvent supprimer un paiement.
create policy "payments_delete_member"
  on public.payments for delete
  to authenticated
  using (public.is_org_member(organization_id));

-- Grants minimaux côté client.
revoke all on public.payments from anon;
revoke all on public.payments from public;
grant select, insert, update, delete on public.payments to authenticated;
