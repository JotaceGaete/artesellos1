// Ruta de diagnóstico para verificar la configuración de knowledge_base
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    
    // Verificar si la tabla existe
    const { data: tableCheck, error: tableError } = await (supabase as any)
      .from('knowledge_base')
      .select('id')
      .limit(1);

    const diagnostics = {
      supabase_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      table_exists: !tableError,
      table_error: tableError ? {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      } : null,
      sample_query_works: !tableError && tableCheck !== null,
    };

    // Intentar contar registros
    if (!tableError) {
      const { count, error: countError } = await (supabase as any)
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true });
      
      diagnostics.record_count = countError ? null : count;
      diagnostics.count_error = countError ? countError.message : null;
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

