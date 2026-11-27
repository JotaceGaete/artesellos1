-- Réplica mínima de producción (27-nov-2026) para probar la migración de categorías.
-- Columnas reales de public.categories y la columna categories de public.products.
create extension if not exists pgcrypto;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;

create or replace function public.update_updated_at_column() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text,
  parent_id uuid references public.categories(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent_id on public.categories(parent_id);
create trigger update_categories_updated_at before update on public.categories
  for each row execute function public.update_updated_at_column();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  price numeric not null default 0,
  stock_quantity integer default 0,
  images text,
  categories jsonb default '[]'::jsonb
);

insert into public.categories (id, name, slug, description) values
  ('105c5218-1c10-45bb-b1f4-7d70acbf2049','Románticos','romanticos','Timbres para ocasiones románticas y aniversarios'),
  ('3c811e11-016e-4f5a-af02-2e0c09981134','Celebraciones','celebraciones','Timbres para cumpleaños y fiestas'),
  ('43944d48-a15d-4742-b272-da1b782b50e1','Infantiles','infantiles','Timbres para bebés y niños'),
  ('8af0acb4-d6fb-40f5-bcd6-fcaceb5f6829','Bodas','bodas','Timbres elegantes para invitaciones matrimoniales'),
  ('490132c7-4930-48fc-ba01-d4eccb1785a2','Festivos','festivos','Timbres para Navidad y otras celebraciones'),
  ('d0242e00-34c1-4282-aa64-8c3a783d38e8','Personalizados','personalizados','Timbres completamente personalizados'),
  ('5984954e-17f1-4f89-920a-95e9003a0453','Corporativos','corporativos','Timbres para empresas y eventos corporativos'),
  ('0888b909-d29d-40ee-8e3b-8e2a84b65271','Bolsillo','bolsillo','Timbres de Bolsillo');

insert into public.products (slug, categories) values
 ('automatik-913','["automaticos"]'),('AUTOMATIK-940a','["automaticos"]'),('automatik-945','["automaticos"]'),
 ('automatik-953','["automaticos"]'),('foliador-f-65','["automaticos","fechadores"]'),('shiny-829-fechador','["fechadores"]'),
 ('shiny-832','["automaticos"]'),('shiny-833','["automaticos"]'),('shiny-837','["automaticos"]'),
 ('shiny-837-fechador','["fechadores"]'),('shiny-842','["automaticos"]'),('shiny-915-fechador','["fechadores"]'),
 ('shiny-R-532','["automaticos"]'),('shiny-s-224','["automaticos"]'),('shiny-s-722','["bolsillo"]'),
 ('shiny-s-723','["bolsillo"]'),('shiny-s-829','["automaticos"]'),('shiny-s-841','["automaticos"]'),
 ('traxx-9011','["automaticos"]'),('traxx-9016','["automaticos"]'),('traxx-9045','["redondos"]'),
 ('traxx-9130','["redondos"]'),('trodat-4912','["automaticos"]'),('trodat-4915','["automaticos"]'),
 ('trodat-9511','["bolsillo"]'),('trodat-printy-3911','["automaticos"]'),('trodat-printy-4910','["automaticos"]');
