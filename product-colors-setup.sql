-- Tabla de variantes por color de carcaza
create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_slug text not null,
  color_name text not null,
  hex text,
  image_url text,
  stock_quantity integer not null default 0,
  is_default boolean not null default false,
  price_diff integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_product_colors_product on public.product_colors(product_id);
create index if not exists idx_product_colors_active on public.product_colors(active);

-- Trigger de updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_product_colors on public.product_colors;
create trigger set_timestamp_product_colors
before update on public.product_colors
for each row execute function public.set_updated_at();

-- RLS
alter table public.product_colors enable row level security;

-- Lectura pública (como productos públicos)
do $$ begin
  create policy "Colores son públicos" on public.product_colors
  for select using (true);
exception when duplicate_object then null; end $$;

-- Escritura solo para service role o futuros ADMIN
do $$ begin
  create policy "Insert por service role" on public.product_colors
  for insert to authenticated with check (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Update por service role" on public.product_colors
  for update to authenticated using (false) with check (false);
exception when duplicate_object then null; end $$;


