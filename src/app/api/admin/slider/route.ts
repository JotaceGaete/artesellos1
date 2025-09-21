import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin, getUser } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ALLOWED_ADMIN_EMAILS = new Set<string>([
  'jotacegaete@gmail.com',
  'artesellos@outlook.com',
])

function authorizeOrBypass() {
  return process.env.NEXT_PUBLIC_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production'
}

export async function GET() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('slider_slides')
    .select('*')
    .eq('active', true)
    .order('slide_order', { ascending: true })
  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  try {
    if (!authorizeOrBypass()) {
      const user = await getUser()
      if (!user?.email || !ALLOWED_ADMIN_EMAILS.has(user.email)) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
      }
    }

    const supabase = createSupabaseAdmin()
    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const payload = { ...body }
      delete (payload as any).action
      const { data, error } = await supabase
        .from('slider_slides')
        .insert([payload])
        .select()
        .single()
      if (error) return NextResponse.json({ message: error.message }, { status: 500 })
      return NextResponse.json({ item: data })
    }

    if (action === 'update') {
      const { id, ...rest } = body
      if (!id) return NextResponse.json({ message: 'id requerido' }, { status: 400 })
      delete (rest as any).action
      const patch = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined))
      const { data, error } = await supabase
        .from('slider_slides')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ message: error.message }, { status: 500 })
      return NextResponse.json({ item: data })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ message: 'id requerido' }, { status: 400 })
      const { error } = await supabase
        .from('slider_slides')
        .delete()
        .eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ message: 'Acción inválida' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error interno' }, { status: 500 })
  }
}


