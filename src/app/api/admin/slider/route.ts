export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import { requireAdminSession } from '@/lib/adminSession'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const authError = await requireAdminSession(req)
  if (authError) return authError
  try {
    console.log('🔍 Intentando cargar slides desde Supabase...')
    
    const supabase = createSupabaseAdmin()
    console.log('✅ Cliente Supabase creado')
    
    const { data, error } = await supabase
      .from('slider_slides')
      .select('*')
      .eq('active', true)
      .order('slide_order', { ascending: true })
    
    if (error) {
      console.error('❌ Error en consulta Supabase:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    
    console.log('✅ Slides obtenidos:', data?.length || 0, 'slides')
    return NextResponse.json({ items: data || [] })
  } catch (err: any) {
    console.error('❌ Error general en GET slides:', err)
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 })
  }
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
      const { data, error } = await (supabase as any)
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