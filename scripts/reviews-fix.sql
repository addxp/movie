-- Corrige a tabela reviews que já existia com estrutura diferente
-- (mesmo problema que aconteceu com profiles/display_name).

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid()
);

alter table public.reviews add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.reviews add column if not exists movie_id uuid references public.movies(id) on delete cascade;
alter table public.reviews add column if not exists rating numeric;
alter table public.reviews add column if not exists body text;
alter table public.reviews add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_user_movie_key') then
    alter table public.reviews add constraint reviews_user_movie_key unique (user_id, movie_id);
  end if;
end $$;

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
