export const runtime = 'edge';

import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/cuenta'

  if (code) {
    const supabase = await createSupabaseServer()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirigir a la página de cuenta o a donde el usuario quería ir
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si hay un error, redirigir al login con mensaje de error
  return NextResponse.redirect(`${origin}/login?error=authentication_failed`)
}
