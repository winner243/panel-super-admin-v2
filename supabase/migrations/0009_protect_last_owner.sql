-- 0009_protect_last_owner.sql
-- Protection du dernier propriétaire d'une organisation au niveau base de
-- données, en complément des gardes applicatives (UI + Server Actions).
-- Empêche qu'une organisation se retrouve sans aucun propriétaire par
-- suppression ou rétrogradation, y compris via un accès direct à l'API/RLS.

create or replace function public.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
  remaining_owners integer;
begin
  select id into owner_role_id
  from public.roles
  where name = 'owner';

  if owner_role_id is null then
    return coalesce(new, old);
  end if;

  -- Seules la suppression d'un propriétaire et sa rétrogradation vers un rôle
  -- non propriétaire sont concernées.
  if tg_op = 'DELETE' then
    if old.role_id <> owner_role_id then
      return old;
    end if;
  else
    if old.role_id <> owner_role_id or new.role_id = owner_role_id then
      return new;
    end if;
  end if;

  -- Verrou logique par organisation pour éviter une course entre deux
  -- opérations concurrentes qui laisseraient zéro propriétaire.
  perform 1
  from public.organizations
  where id = old.organization_id
  for update;

  select count(*) into remaining_owners
  from public.organization_members m
  where m.organization_id = old.organization_id
    and m.user_id <> old.user_id
    and m.role_id = owner_role_id;

  if remaining_owners = 0 then
    raise exception 'Impossible de retirer ou rétrograder le dernier propriétaire de l''organisation.'
      using errcode = 'P0001';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger protect_last_owner_update
  before update on public.organization_members
  for each row execute function public.protect_last_owner();

create trigger protect_last_owner_delete
  before delete on public.organization_members
  for each row execute function public.protect_last_owner();

-- La fonction ne doit pas être exécutable directement par les rôles exposés :
-- elle s'exécute via les triggers.
revoke all on function public.protect_last_owner() from anon;
revoke all on function public.protect_last_owner() from authenticated;
