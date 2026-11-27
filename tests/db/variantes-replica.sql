-- Réplica mínima de products y product_colors (columnas reales, 27-nov-2026)
-- con Shiny S-722 y sus 4 colores reales, más un producto sin colores.
create extension if not exists pgcrypto;
drop table if exists public.product_colors cascade;
drop table if exists public.products cascade;

create or replace function public.update_updated_at_column() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text, short_description text,
  price numeric not null default 0, regular_price numeric, sale_price numeric, on_sale boolean default false,
  images text, categories jsonb default '[]', attributes jsonb default '[]',
  stock_status text default 'instock' check (stock_status in ('instock','outofstock','onbackorder')),
  stock_quantity integer default 0, weight numeric, dimensions jsonb, tags jsonb default '[]',
  featured boolean default false, created_at timestamptz default now(), updated_at timestamptz default now(),
  stamp_info jsonb, customization_options jsonb
);
create trigger update_products_updated_at before update on public.products for each row execute function public.update_updated_at_column();

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_slug text not null, color_name text not null, hex text, image_url text,
  stock_quantity integer not null default 0, is_default boolean not null default false,
  price_diff integer not null default 0, active boolean not null default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index idx_product_colors_product on public.product_colors(product_id);
create trigger set_timestamp_product_colors before update on public.product_colors for each row execute function public.set_updated_at();

insert into public.products (id, name, slug, price, regular_price, images, categories, stock_quantity) values
 ('11111111-1111-1111-1111-111111111722','Shiny S-722','shiny-s-722',16000,16000,'["https://media.artesellos.cl/modelos/722-azul-tr.png"]','["bolsillo"]',9),
 ('22222222-2222-2222-2222-222222222016','Traxx 916','traxx-9016',16000,16000,'["https://media.artesellos.cl/x.jpg"]','["automaticos"]',10);
insert into public.product_colors (id, product_id, color_slug, color_name, hex, image_url, stock_quantity) values
 ('ff17da17-c7b4-4f53-b6ef-67e3c70314d4','11111111-1111-1111-1111-111111111722','lila','Lila','#cc007e','https://artesellos.cl/colores/Lila.png',3),
 ('43422018-f2d7-4c7f-b9fc-a7ef96843234','11111111-1111-1111-1111-111111111722','dorado','Dorado','#8b694d','https://artesellos.cl/colores/dorado.png',3),
 ('2b29ea5b-c5e4-4d46-bc5d-835ae4471f4d','11111111-1111-1111-1111-111111111722','Rosa','Rosa','#e48dc2','https://artesellos.cl/colores/rosa.png',3),
 ('c154557e-74c1-46b3-9e40-deb34babef22','11111111-1111-1111-1111-111111111722','rojo-transparente','Rojo Transparente','#760505','https://artesellos.cl/colores/burdeos.png',3);
