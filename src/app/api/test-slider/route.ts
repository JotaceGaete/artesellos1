export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'

export async function GET() {
  try {
    console.log('🧪 Test: Verificando conexión a Supabase...')
    
    // Test 1: Crear cliente
    const supabase = createSupabaseAdmin()
    console.log('✅ Cliente Supabase creado')
    
    // Test 2: Verificar tabla existe
    const { data, error } = await supabase
      .from('slider_slides')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Error al acceder a tabla slider_slides:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        step: 'table_access'
      })
    }
    
    console.log('✅ Tabla slider_slides accesible')
    
    // Test 3: Obtener slides activos
    const { data: slides, error: slidesError } = await supabase
      .from('slider_slides')
      .select('*')
      .eq('active', true)
      .order('slide_order', { ascending: true })
    
    if (slidesError) {
      console.error('❌ Error al obtener slides:', slidesError)
      return NextResponse.json({ 
        success: false, 
        error: slidesError.message,
        step: 'get_slides'
      })
    }
    
    console.log('✅ Slides obtenidos:', slides?.length || 0)
    
    return NextResponse.json({ 
      success: true,
      slidesCount: slides?.length || 0,
      slides: slides || []
    })
    
  } catch (err: any) {
    console.error('❌ Error general:', err)
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Error interno',
      step: 'general'
    })
  }
}
