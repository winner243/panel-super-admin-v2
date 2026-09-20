-- 0022_background_jobs.sql
-- Table des tâches d'arrière-plan pour les jobs SaaS.

create table public.background_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  type text not null,
  status text not null default 'pending',
  priority text not null default 'normal',
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint background_jobs_status_check check (
    status in ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  constraint background_jobs_priority_check check (
    priority in ('low', 'normal', 'high', 'critical')
  ),
  constraint background_jobs_attempts_check check (attempts >= 0),
  constraint background_jobs_max_attempts_check check (max_attempts between 1 and 10),
  constraint background_jobs_type_length check (char_length(type) between 1 and 100),
  constraint background_jobs_last_error_length check (
    last_error is null or char_length(last_error) <= 500
  ),
  constraint background_jobs_payload_object check (jsonb_typeof(payload) = 'object')
);

comment on table public.background_jobs is
  'Tâches d''arrière-plan (jobs) pour les opérations asynchrones des SaaS connectés.';

create index background_jobs_organization_id_idx on public.background_jobs (organization_id);
create index background_jobs_status_idx on public.background_jobs (status);
create index background_jobs_priority_idx on public.background_jobs (priority);
create index background_jobs_type_idx on public.background_jobs (type);
create index background_jobs_created_at_idx on public.background_jobs (created_at desc);
create index background_jobs_pending_idx on public.background_jobs (status, priority, created_at)
  where status = 'pending';

create trigger set_background_jobs_updated_at
  before update on public.background_jobs
  for each row execute function public.set_updated_at();

alter table public.background_jobs enable row level security;

-- Lecture : réservée aux membres de l'organisation, ou tous les jobs sans org.
create policy "background_jobs_select_member"
  on public.background_jobs for select
  to authenticated
  using (
    organization_id is null
    or public.is_org_member(organization_id)
  );

-- Insertion : les membres de l'organisation peuvent créer un job.
create policy "background_jobs_insert_member"
  on public.background_jobs for insert
  to authenticated
  with check (
    organization_id is null
    or public.is_org_member(organization_id)
  );

-- Modification : les membres de l'organisation peuvent modifier un job.
create policy "background_jobs_update_member"
  on public.background_jobs for update
  to authenticated
  using (
    organization_id is null
    or public.is_org_member(organization_id)
  );

-- Suppression : les membres de l'organisation peuvent supprimer un job.
create policy "background_jobs_delete_member"
  on public.background_jobs for delete
  to authenticated
  using (
    organization_id is null
    or public.is_org_member(organization_id)
  );

-- Grants minimaux côté client.
revoke all on public.background_jobs from anon;
revoke all on public.background_jobs from public;
grant select, insert, update, delete on public.background_jobs to authenticated;
