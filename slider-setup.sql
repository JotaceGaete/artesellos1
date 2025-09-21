-- Tabla de slides del home
create table if not exists public.slider_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text default ''::text,
  description text default ''::text,
  button_text text default ''::text,
  button_link text default '/'::text,
  background_color text default 'bg-gradient-to-r from-indigo-600 to-purple-600',
  text_color text default 'text-white',
  image_url text,
  slide_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_slider_slides_active on public.slider_slides(active);
create index if not exists idx_slider_slides_order on public.slider_slides(slide_order);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_slider_slides on public.slider_slides;
create trigger set_timestamp_slider_slides
before update on public.slider_slides
for each row execute function public.set_updated_at();

-- RLS
alter table public.slider_slides enable row level security;

-- Lectura pública
do $$ begin
  create policy "Slides públicos" on public.slider_slides
  for select using (true);
exception when duplicate_object then null; end $$;

-- Insert/update bloqueados para authenticated (se usa service role en admin)
do $$ begin
  create policy "Insert bloqueado" on public.slider_slides
  for insert to authenticated with check (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Update bloqueado" on public.slider_slides
  for update to authenticated using (false) with check (false);
exception when duplicate_object then null; end $$;


