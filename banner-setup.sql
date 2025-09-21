-- Tabla para mensajes de banner superior (ticker)
create table if not exists public.top_banner_messages (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  url text,
  active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_top_banner_active on public.top_banner_messages(active);
create index if not exists idx_top_banner_order on public.top_banner_messages(order_index);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_top_banner on public.top_banner_messages;
create trigger set_timestamp_top_banner
before update on public.top_banner_messages
for each row execute function public.set_updated_at();

alter table public.top_banner_messages enable row level security;

-- Lectura pública
do $$ begin
  create policy "Top banner público" on public.top_banner_messages for select using (true);
exception when duplicate_object then null; end $$;

-- Escritura bloqueada (admin por service role)
do $$ begin
  create policy "Top banner insert bloqueado" on public.top_banner_messages for insert to authenticated with check (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Top banner update bloqueado" on public.top_banner_messages for update to authenticated using (false) with check (false);
exception when duplicate_object then null; end $$;


