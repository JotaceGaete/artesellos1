export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('[admin/login] NEXT_PUBLIC_SUPABASE_URL present:', !!url);
  console.log('[admin/login] SUPABASE_SERVICE_ROLE_KEY present:', !!key);

  if (!url || !key) throw new Error('Supabase config missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body as { password?: unknown };

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
    }

    console.log('[admin/login] password length received:', password.length);

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single<{ value: string }>();

    if (error) {
      console.error('[admin/login] Supabase error code:', error.code);
      console.error('[admin/login] Supabase error message:', error.message);
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    if (!data) {
      console.error('[admin/login] Row admin_password not found in admin_settings');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    console.log('[admin/login] Row found. Stored value length:', data.value?.length ?? 'null');

    const receivedPassword = password.trim();
    const storedPassword = data.value?.trim();

    console.log('[admin/login] Received length after trim:', receivedPassword.length);
    console.log('[admin/login] Stored length after trim:', storedPassword?.length ?? 'null');
    console.log('[admin/login] Match:', receivedPassword === storedPassword);

    if (receivedPassword !== storedPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/login] Unexpected error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
