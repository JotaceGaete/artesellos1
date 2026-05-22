export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import { requireAdminSession } from '@/lib/adminSession'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req)
    if (authError) return authError

    const product_id = req.nextUrl.searchParams.get('product_id')
    if (!product_id) return NextResponse.json({ message: 'product_id requerido' }, { status: 400 })
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', product_id)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ message: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Error interno';
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req)
    if (authError) return authError

    const body = await req.json()
    const supabase = createSupabaseAdmin()

    if (body.action === 'create') {
      const { product_id, color_slug, color_name, hex, image_url, stock_quantity, price_diff, is_default, active } = body
      if (!product_id || !color_slug || !color_name) return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 })
      const { data, error } = await (supabase as any)
        .from('product_colors')
        .insert([{ product_id, color_slug, color_name, hex, image_url, stock_quantity: stock_quantity ?? 0, price_diff: price_diff ?? 0, is_default: !!is_default, active: active ?? true }])
        .select()
        .single()
      if (error) return NextResponse.json({ message: error.message }, { status: 500 })
      return NextResponse.json({ item: data })
    }

    if (body.action === 'update') {
      const { id, action: _ignore, ...rawPatch } = body
      if (!id) return NextResponse.json({ message: 'id requerido' }, { status: 400 })
      const rest = Object.fromEntries(Object.entries(rawPatch).filter(([_, v]) => v !== undefined))
      const { data, error } = await (supabase as any)
        .from('product_colors')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ message: error.message }, { status: 500 })
      return NextResponse.json({ item: data })
    }

    if (body.action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ message: 'id requerido' }, { status: 400 })
      const { error } = await supabase
        .from('product_colors')
        .delete()
        .eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ message: 'Acción inválida' }, { status: 400 })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Error interno';
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}


