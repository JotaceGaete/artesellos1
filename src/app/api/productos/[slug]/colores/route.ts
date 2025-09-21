import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const supabase = createSupabaseAdmin()

    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (pErr) return NextResponse.json({ message: pErr.message }, { status: 500 })
    if (!product) return NextResponse.json({ items: [] })

    const { data: colors, error: cErr } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', product.id)
      .eq('active', true)
      .order('is_default', { ascending: false })
      .order('color_name', { ascending: true })

    if (cErr) return NextResponse.json({ message: cErr.message }, { status: 500 })
    return NextResponse.json({ items: colors || [] })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error interno' }, { status: 500 })
  }
}


