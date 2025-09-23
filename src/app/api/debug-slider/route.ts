export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔍 Debug: Verificando configuración de Supabase...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno de Supabase no configuradas',
        config: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('🔍 Debug: Consultando tabla slider_slides...');
    const { data, error } = await supabase
      .from('slider_slides')
      .select('*')
      .eq('active', true)
      .order('slide_order', { ascending: true });

    if (error) {
      console.error('❌ Error al consultar slider_slides:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('✅ Datos obtenidos:', data?.length || 0, 'slides');
    console.log('📊 Primer slide:', data?.[0] || 'No hay datos');

    return NextResponse.json({ 
      success: true,
      count: data?.length || 0,
      items: data || [],
      config: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });

  } catch (err: any) {
    console.error('❌ Error general en debug-slider:', err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Error interno',
      stack: err?.stack
    }, { status: 500 });
  }
}
