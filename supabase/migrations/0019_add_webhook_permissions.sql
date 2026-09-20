-- 0019_add_webhook_permissions.sql
-- Ajout des permissions pour les webhooks et association aux rôles.

-- Nouvelles permissions.
insert into public.permissions (key, name, description) values
  ('webhooks.read', 'Lire les webhooks', 'Consulter les webhooks d''une organisation.'),
  ('webhooks.create', 'Créer des webhooks', 'Créer un webhook pour une organisation.'),
  ('webhooks.update', 'Modifier les webhooks', 'Modifier un webhook.'),
  ('webhooks.delete', 'Supprimer les webhooks', 'Supprimer un webhook.');

-- Association aux rôles.
-- owner : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
  and p.key in ('webhooks.read', 'webhooks.create', 'webhooks.update', 'webhooks.delete');

-- admin : toutes les permissions sauf webhooks.delete.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key in ('webhooks.read', 'webhooks.create', 'webhooks.update')
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
  and p.key = 'webhooks.read'
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );
