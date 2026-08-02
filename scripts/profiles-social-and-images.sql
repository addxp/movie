-- Parte 2: foto de capa + seguir pessoas.
-- Rode isso no SQL editor do Supabase (depois do profiles-and-reviews.sql).

alter table public.profiles add column if not exists cover_url text;

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all" on public.follows for select using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows for delete using (auth.uid() = follower_id);

-- Bucket público de imagens de perfil (avatar + capa).
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

-- Qualquer um pode ver as imagens (bucket público); só o dono da pasta
-- (nomeada com o próprio user id) pode enviar/atualizar/remover.
drop policy if exists "profile_images_read" on storage.objects;
create policy "profile_images_read" on storage.objects for select
  using (bucket_id = 'profile-images');

drop policy if exists "profile_images_write_own" on storage.objects;
create policy "profile_images_write_own" on storage.objects for insert
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "profile_images_update_own" on storage.objects;
create policy "profile_images_update_own" on storage.objects for update
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "profile_images_delete_own" on storage.objects;
create policy "profile_images_delete_own" on storage.objects for delete
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

NOTIFY pgrst, 'reload schema';
