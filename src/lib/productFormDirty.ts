/**
 * Detección de cambios pendientes (dirty state) del editor de productos.
 *
 * Se compara el formulario actual con una copia normalizada de los últimos datos
 * guardados correctamente. La normalización sigue las mismas reglas con las que el
 * editor arma el cuerpo del PUT, así que dos formularios que producirían la misma
 * petición se consideran iguales (p. ej. espacios al final, o volver a marcar una
 * categoría que se había desmarcado).
 */
import { normalizeVariantRows, type VariantFormRow } from '@/lib/productVariants';

export interface ProductFormValues {
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  short_description: string;
  description: string;
  categories: string[];
  tags: string;
  images: string[];
  featured: boolean;
  stock_status: 'instock' | 'outofstock';
  stock_quantity: string;
  /** Colores de carcasa, en su orden (opcional: sin colores = lista vacía). */
  variants?: VariantFormRow[];
}

export interface NormalizedProductForm {
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  short_description: string;
  description: string;
  /** Conjunto de categorías: el orden en que se marcan no es un cambio. */
  categories: string[];
  /** Etiquetas en su orden, sin vacías ni espacios sobrantes. */
  tags: string[];
  /** Imágenes en su orden: reordenarlas sí es un cambio. */
  images: string[];
  featured: boolean;
  stock_status: 'instock' | 'outofstock';
  stock_quantity: number;
  /** Colores en su orden: agregar, quitar, reordenar o editar uno es un cambio. */
  variants: ReturnType<typeof normalizeVariantRows>;
}

const digits = (v: unknown) => Number(String(v ?? '').replace(/\D/g, '')) || 0;

export function normalizeProductForm(form: ProductFormValues): NormalizedProductForm {
  const price = digits(form.price);
  return {
    name: String(form.name ?? '').trim(),
    slug: String(form.slug ?? '').trim(),
    price,
    // Igual que el PUT: precio normal vacío equivale al precio de venta.
    regular_price: String(form.regular_price ?? '').trim() ? digits(form.regular_price) : price,
    short_description: String(form.short_description ?? '').trim(),
    description: String(form.description ?? '').trim(),
    categories: Array.from(new Set((form.categories ?? []).map(c => String(c).trim()).filter(Boolean))).sort(),
    tags: String(form.tags ?? '').split(',').map(s => s.trim()).filter(Boolean),
    images: (form.images ?? []).map(u => String(u).trim()).filter(Boolean),
    featured: form.featured === true,
    stock_status: form.stock_status === 'outofstock' ? 'outofstock' : 'instock',
    stock_quantity: Number(form.stock_quantity) || 0,
    variants: normalizeVariantRows(form.variants ?? []),
  };
}

export function sameNormalizedForm(a: NormalizedProductForm, b: NormalizedProductForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** true si el formulario difiere de lo último guardado. Sin datos guardados aún, no hay cambios. */
export function isProductFormDirty(current: ProductFormValues, saved: NormalizedProductForm | null): boolean {
  if (!saved) return false;
  return !sameNormalizedForm(normalizeProductForm(current), saved);
}

export type SaveButtonTone = 'idle' | 'active' | 'busy' | 'saved';

export interface SaveButtonState {
  label: string;
  disabled: boolean;
  tone: SaveButtonTone;
}

/** Texto, habilitación y tono del botón «Guardar cambios». */
export function saveButtonState(s: {
  dirty: boolean;
  submitting: boolean;
  imagesBusy: boolean;
  justSaved: boolean;
}): SaveButtonState {
  if (s.submitting) return { label: 'Guardando...', disabled: true, tone: 'busy' };
  if (s.imagesBusy) return { label: 'Subiendo imágenes…', disabled: true, tone: 'busy' };
  if (s.dirty) return { label: 'Guardar cambios', disabled: false, tone: 'active' };
  if (s.justSaved) return { label: '✓ Guardado', disabled: true, tone: 'saved' };
  return { label: 'Sin cambios', disabled: true, tone: 'idle' };
}

/** Clases por tono. `active` conserva el color actual del botón. */
export const SAVE_BUTTON_TONE_CLASSES: Record<SaveButtonTone, string> = {
  active: 'text-white bg-indigo-600 hover:bg-indigo-700',
  busy: 'text-white bg-indigo-600 opacity-50 cursor-wait',
  saved: 'text-white bg-emerald-600 cursor-default',
  idle: 'text-gray-500 bg-gray-200 cursor-not-allowed',
};

/** true si los colores difieren de lo último guardado (para decidir si se envían). */
export function variantsDirty(current: ProductFormValues, saved: NormalizedProductForm | null): boolean {
  if (!saved) return false;
  return JSON.stringify(normalizeVariantRows(current.variants ?? [])) !== JSON.stringify(saved.variants);
}
