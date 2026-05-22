'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, X, Plus, Pencil, Trash2, Eye, Palette, Package } from 'lucide-react';

interface RawProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: unknown;
  categories?: string[];
  stock_status?: string;
  stock_quantity?: number | null;
}

function getFirstImageUrl(images: unknown): string | null {
  if (!images) return null;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first === 'object') {
      const o = first as Record<string, unknown>;
      return (typeof o.src === 'string' && o.src) ||
             (typeof o.url === 'string' && o.url) ||
             (typeof o.image === 'string' && o.image) ||
             null;
    }
  }
  if (typeof images === 'string' && images.trim()) return images.trim();
  if (images && typeof images === 'object' && !Array.isArray(images)) {
    const o = images as Record<string, unknown>;
    return (typeof o.src === 'string' && o.src) || (typeof o.url === 'string' && o.url) || null;
  }
  return null;
}

function formatCLP(n?: number | string) {
  const num = typeof n === 'string' ? Number(n) : (n ?? 0);
  try {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(num);
  } catch {
    return `$${num}`;
  }
}

function StatusBadge({ status }: { status?: string }) {
  if (status === 'instock') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">En stock</span>;
  }
  if (status === 'outofstock') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">Agotado</span>;
  }
  if (status === 'onbackorder') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">Bajo pedido</span>;
  }
  return null;
}

function ProductCard({
  p,
  isDeleting,
  onDelete,
}: {
  p: RawProduct;
  isDeleting: boolean;
  onDelete: (p: RawProduct) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = !imgError ? getFirstImageUrl(p.images) : null;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={p.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={p.stock_status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{p.name}</p>
        <p className="text-sm font-bold text-indigo-700">{formatCLP(p.price)}</p>
        {Array.isArray(p.categories) && p.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.categories.slice(0, 2).map(c => (
              <span key={c} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 truncate max-w-[100px]">{c}</span>
            ))}
          </div>
        )}
        {p.stock_quantity != null && (
          <p className="text-[11px] text-gray-400">Stock: {p.stock_quantity}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <Link
          href={`/admin/productos/${p.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Editar
        </Link>
        <Link
          href={`/admin/productos/${p.id}/colores`}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          title="Colores"
        >
          <Palette className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/producto/${p.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
          title="Ver en sitio"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onDelete(p)}
          disabled={isDeleting}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'instock' | 'outofstock'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/productos?action=list')
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(data => setProducts(data.products || []))
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (statusFilter !== 'all' && p.stock_status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        (Array.isArray(p.categories) && p.categories.some(c => c.toLowerCase().includes(q)))
      );
    });
  }, [products, search, statusFilter]);

  const handleDelete = useCallback(async (p: RawProduct) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/admin/productos/${p.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch {
      alert('Error al eliminar el producto. Intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  const isFiltering = search !== '' || statusFilter !== 'all';

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="mt-0.5 text-sm text-gray-500">{products.length} en total</p>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, slug o categoría…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="instock">En stock</option>
            <option value="outofstock">Agotados</option>
          </select>
        </div>

        {isFiltering && (
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </p>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Package className="w-12 h-12 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {isFiltering ? 'No hay productos que coincidan con la búsqueda' : 'No hay productos aún'}
            </p>
            {!isFiltering && (
              <Link href="/admin/productos/nuevo" className="mt-3 text-sm text-indigo-600 hover:underline">
                Crear el primero
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                p={p}
                isDeleting={deletingId === p.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
