-- =============================================================================
-- Fase 1 — Categorías dinámicas (Artesellos)
--
-- Solo agrega: columnas, restricciones, triggers, un índice y 3 filas.
-- No borra datos ni toca products (los productos siguen guardando slugs en
-- products.categories). Idempotente: puede ejecutarse más de una vez.
-- Rollback: supabase/rollback/20261128100000_categorias_dinamicas_rollback.sql
-- =============================================================================

begin;

-- 1. Orden y estado -----------------------------------------------------------
alter table public.categories add column if not exists sort_order integer not null default 0;
alter table public.categories add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'categories_parent_not_self') then
    alter table public.categories
      add constraint categories_parent_not_self check (parent_id is null or parent_id <> id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'categories_name_not_blank') then
    alter table public.categories
      add constraint categories_name_not_blank check (length(btrim(name)) > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'categories_slug_format') then
    alter table public.categories
      add constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

-- 2. Jerarquía de un solo nivel (impide ciclos) ----------------------------------
-- Una subcategoría solo puede colgar de una categoría raíz, y una categoría con
-- subcategorías no puede pasar a ser subcategoría. Con un nivel no hay ciclos posibles.
create or replace function public.categories_guard_hierarchy()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_parent_parent uuid;
begin
  if new.parent_id is null then
    return new;
  end if;
  if new.parent_id = new.id then
    raise exception 'Una categoría no puede ser su propia categoría padre' using errcode = '23514';
  end if;
  select parent_id into v_parent_parent from public.categories where id = new.parent_id;
  if not found then
    raise exception 'La categoría padre no existe' using errcode = '23503';
  end if;
  if v_parent_parent is not null then
    raise exception 'Solo se permite un nivel de subcategorías' using errcode = '23514';
  end if;
  if exists (select 1 from public.categories c where c.parent_id = new.id) then
    raise exception 'Una categoría con subcategorías no puede ser subcategoría' using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists categories_guard_hierarchy on public.categories;
create trigger categories_guard_hierarchy
  before insert or update of parent_id on public.categories
  for each row execute function public.categories_guard_hierarchy();

-- 3. Protección de categorías en uso ---------------------------------------------
-- No se borra una categoría con productos o subcategorías, ni se cambia el slug de
-- una categoría con productos (rompería filtros y enlaces).
create or replace function public.categories_guard_in_use()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_count integer;
begin
  if tg_op = 'DELETE' then
    select count(*) into v_count from public.products p
      where p.categories @> jsonb_build_array(old.slug);
    if v_count > 0 then
      raise exception 'La categoría "%" tiene % producto(s) asociado(s)', old.slug, v_count using errcode = '23503';
    end if;
    if exists (select 1 from public.categories c where c.parent_id = old.id) then
      raise exception 'La categoría "%" tiene subcategorías', old.slug using errcode = '23503';
    end if;
    return old;
  end if;

  if new.slug is distinct from old.slug then
    select count(*) into v_count from public.products p
      where p.categories @> jsonb_build_array(old.slug);
    if v_count > 0 then
      raise exception 'No se puede cambiar el slug de "%": tiene % producto(s)', old.slug, v_count using errcode = '23503';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists categories_guard_in_use on public.categories;
create trigger categories_guard_in_use
  before delete or update of slug on public.categories
  for each row execute function public.categories_guard_in_use();

-- 4. Índice para contar productos por categoría ---------------------------------
create index if not exists idx_products_categories_gin
  on public.products using gin (categories jsonb_path_ops);

create index if not exists idx_categories_parent_sort
  on public.categories (parent_id, sort_order);

-- 5. Datos: categorías que hoy existen solo en código ----------------------------
-- Mismos nombres visibles y mismo orden que src/lib/catalogCategories.ts.
insert into public.categories (name, slug, description, sort_order, is_active)
values
  ('Automáticos', 'automaticos', null, 10, true),
  ('Fechadores',  'fechadores',  null, 30, true),
  ('Redondos',    'redondos',    null, 40, true)
on conflict (slug) do nothing;

update public.categories
   set name = 'De bolsillo', sort_order = 20, is_active = true
 where slug = 'bolsillo' and name = 'Bolsillo';

-- Las 7 categorías antiguas se ocultan; no se borran.
update public.categories
   set is_active = false
 where slug in ('romanticos', 'celebraciones', 'infantiles', 'bodas', 'festivos', 'personalizados', 'corporativos')
   and is_active = true;

commit;
