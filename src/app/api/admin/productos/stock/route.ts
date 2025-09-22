export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin, getUser } from '@/lib/supabaseServer'

const ALLOWED_ADMIN_EMAILS = new Set<string>([
  'jotacegaete@gmail.com',
  'artesellos@outlook.com',
])

// Ajusta stock: body { product_id?: string, slug?: string, delta?: number, set?: number }
export async function POST(req: NextRequest) {
  try {
    const BYPASS = process.env.NEXT_PUBLIC_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production'
    if (!BYPASS) {
      const user = await getUser()
      if (!user?.email || !ALLOWED_ADMIN_EMAILS.has(user.email)) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
      }
    }

    const { product_id, slug, delta, set } = await req.json()
    if (!product_id && !slug) {
      return NextResponse.json({ message: 'Debe enviar product_id o slug' }, { status: 400 })
    }
    if (delta == null && set == null) {
      return NextResponse.json({ message: 'Debe enviar delta o set' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Obtener producto
    const query = (supabase as any).from('products').select('id, stock_quantity').single()
    const { data: prod, error: qErr } = product_id
      ? await query.eq('id', product_id)
      : await query.eq('slug', slug)
    if (qErr || !prod) {
      return NextResponse.json({ message: qErr?.message || 'Producto no encontrado' }, { status: 404 })
    }

    const newStock = typeof set === 'number' ? Math.max(0, Math.floor(set)) : Math.max(0, Math.floor((prod.stock_quantity ?? 0) + Number(delta)))

    const { error: uErr, data } = await (supabase as any)
      .from('products')
      .update({ stock_quantity: newStock, stock_status: newStock > 0 ? 'instock' : 'outofstock' })
      .eq('id', prod.id)
      .select('id, stock_quantity, stock_status')
      .single()

    if (uErr) {
      return NextResponse.json({ message: uErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, product: data })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 })
  }
}


