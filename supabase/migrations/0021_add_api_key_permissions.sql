-- 0021_add_api_key_permissions.sql
-- Ajout des permissions pour les clés API et association aux rôles.

-- Nouvelles permissions.
insert into public.permissions (key, name, description) values
  ('api_keys.read', 'Lire les clés API', 'Consulter les clés API d''une organisation.'),
  ('api_keys.create', 'Créer des clés API', 'Créer une clé API pour une organisation.'),
  ('api_keys.update', 'Modifier les clés API', 'Modifier une clé API.'),
  ('api_keys.delete', 'Supprimer les clés API', 'Supprimer une clé API.');

-- Association aux rôles.
-- owner : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
  and p.key in ('api_keys.read', 'api_keys.create', 'api_keys.update', 'api_keys.delete');

-- admin : toutes les permissions sauf api_keys.delete.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key in ('api_keys.read', 'api_keys.create', 'api_keys.update')
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
  and p.key = 'api_keys.read'
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );
