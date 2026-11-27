export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';
import { visibleCategories } from '@/lib/categories';
import { loadCategories } from '@/lib/categoriesServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Categorías visibles en el catálogo público (activas y con padre activo). */
export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { categories, source } = await loadCategories(supabase);
    const visible = visibleCategories(categories).map(c => ({
      id: c.id, name: c.name, slug: c.slug, description: c.description,
      parent_id: c.parent_id, sort_order: c.sort_order, is_active: c.is_active,
    }));
    return NextResponse.json(
      { categories: visible, source },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}
