'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';
import { resolveAssetUrl } from '@/lib/assetUrl';
import ProductImageUploader from '@/components/admin/ProductImageUploader';

const toSlug = (str: string) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface FormData {
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
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'ok' ? '✓' : '✕'} {msg}
    </div>
  );
}

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300';
const TEXTAREA = `${INPUT} resize-none`;

export default function EditProductoPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [form, setForm] = useState<FormData>({
    name: '', slug: '', price: '', regular_price: '',
    short_description: '', description: '',
    categories: [], tags: '',
    images: [],
    featured: false, stock_status: 'instock', stock_quantity: '10',
  });
  const [slugLocked, setSlugLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagesBusy, setImagesBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (field: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleNameChange = (name: string) => {
    set('name', name);
    if (!slugLocked) set('slug', toSlug(name));
  };

  const toggleCategory = (slug: string) =>
    set('categories', form.categories.includes(slug)
      ? form.categories.filter(c => c !== slug)
      : [...form.categories, slug]);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/productos/${productId}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();

        setForm({
          name: data.name ?? '',
          slug: data.slug ?? '',
          price: data.price?.toString() ?? '',
          regular_price: data.regular_price?.toString() ?? '',
          short_description: data.short_description ?? '',
          description: data.description ?? '',
          categories: Array.isArray(data.categories) ? data.categories : [],
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          images: Array.isArray(data.images) ? data.images : [],
          featured: Boolean(data.featured),
          stock_status: data.stock_status === 'outofstock' ? 'outofstock' : 'instock',
          stock_quantity: data.stock_quantity?.toString() ?? '0',
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/productos/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          price: Number(form.price.replace(/\D/g, '')),
          regular_price: Number((form.regular_price || form.price).replace(/\D/g, '')),
          description: form.description.trim(),
          short_description: form.short_description.trim(),
          images: form.images,
          categories: form.categories,
          tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
          featured: form.featured,
          stock_status: form.stock_status,
          stock_quantity: Number(form.stock_quantity) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Error al guardar');
      showToast('Cambios guardados');
    } catch (err: any) {
      showToast(err.message, 'err');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const newSlug = `${form.slug}-copia-${Date.now().toString(36)}`;
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.name} (copia)`,
          slug: newSlug,
          price: Number(form.price.replace(/\D/g, '')),
          regular_price: Number((form.regular_price || form.price).replace(/\D/g, '')),
          description: form.description.trim(),
          short_description: form.short_description.trim(),
          images: form.images,
          categories: form.categories,
          tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
          featured: false,
          stock_status: 'outofstock',
          stock_quantity: Number(form.stock_quantity) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al duplicar');
      showToast('Producto duplicado');
      router.push(`/admin/productos/${data.product.id}`);
    } catch (err: any) {
      showToast(err.message, 'err');
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${form.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/productos/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      router.push('/admin/productos');
    } catch (err: any) {
      showToast(err.message, 'err');
      setDeleting(false);
    }
  };

  const previewImage = form.images.length > 0 ? resolveAssetUrl(form.images[0]) : undefined;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="animate-pulse space-y-5">
          <div className="h-8 bg-gray-100 rounded w-48" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-500 mb-4">Producto no encontrado.</p>
        <Link href="/admin/productos" className="text-indigo-600 hover:underline text-sm">
          ← Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{form.name || 'Editar producto'}</h1>
          <p className="text-sm text-gray-500 font-mono">/producto/{form.slug}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/producto/${form.slug}`}
            target="_blank"
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Ver ↗
          </Link>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={duplicating}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {duplicating ? 'Duplicando…' : '⎘ Duplicar'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? 'Eliminando…' : '✕ Eliminar'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 space-y-6 lg:space-y-0">
          {/* ── Columna principal ── */}
          <div className="space-y-5">
            {/* Identidad */}
            <Section title="Identidad">
              <Field label="Nombre del producto *">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className={INPUT}
                  placeholder="Ej: Timbre Shiny 1800 Automático"
                  required
                />
              </Field>
              <Field label="Slug (URL)" hint="Edita manualmente si necesitas cambiarlo.">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => { setSlugLocked(true); set('slug', e.target.value); }}
                    className={INPUT}
                    placeholder="timbre-shiny-1800"
                    required
                  />
                  {slugLocked && (
                    <button
                      type="button"
                      onClick={() => { setSlugLocked(false); set('slug', toSlug(form.name)); }}
                      className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                      ↺ Auto
                    </button>
                  )}
                </div>
              </Field>
            </Section>

            {/* Precios */}
            <Section title="Precios">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio de venta (CLP) *">
                  <input
                    type="text"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    className={INPUT}
                    placeholder="15990"
                    inputMode="numeric"
                    required
                  />
                </Field>
                <Field label="Precio regular (CLP)" hint="Opcional. Si mayor al precio, muestra tachado.">
                  <input
                    type="text"
                    value={form.regular_price}
                    onChange={e => set('regular_price', e.target.value)}
                    className={INPUT}
                    placeholder="19990"
                    inputMode="numeric"
                  />
                </Field>
              </div>
            </Section>

            {/* Categorías */}
            <Section title="Categorías">
              <div className="flex flex-wrap gap-3">
                {CATALOG_CATEGORIES.map(cat => (
                  <label key={cat.slug} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.categories.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </div>
              {form.categories.length === 0 && (
                <p className="text-xs text-amber-600">Selecciona al menos una categoría.</p>
              )}
            </Section>

            {/* Contenido */}
            <Section title="Contenido">
              <Field label="Descripción corta" hint="Aparece en la tarjeta del producto (1-2 líneas).">
                <textarea
                  value={form.short_description}
                  onChange={e => set('short_description', e.target.value)}
                  rows={2}
                  className={TEXTAREA}
                  placeholder="Timbre automático compacto ideal para uso diario."
                />
              </Field>
              <Field label="Descripción completa">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={5}
                  className={TEXTAREA}
                  placeholder="Descripción detallada del producto: características, dimensiones, usos recomendados…"
                />
              </Field>
              <Field label="Tags" hint="Separados por coma. Ej: trodat, automatico, 38x14mm">
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  className={INPUT}
                  placeholder="shiny, compacto, bolsillo"
                />
              </Field>
            </Section>

            {/* Imágenes */}
            <Section title="Imágenes">
              <ProductImageUploader
                value={form.images}
                onChange={urls => set('images', urls)}
                onBusyChange={setImagesBusy}
              />
            </Section>

            {/* Estado */}
            <Section title="Estado y visibilidad">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => set('stock_status', form.stock_status === 'instock' ? 'outofstock' : 'instock')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.stock_status === 'instock' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.stock_status === 'instock' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {form.stock_status === 'instock' ? '✓ Publicado' : '✕ Oculto'}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => set('featured', e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">★ Destacado en home</span>
                </label>
                <div className="sm:ml-auto">
                  <Field label="Stock" hint="">
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={e => set('stock_quantity', e.target.value)}
                      min={0}
                      className={`${INPUT} w-24`}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Link href="/admin/productos" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting || imagesBusy}
                className="flex-1 sm:flex-none px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {imagesBusy ? 'Subiendo imágenes…' : submitting ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* ── Vista previa lateral (desktop) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>
                </div>
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onError={e => (e.currentTarget.style.opacity = '0')} />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {form.name || <span className="text-gray-300">Nombre del producto</span>}
                  </p>
                  {form.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.categories.map(c => (
                        <span key={c} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full">
                          {CATALOG_CATEGORIES.find(x => x.slug === c)?.label ?? c}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-lg font-bold text-gray-900">
                    {form.price
                      ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(form.price.replace(/\D/g, '')))
                      : <span className="text-gray-300 text-sm">Precio</span>}
                  </p>
                  {form.short_description && (
                    <p className="text-xs text-gray-500 line-clamp-3">{form.short_description}</p>
                  )}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${form.stock_status === 'instock' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {form.stock_status === 'instock' ? '● Disponible' : '○ Oculto'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">ID: {productId}</p>
            </div>
          </aside>
        </div>
      </form>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
