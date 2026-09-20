-- 0014_add_payment_permissions.sql
-- Ajout des permissions pour les paiements et association aux rôles.

-- Nouvelles permissions.
insert into public.permissions (key, name, description) values
  ('payments.read', 'Lire les paiements', 'Consulter les paiements d''une organisation.'),
  ('payments.create', 'Créer des paiements', 'Créer un paiement pour une organisation.'),
  ('payments.update', 'Modifier les paiements', 'Modifier le statut ou les détails d''un paiement.'),
  ('payments.delete', 'Supprimer les paiements', 'Supprimer un paiement.');

-- Association aux rôles.
-- owner : toutes les permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'owner'
  and p.key in ('payments.read', 'payments.create', 'payments.update', 'payments.delete');

-- admin : toutes les permissions sauf payments.delete.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key in ('payments.read', 'payments.create', 'payments.update')
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
  and p.key = 'payments.read'
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );
