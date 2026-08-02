-- Perfis reais de usuário + avaliações/comentários sobre filmes.
-- Rode isso no SQL editor do seu projeto Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  favorite_genres text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  rating numeric not null check (rating >= 0 and rating <= 10),
  body text,
  created_at timestamptz default now(),
  unique (user_id, movie_id)
);

alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

-- Perfis: leitura pública (é isso que permite a busca/pesquisa de perfis),
-- escrita só pelo dono.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Reviews: leitura pública, escrita/edição/remoção só pelo autor.
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

create index if not exists reviews_movie_id_idx on public.reviews(movie_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
