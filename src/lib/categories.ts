/**
 * Categorías dinámicas (Fase 1). Lógica pura, compartida por API, admin y catálogo.
 *
 * Los productos siguen guardando slugs en products.categories; la tabla
 * `categories` define nombre, orden, estado y jerarquía (un solo nivel).
 */
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryWithCount extends Category {
  product_count: number;
  children_count: number;
}

export interface CategoryNode<T extends Category = Category> extends Category {
  children: T[];
}

/** Respaldo si la migración aún no está aplicada: las 4 categorías que hoy usa el código. */
export const FALLBACK_CATEGORIES: Category[] = CATALOG_CATEGORIES.map((c, i) => ({
  id: `fallback-${c.slug}`,
  name: c.label,
  slug: c.slug,
  description: null,
  parent_id: null,
  sort_order: (i + 1) * 10,
  is_active: true,
}));

export const toSlug = (str: string) =>
  String(str ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const bySortThenName = (a: Category, b: Category) =>
  (a.sort_order - b.sort_order) || a.name.localeCompare(b.name, 'es');

/** Árbol de un nivel: raíces ordenadas, cada una con sus hijas ordenadas. Huérfanas suben a raíz. */
export function buildCategoryTree<T extends Category>(list: T[]): Array<T & { children: T[] }> {
  const ids = new Set(list.map(c => c.id));
  const roots = list.filter(c => !c.parent_id || !ids.has(c.parent_id)).sort(bySortThenName);
  return roots.map(r => ({
    ...r,
    children: list.filter(c => c.parent_id === r.id && c.id !== r.id).sort(bySortThenName),
  }));
}

/**
 * Categorías visibles en el catálogo: activas y, si son subcategorías, con la
 * categoría padre también activa.
 */
export function visibleCategories<T extends Category>(list: T[]): T[] {
  const byId = new Map(list.map(c => [c.id, c]));
  return list.filter(c => {
    if (!c.is_active) return false;
    if (!c.parent_id) return true;
    const parent = byId.get(c.parent_id);
    return !parent || parent.is_active;
  });
}

/** Slugs que abarca un filtro: la categoría y sus subcategorías. */
export function expandCategorySlugs(list: Category[], slugs: string[]): Set<string> {
  const out = new Set<string>();
  for (const slug of slugs) {
    out.add(slug);
    const cat = list.find(c => c.slug === slug);
    if (cat) for (const child of list.filter(c => c.parent_id === cat.id)) out.add(child.slug);
  }
  return out;
}

/** Normaliza un slug de products.categories para compararlo (minúsculas, sin tildes). */
export const normalizeSlug = (s: string) => toSlug(s);

export function productMatchesCategories(productSlugs: string[], wanted: Set<string>): boolean {
  if (wanted.size === 0) return true;
  const normWanted = new Set(Array.from(wanted).map(normalizeSlug));
  return productSlugs.some(s => normWanted.has(normalizeSlug(s)));
}

export function categoryLabelFrom(list: Category[], slug: string): string {
  return list.find(c => c.slug === slug)?.name ?? slug;
}

/** Cuenta productos por slug a partir de products.categories. */
export function countProductsBySlug(products: Array<{ categories?: unknown }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of products) {
    const cats = Array.isArray(p.categories) ? p.categories : [];
    for (const s of new Set(cats.map(c => String(c)))) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return counts;
}

export interface CategoryInput {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  parent_id?: unknown;
  is_active?: unknown;
  sort_order?: unknown;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Valida una alta o edición contra el estado actual. Replica en la API las
 * reglas de los triggers, para dar mensajes claros antes de llegar a la base.
 */
export function validateCategoryInput(
  input: CategoryInput,
  ctx: { all: Category[]; current?: Category; productCount?: number },
): ValidationResult<Partial<Category>> {
  const { all, current } = ctx;
  const patch: Partial<Category> = {};

  if (input.name !== undefined || !current) {
    const name = String(input.name ?? '').trim();
    if (!name) return { ok: false, error: 'El nombre es obligatorio' };
    if (name.length > 80) return { ok: false, error: 'El nombre no puede superar 80 caracteres' };
    patch.name = name;
  }

  if (input.slug !== undefined || !current) {
    const slug = String(input.slug ?? '').trim() || toSlug(String(patch.name ?? current?.name ?? ''));
    if (!SLUG_RE.test(slug)) return { ok: false, error: 'El slug solo puede tener minúsculas, números y guiones' };
    if (all.some(c => c.slug === slug && c.id !== current?.id)) return { ok: false, error: `El slug "${slug}" ya está en uso` };
    if (current && slug !== current.slug && (ctx.productCount ?? 0) > 0) {
      return { ok: false, error: `No se puede cambiar el slug: la categoría tiene ${ctx.productCount} producto(s)` };
    }
    patch.slug = slug;
  }

  if (input.description !== undefined) {
    const d = input.description === null ? '' : String(input.description).trim();
    patch.description = d || null;
  }

  if (input.parent_id !== undefined) {
    const parentId = input.parent_id === null || input.parent_id === '' ? null : String(input.parent_id);
    if (parentId) {
      if (current && parentId === current.id) return { ok: false, error: 'Una categoría no puede ser su propia categoría padre' };
      const parent = all.find(c => c.id === parentId);
      if (!parent) return { ok: false, error: 'La categoría padre no existe' };
      if (parent.parent_id) return { ok: false, error: 'Solo se permite un nivel de subcategorías' };
      if (current && all.some(c => c.parent_id === current.id)) {
        return { ok: false, error: 'Una categoría con subcategorías no puede ser subcategoría' };
      }
    }
    patch.parent_id = parentId;
  }

  if (input.is_active !== undefined) {
    if (typeof input.is_active !== 'boolean') return { ok: false, error: 'is_active debe ser verdadero o falso' };
    patch.is_active = input.is_active;
  }

  if (input.sort_order !== undefined) {
    const n = Number(input.sort_order);
    if (!Number.isInteger(n)) return { ok: false, error: 'sort_order debe ser un número entero' };
    patch.sort_order = n;
  }

  return { ok: true, value: patch };
}

/** Por qué no se puede borrar (o null si se puede). */
export function deleteBlockReason(cat: Category, all: Category[], productCount: number): string | null {
  if (productCount > 0) return `La categoría tiene ${productCount} producto(s) asociado(s). Reasígnalos o ocúltala.`;
  if (all.some(c => c.parent_id === cat.id)) return 'La categoría tiene subcategorías. Muévelas o elimínalas primero.';
  return null;
}

/**
 * Nuevo orden al mover una categoría arriba o abajo entre sus hermanas.
 * Devuelve los sort_order de todas las hermanas, renumerados de 10 en 10.
 */
export function moveCategory(all: Category[], id: string, dir: -1 | 1): Array<{ id: string; sort_order: number }> {
  const cat = all.find(c => c.id === id);
  if (!cat) return [];
  const siblings = all.filter(c => (c.parent_id ?? null) === (cat.parent_id ?? null)).sort(bySortThenName);
  const i = siblings.findIndex(c => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= siblings.length) return [];
  const reordered = [...siblings];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
  return reordered.map((c, idx) => ({ id: c.id, sort_order: (idx + 1) * 10 }));
}

/** Slugs de un producto que no existen como categoría. */
export function unknownCategorySlugs(slugs: string[], all: Category[]): string[] {
  const known = new Set(all.map(c => c.slug));
  return slugs.filter(s => !known.has(s));
}
