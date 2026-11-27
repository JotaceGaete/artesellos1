export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import { requireAdminSession } from '@/lib/adminSession'
import { loadCategories } from '@/lib/categoriesServer'
import { unknownCategorySlugs } from '@/lib/categories'

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req)
    if (authError) return authError

    const { product_id, categories } = await req.json()
    if (!product_id || !Array.isArray(categories)) {
      return NextResponse.json({ message: 'Parámetros inválidos' }, { status: 400 })
    }

    const normalized: string[] = categories.map((c: any) => String(c).trim()).filter(Boolean)

    const supabase = createSupabaseAdmin()
    const { categories: knownCategories } = await loadCategories(supabase)
    const unknown = unknownCategorySlugs(normalized, knownCategories)
    if (unknown.length > 0) {
      return NextResponse.json({ message: `Categoría inexistente: ${unknown.join(', ')}` }, { status: 400 })
    }
    const { error } = await (supabase as any)
      .from('products')
      .update({ categories: normalized })
      .eq('id', product_id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 })
  }
}


