import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin, getUser } from '@/lib/supabaseServer'

const ALLOWED_ADMIN_EMAILS = new Set<string>([
  'jotacegaete@gmail.com',
  'artesellos@outlook.com',
])

export async function POST(req: NextRequest) {
  try {
    const BYPASS = process.env.NEXT_PUBLIC_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production'
    if (!BYPASS) {
      const user = await getUser()
      if (!user?.email || !ALLOWED_ADMIN_EMAILS.has(user.email)) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
      }
    }

    const { product_id, categories } = await req.json()
    if (!product_id || !Array.isArray(categories)) {
      return NextResponse.json({ message: 'Parámetros inválidos' }, { status: 400 })
    }

    const normalized: string[] = categories.map((c: any) => String(c).trim()).filter(Boolean)

    const supabase = createSupabaseAdmin()
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


