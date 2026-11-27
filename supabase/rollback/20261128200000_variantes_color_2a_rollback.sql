-- =============================================================================
-- Rollback de 20261128200000_variantes_color_2a.sql
--
-- No borra datos. Quita la función de guardado atómico, el trigger de total,
-- las restricciones y los índices. Se conservan las columnas sku y sort_order
-- con lo que se haya cargado, todos los colores y las cantidades de products.
-- El código anterior ignora esas columnas. Para volver a 2a basta con ejecutar
-- otra vez la migración (es idempotente).
-- =============================================================================

begin;

drop function if exists public.save_product_with_variants(uuid, timestamptz, jsonb, jsonb);
drop trigger if exists product_colors_sync_total on public.product_colors;
drop function if exists public.product_colors_sync_total();

alter table public.product_colors drop constraint if exists product_colors_name_not_blank;
alter table public.product_colors drop constraint if exists product_colors_stock_non_negative;

drop index if exists public.idx_product_colors_product_sort;
drop index if exists public.product_colors_product_slug_key;
drop index if exists public.product_colors_sku_key;

commit;
