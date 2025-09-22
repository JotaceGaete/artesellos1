export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verificar que la tabla existe y tiene datos
    const { data, error, count } = await supabase
      .from('slider_slides')
      .select('*', { count: 'exact' })
      .eq('active', true)

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        tableExists: false
      })
    }

    return NextResponse.json({ 
      success: true,
      count: count || 0,
      slides: data || [],
      tableExists: true
    })

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Error interno',
      tableExists: false
    })
  }
}
