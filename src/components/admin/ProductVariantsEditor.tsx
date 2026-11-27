'use client';

import { resolveAssetUrl } from '@/lib/assetUrl';
import { emptyVariantRow, HEX_RE, totalVariantStock, type VariantFormRow } from '@/lib/productVariants';
import { toSlug } from '@/lib/categories';

const INPUT = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300';

interface Props {
  rows: VariantFormRow[];
  onChange: (rows: VariantFormRow[]) => void;
  /** Fotos de la galería del producto, para elegir la de cada color. */
  galleryImages: string[];
  /** Stock total guardado hoy en el producto. */
  savedTotal: number;
  /** true si los colores tienen cambios sin guardar. */
  dirty: boolean;
  disabled?: boolean;
}

/**
 * Colores de carcasa del producto: nombre, color, foto, SKU, stock físico y estado.
 * El stock total del producto pasa a ser la suma de todos los colores (también los ocultos).
 */
export default function ProductVariantsEditor({ rows, onChange, galleryImages, savedTotal, dirty, disabled }: Props) {
  const update = (key: string, patch: Partial<VariantFormRow>) =>
    onChange(rows.map(r => (r.key === key ? { ...r, ...patch } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (r: VariantFormRow) => {
    const stock = Number(r.stock_quantity) || 0;
    if (r.id && stock > 0 && !confirm(`El color «${r.color_name}» tiene ${stock} unidad(es). ¿Quitarlo del producto?`)) return;
    onChange(rows.filter(x => x.key !== r.key));
  };

  const total = totalVariantStock(rows);
  const hiddenStock = totalVariantStock(rows.filter(r => !r.active));

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">
          Sin colores: el stock se edita en «Estado y visibilidad». Si agregas colores, el stock total pasa a ser la suma de sus existencias.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => {
            const hexOk = !r.hex || HEX_RE.test(r.hex);
            const options = Array.from(new Set([...(r.image_url ? [r.image_url] : []), ...galleryImages]));
            return (
              <div
                key={r.key}
                data-testid="variant-row"
                className={`grid grid-cols-[auto_2.25rem_1fr_7.5rem_auto_auto] gap-x-2 gap-y-2 items-center p-2 rounded-lg border ${r.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-70'}`}
              >
                <div className="flex flex-col leading-none">
                  <button type="button" aria-label={`Subir ${r.color_name || 'color'}`} disabled={disabled || i === 0} onClick={() => move(i, -1)} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                  <button type="button" aria-label={`Bajar ${r.color_name || 'color'}`} disabled={disabled || i === rows.length - 1} onClick={() => move(i, 1)} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
                </div>
                <div className="w-9 h-9 rounded-md border border-gray-200 overflow-hidden bg-gray-100">
                  {r.image_url
                    ? <img src={resolveAssetUrl(r.image_url)} alt="" className="w-full h-full object-cover" />
                    : <span className="block w-full h-full" style={{ background: hexOk && r.hex ? r.hex : '#f3f4f6' }} />}
                </div>
                <input
                  aria-label="Nombre del color"
                  className={INPUT}
                  value={r.color_name}
                  placeholder="Ej: Azul transparente"
                  disabled={disabled}
                  onChange={e => update(r.key, { color_name: e.target.value, color_slug: r.id ? r.color_slug : toSlug(e.target.value) })}
                />
                <label className="flex items-center gap-1 text-xs text-gray-400">
                  Stock
                <input
                  aria-label="Stock del color"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={`${INPUT} text-gray-900`}
                  title="Stock físico de este color"
                  value={r.stock_quantity}
                  disabled={disabled}
                  onChange={e => update(r.key, { stock_quantity: e.target.value })}
                />
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => update(r.key, { active: !r.active })}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${r.active ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-600 bg-gray-200 hover:bg-gray-300'}`}
                  title={r.active ? 'Se ofrece al cliente' : 'Oculto: conserva sus existencias pero no se ofrece'}
                >
                  {r.active ? 'Visible' : 'Oculto'}
                </button>
                <button
                  type="button"
                  aria-label={`Quitar ${r.color_name || 'color'}`}
                  disabled={disabled}
                  onClick={() => remove(r)}
                  className="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  ✕
                </button>
                <div className="col-start-3 col-span-4 grid grid-cols-1 sm:grid-cols-[10rem_1fr_10rem] gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      aria-label="Selector de color"
                      value={hexOk && r.hex ? r.hex : '#000000'}
                      disabled={disabled}
                      onChange={e => update(r.key, { hex: e.target.value })}
                      className="w-7 h-7 p-0 border border-gray-200 rounded"
                    />
                    <input
                      aria-label="Código de color"
                      placeholder="Sin código"
                      className={`${INPUT} ${hexOk ? '' : 'border-red-400'}`}
                      value={r.hex}
                      disabled={disabled}
                      onChange={e => update(r.key, { hex: e.target.value })}
                    />
                  </div>
                  <select
                    aria-label="Foto del color"
                    className={INPUT}
                    value={r.image_url}
                    disabled={disabled}
                    onChange={e => update(r.key, { image_url: e.target.value })}
                  >
                    <option value="">Sin foto</option>
                    {options.map(url => (
                      <option key={url} value={url}>{galleryImages.includes(url) ? `Foto ${galleryImages.indexOf(url) + 1} de la galería` : `Foto actual (${url.split('/').pop()})`}</option>
                    ))}
                  </select>
                  <input
                    aria-label="SKU"
                    className={INPUT}
                    value={r.sku}
                    placeholder="SKU (opcional)"
                    title="SKU"
                    disabled={disabled}
                    onChange={e => update(r.key, { sku: e.target.value })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...rows, emptyVariantRow()])}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
        >
          + Agregar color
        </button>
        {rows.length > 0 && (
          <p className="text-xs text-gray-600" data-testid="variants-total">
            Stock total: <strong>{total}</strong>
            {hiddenStock > 0 && <span className="text-gray-400"> (incluye {hiddenStock} en colores ocultos)</span>}
          </p>
        )}
      </div>

      {rows.length > 0 && !dirty && total !== savedTotal && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" data-testid="variants-mismatch">
          El stock guardado del producto es {savedTotal} y la suma de los colores es {total}. Se mantiene {savedTotal} hasta que guardes un cambio en los colores.
        </p>
      )}
      {rows.length > 0 && dirty && total !== savedTotal && (
        <p className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2" data-testid="variants-new-total">
          Al guardar, el stock total del producto pasará de {savedTotal} a {total}.
        </p>
      )}
    </div>
  );
}
