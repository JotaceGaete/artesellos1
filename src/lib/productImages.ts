/**
 * Normalización centralizada del campo `products.images`.
 *
 * En la base real, `products.images` es una columna TEXT (no JSONB). Los valores
 * encontrados en producción son:
 *   - un array JSON serializado como texto, con o sin espacios / saltos de línea (\r\n);
 *   - una URL directa;
 *   - un array JSON serializado dos veces (un array cuyos elementos son fragmentos
 *     de otro array JSON, p. ej. `["[\n \"https://…\"", "\"https://…\"\n]"]`).
 *
 * - `parseImages` es tolerante: se usa para LEER y siempre devuelve string[].
 * - `parseImagesInput` es estricta: se usa para ESCRIBIR y rechaza valores inválidos.
 * - `serializeImagesForDb` produce el valor compatible con la columna TEXT.
 */

const MAX_DEPTH = 5;

/** Extensiones aceptadas para claves relativas (R2/CDN) sin esquema http. */
const IMAGE_KEY_RE = /^[\w\-./%() ]+\.(jpe?g|png|webp|gif|avif|jfif|svg)$/i;

function isImageRef(s: string): boolean {
  if (!s || s !== s.trim()) return false;
  // URL absoluta: se permiten espacios internos (URLs antiguas sin codificar), no comillas ni corchetes.
  if (/^https?:\/\//i.test(s)) return /^https?:\/\/[^\s"'<>\\\[\]{}][^"'<>\\\[\]{}\r\n\t]*$/i.test(s);
  // Ruta relativa al sitio.
  if (s.startsWith('/')) return !s.startsWith('//') && !/[\s"'<>\\\[\]{}]/.test(s);
  // Clave R2/CDN relativa con extensión de imagen.
  return IMAGE_KEY_RE.test(s) && !s.includes('..');
}

/** Quita restos de serialización alrededor de una URL: corchetes, comillas, barras, comas y espacios. */
function stripJsonDebris(s: string): string {
  let prev = '';
  let out = s.trim();
  while (out !== prev) {
    prev = out;
    out = out
      .replace(/^[\s\[\],"'\\]+/, '')
      .replace(/[\s\[\],"'\\]+$/, '')
      .trim();
  }
  return out;
}

function collect(value: unknown, out: string[], depth: number): void {
  if (value == null || depth > MAX_DEPTH) return;

  if (Array.isArray(value)) {
    for (const item of value) collect(item, out, depth + 1);
    return;
  }

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return;

    if (s.startsWith('[') || s.startsWith('{') || s.startsWith('"')) {
      try {
        collect(JSON.parse(s), out, depth + 1);
        return;
      } catch {
        // Fragmento de JSON (doble serialización partida): se limpia más abajo.
      }
    }

    const cleaned = stripJsonDebris(s);
    if (isImageRef(cleaned)) out.push(cleaned);
    return;
  }

  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const candidate = o.src ?? o.url;
    if (candidate !== undefined) collect(candidate, out, depth + 1);
  }
}

/**
 * Convierte cualquier valor almacenado de `images` en una lista de URLs/claves limpias.
 * Nunca lanza: valores nulos, vacíos o inválidos devuelven [].
 */
export function parseImages(raw: unknown): string[] {
  const out: string[] = [];
  collect(raw, out, 0);
  return out;
}

export type ImagesInputResult =
  | { ok: true; images: string[] }
  | { ok: false; error: string };

/**
 * Validación estricta para escrituras.
 * Acepta un array de strings (o un array JSON serializado como texto).
 * Rechaza cualquier elemento que no sea una URL/clave de imagen válida, en lugar
 * de descartarlo en silencio.
 */
export function parseImagesInput(raw: unknown): ImagesInputResult {
  let value: unknown = raw;

  if (typeof value === 'string') {
    const s = value.trim();
    if (s.startsWith('[')) {
      try {
        value = JSON.parse(s);
      } catch {
        return { ok: false, error: 'El campo images no es un JSON válido' };
      }
    } else if (isImageRef(s)) {
      return { ok: true, images: [s] };
    } else {
      return { ok: false, error: 'El campo images debe ser una lista de URLs de imagen' };
    }
  }

  if (!Array.isArray(value)) {
    return { ok: false, error: 'El campo images debe ser una lista de URLs de imagen' };
  }

  const images: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !isImageRef(item.trim())) {
      return { ok: false, error: 'El campo images contiene un valor que no es una URL de imagen válida' };
    }
    images.push(item.trim());
  }
  return { ok: true, images };
}

/** Valor compatible con la columna TEXT `products.images`. */
export function serializeImagesForDb(images: string[]): string {
  return JSON.stringify(images);
}

export type ImagesUpdateResult =
  | { ok: true; action: 'keep' }
  | { ok: true; action: 'set'; value: string }
  | { ok: false; error: string };

/**
 * Decide qué hacer con `images` en una actualización:
 *  - campo ausente → conservar las imágenes existentes;
 *  - valor inválido → error de validación;
 *  - lista vacía → solo si `clear_images === true` (eliminación explícita).
 */
export function resolveImagesUpdate(body: Record<string, unknown>): ImagesUpdateResult {
  if (!Object.prototype.hasOwnProperty.call(body, 'images') || body.images === undefined) {
    return { ok: true, action: 'keep' };
  }
  const parsed = parseImagesInput(body.images);
  if ('error' in parsed) return { ok: false, error: parsed.error };
  if (parsed.images.length === 0 && body.clear_images !== true) {
    return {
      ok: false,
      error: 'Para quitar todas las imágenes hay que confirmarlo explícitamente (clear_images: true)',
    };
  }
  return { ok: true, action: 'set', value: serializeImagesForDb(parsed.images) };
}

/** Normaliza una fila de `products` para el frontend del admin (images siempre string[]). */
export function normalizeProductImages<T extends { images?: unknown }>(row: T): Omit<T, 'images'> & { images: string[] } {
  return { ...row, images: parseImages(row.images) };
}
