'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { CATALOG_CATEGORIES, categoryLabel } from '@/lib/catalogCategories';
import { resolveAssetUrl } from '@/lib/assetUrl';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  images: string[];
  categories: string[];
  stock_status: string;
  stock_quantity: number;
  featured: boolean;
  description: string;
  short_description: string;
  tags: string[];
}

function formatCLP(n?: number | string) {
  const num = typeof n === 'string' ? Number(n) : (n ?? 0);
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(num);
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'ok' ? '✓' : '✕'} {msg}
    </div>
  );
}

export default function AdminProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/productos?action=list');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      showToast('Error cargando productos', 'err');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.categories || []).join(' ').includes(q);
      const matchCat = !catFilter || (p.categories || []).includes(catFilter);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'instock' && p.stock_status === 'instock') ||
        (statusFilter === 'outofstock' && p.stock_status === 'outofstock');
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const handleToggleVisibility = async (p: AdminProduct) => {
    const newStatus = p.stock_status === 'instock' ? 'outofstock' : 'instock';
    setProcessing(p.id);
    try {
      const res = await fetch(`/api/admin/productos/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: p.name, slug: p.slug, price: p.price,
          regular_price: p.regular_price,
          description: p.description, short_description: p.short_description,
          images: p.images, stock_quantity: p.stock_quantity,
          stock_status: newStatus,
          categories: p.categories, featured: p.featured, tags: p.tags,
        }),
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock_status: newStatus } : x));
      showToast(newStatus === 'instock' ? 'Producto publicado' : 'Producto ocultado');
    } catch {
      showToast('Error al cambiar visibilidad', 'err');
    } finally {
      setProcessing(null);
    }
  };

  const handleDuplicate = async (p: AdminProduct) => {
    setProcessing(p.id);
    try {
      const newSlug = `${p.slug}-copia-${Date.now().toString(36)}`;
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${p.name} (copia)`,
          slug: newSlug,
          price: p.price,
          regular_price: p.regular_price,
          description: p.description,
          short_description: p.short_description,
          images: p.images,
          categories: p.categories,
          tags: p.tags ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Producto duplicado');
      router.push(`/admin/productos/${data.product.id}`);
    } catch (e: any) {
      showToast(e.message || 'Error al duplicar', 'err');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (p: AdminProduct) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    setProcessing(p.id);
    try {
      const res = await fetch(`/api/admin/productos/${p.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.filter(x => x.id !== p.id));
      showToast('Producto eliminado');
    } catch {
      showToast('Error al eliminar', 'err');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} total · {filtered.length} visibles
            </p>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Nuevo producto
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, marca, modelo o categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCatFilter('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${!catFilter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
          >
            Todas las categorías
          </button>
          {CATALOG_CATEGORIES.map(c => (
            <button
              key={c.slug}
              onClick={() => setCatFilter(prev => prev === c.slug ? '' : c.slug)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${catFilter === c.slug ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
            >
              {c.label}
            </button>
          ))}
          <div className="h-7 w-px bg-gray-200 self-center mx-1" />
          {[
            { value: 'all', label: 'Todos' },
            { value: 'instock', label: 'Publicados' },
            { value: 'outofstock', label: 'Ocultos' },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s.value ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid de productos */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => {
              const thumb = resolveAssetUrl(Array.isArray(p.images) ? p.images[0] : undefined);
              const hasImage = Array.isArray(p.images) && p.images.length > 0;
              const isHidden = p.stock_status === 'outofstock';
              const busy = processing === p.id;
              return (
                <div
                  key={p.id}
                  className={`group bg-white rounded-xl border overflow-hidden flex flex-col transition-shadow hover:shadow-md ${isHidden ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {hasImage ? (
                      <img
                        src={thumb}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.removeAttribute('style');
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full absolute inset-0 flex items-center justify-center text-gray-300 text-4xl bg-gray-50"
                      style={hasImage ? { display: 'none' } : undefined}
                    >
                      📦
                    </div>
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {isHidden && <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-800 text-white rounded">Oculto</span>}
                      {p.featured && <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-400 text-white rounded">★</span>}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.slug}</p>
                    </div>

                    {/* Categorías */}
                    {(p.categories || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.categories.map(cat => (
                          <span key={cat} className="px-1.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded">
                            {categoryLabel(cat)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Precio */}
                    <p className="text-base font-bold text-gray-900">{formatCLP(p.price)}</p>

                    {/* Acciones */}
                    <div className="mt-auto pt-2 border-t border-gray-100 flex items-center gap-1 flex-wrap">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="flex-1 text-center px-2 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDuplicate(p)}
                        disabled={busy}
                        title="Duplicar producto"
                        className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        ⎘
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(p)}
                        disabled={busy}
                        title={isHidden ? 'Publicar' : 'Ocultar'}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${isHidden ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'}`}
                      >
                        {isHidden ? '👁 Publicar' : '🙈 Ocultar'}
                      </button>
                      <Link
                        href={`/producto/${p.slug}`}
                        target="_blank"
                        title="Ver en catálogo"
                        className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        ↗
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={busy}
                        title="Eliminar"
                        className="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 text-sm">
              {products.length === 0 ? 'No hay productos aún.' : 'Ningún producto coincide con los filtros.'}
            </p>
            {products.length === 0 && (
              <Link href="/admin/productos/nuevo" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
                Crear el primer producto →
              </Link>
            )}
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </AdminLayout>
  );
}
