-- Parte 3: perfil automático pra TODO mundo que já tem conta (não só quem
-- passou pelo pop-up). Rode depois dos scripts anteriores.

alter table public.profiles add column if not exists claimed boolean default false;

-- Todo perfil que já existia antes desse script só existe porque a pessoa
-- de fato preencheu o formulário (não havia criação automática ainda) —
-- então já conta como "claimed" antes de mexer em mais nada.
update public.profiles set claimed = true where claimed is distinct from true;

-- Gera um username provisório único a partir do e-mail (ou do id, se precisar).
create or replace function public.generate_default_username(base text, uid uuid)
returns text language plpgsql as $$
declare
  candidate text;
  suffix int := 0;
begin
  candidate := regexp_replace(lower(split_part(base, '@', 1)), '[^a-z0-9_]', '', 'g');
  if candidate = '' then candidate := 'user'; end if;
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := regexp_replace(lower(split_part(base, '@', 1)), '[^a-z0-9_]', '', 'g') || suffix::text;
  end loop;
  return candidate;
end;
$$;

-- Trigger: toda vez que alguém cria conta, já ganha uma linha em profiles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, claimed)
  values (new.id, public.generate_default_username(coalesce(new.email, new.id::text), new.id), false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: cria perfil pra quem já tinha conta antes desse script existir.
insert into public.profiles (id, username, claimed)
select u.id, public.generate_default_username(coalesce(u.email, u.id::text), u.id), false
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

NOTIFY pgrst, 'reload schema';
