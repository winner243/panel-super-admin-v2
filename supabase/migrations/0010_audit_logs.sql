-- 0010_audit_logs.sql
-- Journal d'audit générique des événements administratifs du Panel.
-- Append-only : aucune politique UPDATE/DELETE n'est accordée aux clients.
-- Isolation organisationnelle : un membre ne voit que les événements de ses
-- organisations ; les événements personnels ne sont visibles que par leur acteur.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  status text not null default 'success',
  metadata jsonb not null default '{}'::jsonb,
  constraint audit_logs_action_format check (action ~ '^[a-z0-9]+(\.[a-z0-9]+)+$'),
  constraint audit_logs_resource_type_format check (resource_type is null or resource_type ~ '^[a-z0-9_]+$'),
  constraint audit_logs_status_check check (status in ('success', 'failed')),
  constraint audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index audit_logs_organization_created_idx
  on public.audit_logs (organization_id, created_at desc);

create index audit_logs_actor_created_idx
  on public.audit_logs (actor_id, created_at desc);

alter table public.audit_logs enable row level security;

-- Insertion : l'acteur doit être l'utilisateur courant ; un événement rattaché
-- à une organisation exige que l'acteur en soit membre (anti-usurpation et
-- anti-pollution du journal d'une organisation tierce).
create policy "audit_logs_insert_own"
  on public.audit_logs for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and (
      organization_id is null
      or public.is_org_member(organization_id)
    )
  );

-- Lecture des événements organisationnels : réservée aux membres de l'organisation.
create policy "audit_logs_select_org"
  on public.audit_logs for select
  to authenticated
  using (
    organization_id is not null
    and public.is_org_member(organization_id)
  );

-- Lecture des événements personnels : réservée à l'acteur lui-même.
create policy "audit_logs_select_own"
  on public.audit_logs for select
  to authenticated
  using (
    organization_id is null
    and actor_id = auth.uid()
  );

-- Aucune politique UPDATE/DELETE : le journal est append-only.
-- Revocation par défaut, accès minimaux côté client.
revoke all on public.audit_logs from anon;
revoke all on public.audit_logs from public;
grant select, insert on public.audit_logs to authenticated;