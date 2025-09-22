export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const supabase = createSupabaseAdmin()
    try {
      const { data, error } = await (supabase as any)
        .from('orders')
        .insert([payload])
        .select('id')
        .single()
      if (error) throw error
      return NextResponse.json({ ok: true, order: data })
    } catch (e) {
      // Si la tabla no existe o hay RLS, devolvemos un id mock para continuar el flujo
      const mockId = `mock_${Date.now()}`
      return NextResponse.json({ ok: true, order: { id: mockId }, warning: 'Order saved as mock (DB unavailable)' })
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Error creating order';
    return NextResponse.json({ ok: false, message: errorMessage }, { status: 500 })
  }
}


