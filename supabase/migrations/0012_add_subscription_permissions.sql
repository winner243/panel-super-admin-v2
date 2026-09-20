-- 0012_add_subscription_permissions.sql
-- Ajout des permissions pour les abonnements et association aux rôles.

-- Nouvelles permissions.
insert into public.permissions (key, name, description) values
  ('subscriptions.read', 'Lire les abonnements', 'Consulter les abonnements d''une organisation.'),
  ('subscriptions.create', 'Créer des abonnements', 'Créer un nouvel abonnement pour une organisation.'),
  ('subscriptions.update', 'Modifier les abonnements', 'Modifier le statut ou les détails d''un abonnement.'),
  ('subscriptions.delete', 'Supprimer les abonnements', 'Supprimer un abonnement.');

-- Association aux rôles.
-- owner : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
  and p.key in ('subscriptions.read', 'subscriptions.create', 'subscriptions.update', 'subscriptions.delete');

-- admin : toutes les permissions sauf subscriptions.delete (gestion complète).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key in ('subscriptions.read', 'subscriptions.create', 'subscriptions.update')
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
  and p.key = 'subscriptions.read'
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );