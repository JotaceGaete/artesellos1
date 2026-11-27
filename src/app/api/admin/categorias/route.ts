export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';
import { requireAdminSession } from '@/lib/adminSession';
import { countProductsBySlug, validateCategoryInput } from '@/lib/categories';
import { CATEGORY_COLUMNS, friendlyDbError, loadCategories, loadProductCategorySlugs } from '@/lib/categoriesServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MIGRATION_PENDING = { message: 'Falta aplicar la migración de categorías en la base de datos' };

/** Todas las categorías (activas y ocultas) con su conteo de productos y subcategorías. */
export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;
    const supabase = createSupabaseAdmin();
    const [{ categories, source }, products] = await Promise.all([
      loadCategories(supabase),
      loadProductCategorySlugs(supabase),
    ]);
    const counts = countProductsBySlug(products);
    const list = categories.map(c => ({
      ...c,
      product_count: counts.get(c.slug) ?? 0,
      children_count: categories.filter(x => x.parent_id === c.id).length,
    }));
    return NextResponse.json({ categories: list, source });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

/** Crear categoría o subcategoría. */
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ message: 'Cuerpo inválido' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { categories, source } = await loadCategories(supabase);
    if (source === 'fallback') return NextResponse.json(MIGRATION_PENDING, { status: 503 });

    const v = validateCategoryInput(body, { all: categories });
    if ('error' in v) return NextResponse.json({ message: v.error }, { status: 400 });

    const siblings = categories.filter(c => (c.parent_id ?? null) === (v.value.parent_id ?? null));
    const sort_order = v.value.sort_order ?? ((siblings.reduce((m, c) => Math.max(m, c.sort_order), 0)) + 10);

    const { data, error } = await (supabase as any)
      .from('categories')
      .insert([{
        name: v.value.name,
        slug: v.value.slug,
        description: v.value.description ?? null,
        parent_id: v.value.parent_id ?? null,
        is_active: v.value.is_active ?? true,
        sort_order,
      }])
      .select(CATEGORY_COLUMNS)
      .single();
    if (error) {
      const f = friendlyDbError(error);
      return NextResponse.json({ message: f.message }, { status: f.status });
    }
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

/** Reordenar: { items: [{ id, sort_order }] } — solo cambia sort_order. */
export async function PATCH(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;
    const body = await req.json().catch(() => null);
    const items = Array.isArray(body?.items) ? body.items : null;
    if (!items || items.length === 0 || items.length > 200) {
      return NextResponse.json({ message: 'items debe ser una lista' }, { status: 400 });
    }
    for (const it of items) {
      if (typeof it?.id !== 'string' || !Number.isInteger(it?.sort_order)) {
        return NextResponse.json({ message: 'Cada item requiere id y sort_order entero' }, { status: 400 });
      }
    }
    const supabase = createSupabaseAdmin();
    const { categories, source } = await loadCategories(supabase);
    if (source === 'fallback') return NextResponse.json(MIGRATION_PENDING, { status: 503 });
    const known = new Set(categories.map(c => c.id));
    if (items.some((it: any) => !known.has(it.id))) {
      return NextResponse.json({ message: 'Categoría inexistente en el orden' }, { status: 400 });
    }
    for (const it of items) {
      const { error } = await (supabase as any).from('categories').update({ sort_order: it.sort_order }).eq('id', it.id);
      if (error) {
        const f = friendlyDbError(error);
        return NextResponse.json({ message: f.message }, { status: f.status });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}
