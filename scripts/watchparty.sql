-- Assistir em Grupo: salas sincronizadas + chat.

create table if not exists public.watch_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid references public.movies(id) on delete set null,
  title text not null,
  video_url text not null,
  is_playing boolean not null default false,
  position numeric not null default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.watch_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  body text not null,
  created_at timestamptz default now()
);

alter table public.watch_rooms enable row level security;
alter table public.watch_room_messages enable row level security;

-- Qualquer pessoa logada pode ver/entrar numa sala pelo código; só o host
-- pode atualizar o estado de reprodução; qualquer um pode criar sua própria sala.
drop policy if exists "watch_rooms_select_all" on public.watch_rooms;
create policy "watch_rooms_select_all" on public.watch_rooms for select using (true);

drop policy if exists "watch_rooms_insert_own" on public.watch_rooms;
create policy "watch_rooms_insert_own" on public.watch_rooms for insert with check (auth.uid() = host_id);

drop policy if exists "watch_rooms_update_host" on public.watch_rooms;
create policy "watch_rooms_update_host" on public.watch_rooms for update using (auth.uid() = host_id);

drop policy if exists "watch_room_messages_select_all" on public.watch_room_messages;
create policy "watch_room_messages_select_all" on public.watch_room_messages for select using (true);

drop policy if exists "watch_room_messages_insert_own" on public.watch_room_messages;
create policy "watch_room_messages_insert_own" on public.watch_room_messages for insert with check (auth.uid() = user_id);

create index if not exists watch_room_messages_room_idx on public.watch_room_messages(room_id, created_at);

NOTIFY pgrst, 'reload schema';
