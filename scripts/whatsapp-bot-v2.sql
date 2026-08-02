-- Bot de WhatsApp: vínculo de conta via código (OTP) + histórico de conversa.

create table if not exists public.whatsapp_links (
  phone text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  linked_at timestamptz default now()
);

create table if not exists public.whatsapp_otp (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.whatsapp_links enable row level security;
alter table public.whatsapp_otp enable row level security;
alter table public.whatsapp_messages enable row level security;

-- Só o próprio dono da conta pode ver/gerenciar o vínculo do número dele;
-- o backend do bot usa a service role key e ignora RLS.
drop policy if exists "whatsapp_links_own" on public.whatsapp_links;
create policy "whatsapp_links_own" on public.whatsapp_links for select using (auth.uid() = user_id);

drop policy if exists "whatsapp_links_delete_own" on public.whatsapp_links;
create policy "whatsapp_links_delete_own" on public.whatsapp_links for delete using (auth.uid() = user_id);

create index if not exists whatsapp_messages_phone_idx on public.whatsapp_messages(phone, created_at);

NOTIFY pgrst, 'reload schema';
