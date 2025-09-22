export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// API pública para obtener slides (sin autenticación)
export async function GET() {
  try {
    // Usar el cliente público de Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('slider_slides')
      .select('*')
      .eq('active', true)
      .order('slide_order', { ascending: true })

    if (error) {
      console.error('Error al obtener slides:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        items: [] 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      items: data || [] 
    })

  } catch (err: any) {
    console.error('Error general en API slider:', err)
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Error interno',
      items: [] 
    }, { status: 500 })
  }
}
