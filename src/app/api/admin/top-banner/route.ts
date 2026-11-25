export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import { requireAdminSession } from '@/lib/adminSession'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('top_banner_messages')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true })
  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req)
    if (authError) return authError
    const supabase = createSupabaseAdmin()
    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const payload = { ...body }
      delete (payload as any).action
      const { data, error } = await (supabase as any)
        .from('top_banner_messages')
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
      const { data, error } = await (supabase as any)
        .from('top_banner_messages')
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
        .from('top_banner_messages')
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


