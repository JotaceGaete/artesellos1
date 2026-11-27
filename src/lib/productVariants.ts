/**
 * Variantes por color de carcasa (Fase 2a). Lógica pura compartida por la API,
 * el editor y la detección de cambios pendientes.
 *
 * Reglas:
 *  - Con colores, el stock total del producto es la suma del stock físico de
 *    todos sus colores (los ocultos conservan sus existencias). Lo calcula la base.
 *  - Sin colores, el stock se edita en el producto.
 */
import { toSlug } from '@/lib/categories';

export interface ProductVariant {
  id?: string;
  color_name: string;
  color_slug: string;
  hex: string | null;
  image_url: string | null;
  sku: string | null;
  stock_quantity: number;
  active: boolean;
}

/** Fila del editor: los números se editan como texto. */
export interface VariantFormRow {
  key: string;
  id?: string;
  color_name: string;
  color_slug: string;
  hex: string;
  image_url: string;
  sku: string;
  stock_quantity: string;
  active: boolean;
}

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const SLUG_RE = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/;
const MAX_VARIANTS = 50;

let keySeq = 0;
export const newVariantKey = () => `v${Date.now().toString(36)}${(keySeq++).toString(36)}`;

/** Fila de la base → fila del editor. */
export function variantToFormRow(v: any): VariantFormRow {
  return {
    key: String(v.id ?? newVariantKey()),
    id: v.id ? String(v.id) : undefined,
    color_name: String(v.color_name ?? ''),
    color_slug: String(v.color_slug ?? ''),
    hex: String(v.hex ?? ''),
    image_url: String(v.image_url ?? ''),
    sku: String(v.sku ?? ''),
    stock_quantity: String(v.stock_quantity ?? 0),
    active: v.active !== false,
  };
}

export function emptyVariantRow(): VariantFormRow {
  return { key: newVariantKey(), color_name: '', color_slug: '', hex: '#000000', image_url: '', sku: '', stock_quantity: '0', active: true };
}

/** Forma normalizada (igual a lo que se enviará), para comparar cambios pendientes. */
export function normalizeVariantRows(rows: VariantFormRow[]) {
  return rows.map(r => ({
    id: r.id ?? null,
    color_name: r.color_name.trim(),
    color_slug: (r.color_slug.trim() || toSlug(r.color_name)),
    hex: r.hex.trim().toLowerCase() || null,
    image_url: r.image_url.trim() || null,
    sku: r.sku.trim() || null,
    stock_quantity: Number(String(r.stock_quantity).replace(/\D/g, '')) || 0,
    active: r.active === true,
  }));
}

export type VariantsResult = { ok: true; variants: ProductVariant[] } | { ok: false; error: string };

/**
 * Valida la lista de colores recibida por la API. Rechaza en vez de corregir:
 * nombre vacío, color repetido, SKU repetido, hex mal formado o stock inválido.
 */
export function parseVariantsInput(raw: unknown): VariantsResult {
  if (!Array.isArray(raw)) return { ok: false, error: 'Los colores deben ser una lista' };
  if (raw.length > MAX_VARIANTS) return { ok: false, error: `Máximo ${MAX_VARIANTS} colores por producto` };
  const out: ProductVariant[] = [];
  const slugs = new Set<string>();
  const skus = new Set<string>();
  for (const [i, item] of raw.entries()) {
    if (!item || typeof item !== 'object') return { ok: false, error: `Color ${i + 1}: formato inválido` };
    const v = item as Record<string, unknown>;
    const name = String(v.color_name ?? '').trim();
    if (!name) return { ok: false, error: `Color ${i + 1}: el nombre es obligatorio` };
    if (name.length > 60) return { ok: false, error: `Color «${name}»: nombre demasiado largo` };
    const slug = String(v.color_slug ?? '').trim() || toSlug(name);
    if (!SLUG_RE.test(slug)) return { ok: false, error: `Color «${name}»: identificador inválido` };
    if (slugs.has(slug.toLowerCase())) return { ok: false, error: `Color «${name}» repetido` };
    slugs.add(slug.toLowerCase());
    const hex = v.hex === null || v.hex === undefined || v.hex === '' ? null : String(v.hex).trim().toLowerCase();
    if (hex !== null && !HEX_RE.test(hex)) return { ok: false, error: `Color «${name}»: el código de color debe ser como #1a2b3c` };
    const image = v.image_url === null || v.image_url === undefined || v.image_url === '' ? null : String(v.image_url).trim();
    if (image !== null && !/^(https?:\/\/|\/)[^\s"'<>]+$/.test(image)) return { ok: false, error: `Color «${name}»: la foto debe ser una URL` };
    const sku = v.sku === null || v.sku === undefined || String(v.sku).trim() === '' ? null : String(v.sku).trim();
    if (sku !== null) {
      if (sku.length > 64) return { ok: false, error: `Color «${name}»: SKU demasiado largo` };
      if (skus.has(sku.toLowerCase())) return { ok: false, error: `SKU «${sku}» repetido` };
      skus.add(sku.toLowerCase());
    }
    const stock = Number(v.stock_quantity);
    if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) return { ok: false, error: `Color «${name}»: el stock debe ser un entero mayor o igual a 0` };
    if (v.active !== undefined && typeof v.active !== 'boolean') return { ok: false, error: `Color «${name}»: estado inválido` };
    const id = v.id === undefined || v.id === null || v.id === '' ? undefined : String(v.id);
    if (id !== undefined && !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: `Color «${name}»: id inválido` };
    out.push({ id, color_name: name, color_slug: slug, hex, image_url: image, sku, stock_quantity: stock, active: v.active !== false });
  }
  return { ok: true, variants: out };
}

/** Stock total de un producto con colores: suma de todos (incluidos los ocultos). */
export function totalVariantStock(variants: Array<{ stock_quantity: number | string }>): number {
  return variants.reduce((s, v) => s + (Number(v.stock_quantity) || 0), 0);
}
