-- =============================================================================
-- Fase 2a — Variantes por color de carcasa (Artesellos)
--
-- Solo agrega: 2 columnas en product_colors, índices, una restricción, un
-- trigger de total y una función de guardado atómico. No escribe ninguna fila
-- de products ni de product_colors. Idempotente.
-- Rollback: supabase/rollback/20261128200000_variantes_color_2a_rollback.sql
--
-- Reglas:
--  * products.stock_quantity de un producto con colores = suma del stock físico
--    de TODOS sus colores (los ocultos conservan sus existencias). Se recalcula
--    solo cuando cambia algún color; editar el producto no lo toca.
--  * Sin colores, el stock se edita en el producto como hasta ahora.
--  * El guardado del producto y sus colores es todo o nada, con control de
--    concurrencia por products.updated_at.
-- =============================================================================

begin;

-- 1. Columnas e índices --------------------------------------------------------
alter table public.product_colors add column if not exists sku text;
alter table public.product_colors add column if not exists sort_order integer not null default 0;

create unique index if not exists product_colors_sku_key
  on public.product_colors (sku) where sku is not null;

-- Un mismo color no se repite en un producto (sin distinguir mayúsculas).
create unique index if not exists product_colors_product_slug_key
  on public.product_colors (product_id, lower(color_slug));

