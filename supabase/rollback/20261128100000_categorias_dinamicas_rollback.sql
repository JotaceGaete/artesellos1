-- =============================================================================
-- Rollback de 20261128100000_categorias_dinamicas.sql
--
-- No borra datos. Quita solo la lógica nueva (triggers, funciones, índices y
-- restricciones). Se conservan:
--   * las columnas sort_order e is_active, con lo que se haya cargado;
--   * todas las categorías, incluidas las creadas después de publicar;
--   * products.categories tal como esté.
-- El código anterior ignora esas columnas y filas, así que convive con ellas.
-- Para volver a la Fase 1 basta con ejecutar otra vez la migración (es idempotente).
-- =============================================================================

begin;

drop trigger if exists categories_guard_in_use on public.categories;
drop trigger if exists categories_guard_hierarchy on public.categories;
drop function if exists public.categories_guard_in_use();
drop function if exists public.categories_guard_hierarchy();

alter table public.categories drop constraint if exists categories_slug_format;
alter table public.categories drop constraint if exists categories_name_not_blank;
alter table public.categories drop constraint if exists categories_parent_not_self;

drop index if exists public.idx_categories_parent_sort;
drop index if exists public.idx_products_categories_gin;

commit;
