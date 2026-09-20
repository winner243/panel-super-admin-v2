-- 0016_notifications.sql
-- Table des notifications genériques pour les SaaS connectés.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  channel text not null default 'in_app',
  status text not null default 'unread',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (
    type in ('system', 'billing', 'security', 'membership', 'subscription', 'payment', 'custom')
  ),
  constraint notifications_channel_check check (
    channel in ('in_app', 'email', 'sms', 'push')
  ),
  constraint notifications_status_check check (
    status in ('unread', 'read', 'archived')
  ),
  constraint notifications_title_length check (char_length(title) between 1 and 200),
  constraint notifications_message_length check (char_length(message) between 1 and 2000),
  constraint notifications_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.notifications is
  'Notifications generiques pour les SaaS connectés. Canal in_app, email, sms ou push.';

create index notifications_recipient_id_idx on public.notifications (recipient_id);
create index notifications_organization_id_idx on public.notifications (organization_id);
create index notifications_status_idx on public.notifications (status);
create index notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

-- Lecture : un utilisateur ne lit que ses propres notifications.
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (recipient_id = auth.uid());

-- Insertion : tout utilisateur authentifié peut créer (via service/adapter).
create policy "notifications_insert_authenticated"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Modification : un utilisateur ne modifie que ses propres notifications.
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (recipient_id = auth.uid());

-- Suppression : un utilisateur ne supprime que ses propres notifications.
create policy "notifications_delete_own"
  on public.notifications for delete
  to authenticated
  using (recipient_id = auth.uid());

-- Grants minimaux côté client.
revoke all on public.notifications from anon;
revoke all on public.notifications from public;
grant select, insert, update, delete on public.notifications to authenticated;
