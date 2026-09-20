-- 0017_add_notification_permissions.sql
-- Ajout des permissions pour les notifications et association aux rôles.

-- Nouvelles permissions.
insert into public.permissions (key, name, description) values
  ('notifications.read', 'Lire les notifications', 'Consulter les notifications.'),
  ('notifications.create', 'Créer des notifications', 'Créer une notification pour un utilisateur.'),
  ('notifications.update', 'Modifier les notifications', 'Modifier le statut d''une notification.'),
  ('notifications.delete', 'Supprimer les notifications', 'Supprimer une notification.');

-- Association aux rôles.
-- owner : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
  and p.key in ('notifications.read', 'notifications.create', 'notifications.update', 'notifications.delete');

-- admin : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key in ('notifications.read', 'notifications.create', 'notifications.update', 'notifications.delete')
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
  and p.key = 'notifications.read'
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );
