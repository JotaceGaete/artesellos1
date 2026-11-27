'use client';

import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_CATEGORIES, type Category, type CategoryWithCount } from '@/lib/categories';

type Scope = 'public' | 'admin';

/**
 * Carga categorías desde la API. Si falla, usa las 4 del código para que el
 * catálogo y el editor sigan funcionando igual que antes.
 */
export function useCategories<T extends Category = Category>(scope: Scope = 'public') {
  const [categories, setCategories] = useState<T[]>(FALLBACK_CATEGORIES as T[]);
  const [source, setSource] = useState<'db' | 'fallback'>('fallback');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(scope === 'admin' ? '/api/admin/categorias' : '/api/categorias', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error al cargar categorías');
      setCategories((data.categories ?? []) as T[]);
      setSource(data.source === 'db' ? 'db' : 'fallback');
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar categorías');
      setCategories(FALLBACK_CATEGORIES as T[]);
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { reload(); }, [reload]);

  return { categories, source, loading, error, reload, setCategories };
}

export type { Category, CategoryWithCount };
