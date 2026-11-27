export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';
import { requireAdminSession } from '@/lib/adminSession';
import { countProductsBySlug, deleteBlockReason, validateCategoryInput } from '@/lib/categories';
import { CATEGORY_COLUMNS, friendlyDbError, loadCategories, loadProductCategorySlugs } from '@/lib/categoriesServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MIGRATION_PENDING = { message: 'Falta aplicar la migración de categorías en la base de datos' };

async function context(supabase: any, id: string) {
  const [{ categories, source }, products] = await Promise.all([
    loadCategories(supabase),
    loadProductCategorySlugs(supabase),
  ]);
  const current = categories.find(c => c.id === id) ?? null;
  const productCount = current ? (countProductsBySlug(products).get(current.slug) ?? 0) : 0;
  return { categories, source, current, productCount };
}

/** Editar nombre, slug, descripción, categoría padre, estado u orden. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ message: 'Cuerpo inválido' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { categories, source, current, productCount } = await context(supabase, id);
    if (source === 'fallback') return NextResponse.json(MIGRATION_PENDING, { status: 503 });
    if (!current) return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });

    const v = validateCategoryInput(body, { all: categories, current, productCount });
    if ('error' in v) return NextResponse.json({ message: v.error }, { status: 400 });
    if (Object.keys(v.value).length === 0) return NextResponse.json({ category: current });

    const { data, error } = await (supabase as any)
      .from('categories')
      .update(v.value)
      .eq('id', id)
      .select(CATEGORY_COLUMNS)
      .single();
    if (error) {
      const f = friendlyDbError(error);
      return NextResponse.json({ message: f.message }, { status: f.status });
    }
    return NextResponse.json({ category: data });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

/** Eliminar: solo sin productos ni subcategorías (la base también lo impide). */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const { categories, source, current, productCount } = await context(supabase, id);
    if (source === 'fallback') return NextResponse.json(MIGRATION_PENDING, { status: 503 });
    if (!current) return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 });

    const reason = deleteBlockReason(current, categories, productCount);
    if (reason) return NextResponse.json({ message: reason }, { status: 409 });

    const { error } = await (supabase as any).from('categories').delete().eq('id', id);
    if (error) {
      const f = friendlyDbError(error);
      return NextResponse.json({ message: f.message }, { status: f.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}
