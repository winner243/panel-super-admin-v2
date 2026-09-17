-- 0006_auth_bootstrap.sql
-- Création automatique du profil à l'inscription (auth.users -> profiles)
-- et limites d'exécution de la fonction de trigger.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- L'exécution directe de la fonction est interdite aux rôles exposés :
-- le trigger s'exécute via l'insertion interne à auth.users.
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;