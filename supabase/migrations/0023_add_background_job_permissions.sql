-- 0023_add_background_job_permissions.sql
-- Ajout des permissions pour les tâches d'arrière-plan et association aux rôles.

-- Nouvelles permissions.
insert into public.permissions (key, name, description) values
  ('jobs.read', 'Lire les tâches', 'Consulter les tâches d''arrière-plan d''une organisation.'),
  ('jobs.create', 'Créer des tâches', 'Créer une tâche d''arrière-plan pour une organisation.'),
  ('jobs.update', 'Modifier les tâches', 'Modifier une tâche d''arrière-plan.'),
  ('jobs.delete', 'Supprimer les tâches', 'Supprimer une tâche d''arrière-plan.');

-- Association aux rôles.
-- owner : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
  and p.key in ('jobs.read', 'jobs.create', 'jobs.update', 'jobs.delete');

-- admin : toutes les permissions sauf jobs.delete.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key in ('jobs.read', 'jobs.create', 'jobs.update')
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );

-- member : lecture seule.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'member'
  and p.key = 'jobs.read'
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );
