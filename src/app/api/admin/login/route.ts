export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminToken, ADMIN_COOKIE, cookieOptions } from '@/lib/adminSession';
import { publicEnv } from '@/lib/env/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env/server/supabase';

function getAdminClient() {
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body as { password?: unknown };

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single<{ value: string }>();

    if (error) {
      console.error('[admin/login] Supabase error:', error.code, error.message);
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    if (!data) {
      console.error('[admin/login] Row admin_password not found in admin_settings');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    if (password.trim() !== data.value?.trim()) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const token = await createAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: ADMIN_COOKIE, value: token, ...cookieOptions() });
    return res;
  } catch (err) {
    console.error('[admin/login] Unexpected error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