create index if not exists idx_product_colors_product_sort
  on public.product_colors (product_id, sort_order);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_colors_stock_non_negative') then
    alter table public.product_colors
      add constraint product_colors_stock_non_negative check (stock_quantity >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_colors_name_not_blank') then
    alter table public.product_colors
      add constraint product_colors_name_not_blank check (length(btrim(color_name)) > 0);
  end if;
end $$;

-- 2. Stock total = suma de los colores -----------------------------------------
create or replace function public.product_colors_sync_total()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_product uuid := coalesce(new.product_id, old.product_id);
begin
  -- Al borrar un producto, sus colores se borran en cascada: no hay total que mantener.
  if tg_op = 'DELETE' and pg_trigger_depth() > 1
     and not exists (select 1 from public.products where id = old.product_id) then
    return old;
  end if;

  if exists (select 1 from public.product_colors where product_id = v_product) then
    update public.products p
       set stock_quantity = (select coalesce(sum(c.stock_quantity), 0)
                               from public.product_colors c where c.product_id = v_product)
     where p.id = v_product;
  end if;

  -- Si un color cambió de producto, también se recalcula el anterior.
  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id
     and exists (select 1 from public.product_colors where product_id = old.product_id) then
    update public.products p
       set stock_quantity = (select coalesce(sum(c.stock_quantity), 0)
                               from public.product_colors c where c.product_id = old.product_id)
     where p.id = old.product_id;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists product_colors_sync_total on public.product_colors;
create trigger product_colors_sync_total
  after insert or update of stock_quantity, product_id or delete on public.product_colors
  for each row execute function public.product_colors_sync_total();

-- 3. Guardado atómico del producto y sus colores --------------------------------
-- p_product: columnas a actualizar (las ausentes no se tocan). Si el producto
--            tiene colores, stock_quantity enviado se ignora.
-- p_variants: null = no tocar los colores; lista = estado completo deseado
--             (los que no vienen se eliminan, los que traen id se actualizan,
--             los nuevos se crean).
-- p_expected_updated_at: si no coincide con products.updated_at, error 40001.
create or replace function public.save_product_with_variants(
  p_product_id uuid,
  p_expected_updated_at timestamptz,
  p_product jsonb,
  p_variants jsonb
)
returns jsonb
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_current public.products%rowtype;
  v_item jsonb;
  v_ids uuid[] := '{}';
  v_idx integer := 0;
  v_has_colors boolean;
  v_result jsonb;
begin
  select * into v_current from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Producto no encontrado' using errcode = 'P0002';
  end if;
  if p_expected_updated_at is not null
     and date_trunc('milliseconds', v_current.updated_at) <> date_trunc('milliseconds', p_expected_updated_at) then
    raise exception 'El producto fue modificado por otra persona. Recarga para ver los cambios.' using errcode = '40001';
  end if;

  -- Colores primero: así se sabe si el producto queda con colores.
  if p_variants is not null then
    if jsonb_typeof(p_variants) <> 'array' then
      raise exception 'Los colores deben ser una lista' using errcode = '22023';
    end if;

    for v_item in select value from jsonb_array_elements(p_variants) loop
      if v_item ? 'id' and nullif(v_item->>'id', '') is not null then
        v_ids := v_ids || (v_item->>'id')::uuid;
      end if;
    end loop;

    delete from public.product_colors
     where product_id = p_product_id
       and not (id = any (v_ids));

    for v_item in select value from jsonb_array_elements(p_variants) loop
      v_idx := v_idx + 1;
      if v_item ? 'id' and nullif(v_item->>'id', '') is not null then
        update public.product_colors set
          color_name     = v_item->>'color_name',
          color_slug     = v_item->>'color_slug',
          hex            = nullif(v_item->>'hex', ''),
          image_url      = nullif(v_item->>'image_url', ''),
          sku            = nullif(v_item->>'sku', ''),
          stock_quantity = (v_item->>'stock_quantity')::integer,
          active         = coalesce((v_item->>'active')::boolean, true),
          sort_order     = v_idx * 10
        where id = (v_item->>'id')::uuid and product_id = p_product_id;
        if not found then
          raise exception 'El color % no pertenece a este producto', v_item->>'id' using errcode = '22023';
        end if;
      else
        insert into public.product_colors
          (product_id, color_name, color_slug, hex, image_url, sku, stock_quantity, active, sort_order)
        values
          (p_product_id, v_item->>'color_name', v_item->>'color_slug', nullif(v_item->>'hex', ''),
           nullif(v_item->>'image_url', ''), nullif(v_item->>'sku', ''),
           (v_item->>'stock_quantity')::integer, coalesce((v_item->>'active')::boolean, true), v_idx * 10);
      end if;
    end loop;
  end if;

  v_has_colors := exists (select 1 from public.product_colors where product_id = p_product_id);

  if p_product is not null and p_product <> '{}'::jsonb then
    update public.products set
      name              = case when p_product ? 'name' then p_product->>'name' else name end,
      slug              = case when p_product ? 'slug' then p_product->>'slug' else slug end,
      price             = case when p_product ? 'price' then (p_product->>'price')::numeric else price end,
      regular_price     = case when p_product ? 'regular_price' then (p_product->>'regular_price')::numeric else regular_price end,
      on_sale           = case when p_product ? 'on_sale' then (p_product->>'on_sale')::boolean else on_sale end,
      description       = case when p_product ? 'description' then p_product->>'description' else description end,
      short_description = case when p_product ? 'short_description' then p_product->>'short_description' else short_description end,
      images            = case when p_product ? 'images' then p_product->>'images' else images end,
      categories        = case when p_product ? 'categories' then p_product->'categories' else categories end,
      tags              = case when p_product ? 'tags' then p_product->'tags' else tags end,
      featured          = case when p_product ? 'featured' then (p_product->>'featured')::boolean else featured end,
      stock_status      = case when p_product ? 'stock_status' then p_product->>'stock_status' else stock_status end,
      stock_quantity    = case when p_product ? 'stock_quantity' and not v_has_colors
                               then (p_product->>'stock_quantity')::integer else stock_quantity end
    where id = p_product_id;
  end if;

  select jsonb_build_object(
    'product', to_jsonb(p.*),
    'variants', coalesce((select jsonb_agg(to_jsonb(c.*) order by c.sort_order, c.created_at)
                            from public.product_colors c where c.product_id = p.id), '[]'::jsonb)
  ) into v_result
  from public.products p where p.id = p_product_id;

  return v_result;
end $$;

revoke all on function public.save_product_with_variants(uuid, timestamptz, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_product_with_variants(uuid, timestamptz, jsonb, jsonb) to service_role;

commit;
