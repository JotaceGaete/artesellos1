import { FALLBACK_CATEGORIES, type Category } from '@/lib/categories';

export const CATEGORY_COLUMNS = 'id, name, slug, description, parent_id, sort_order, is_active';

export type CategorySource = 'db' | 'fallback';

/** true si el error viene de que la migración de categorías todavía no está aplicada. */
export function isMissingMigrationError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42703' || error.code === 'PGRST204') return true;
  return /sort_order|is_active/.test(String(error.message ?? ''));
}

function toCategory(row: any): Category {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: row.description ?? null,
    parent_id: row.parent_id ?? null,
    sort_order: Number(row.sort_order) || 0,
    is_active: row.is_active !== false,
  };
}

/**
 * Lee todas las categorías. Si la migración no está aplicada, devuelve las 4
 * categorías del código para que el sitio funcione igual que antes.
 */
export async function loadCategories(supabase: any): Promise<{ categories: Category[]; source: CategorySource }> {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) {
    if (isMissingMigrationError(error)) return { categories: FALLBACK_CATEGORIES, source: 'fallback' };
    throw new Error(error.message || 'Error al leer categorías');
  }
  return { categories: (data ?? []).map(toCategory), source: 'db' };
}

/** Slugs usados por cada producto (solo la columna categories). */
export async function loadProductCategorySlugs(supabase: any): Promise<Array<{ categories: unknown }>> {
  const { data, error } = await supabase.from('products').select('categories');
  if (error) throw new Error(error.message || 'Error al leer productos');
  return data ?? [];
}

/** Traduce los errores de los triggers de la migración a mensajes para el admin. */
export function friendlyDbError(error: { code?: string; message?: string }): { status: number; message: string } {
  const msg = String(error.message ?? 'Error de base de datos');
  if (error.code === '23505') return { status: 409, message: 'Ya existe una categoría con ese slug' };
  if (error.code === '23503' || error.code === '23514') return { status: 409, message: msg };
  return { status: 500, message: msg };
}
