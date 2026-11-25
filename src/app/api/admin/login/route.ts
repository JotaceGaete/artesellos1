export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminToken, ADMIN_COOKIE, cookieOptions } from '@/lib/adminSession';
import { publicEnv } from '@/lib/env/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env/server/supabase';
import { ADMIN_SESSION_SECRET } from '@/lib/env/server/admin-session';
import { constantTimeEqual, verifyPasswordHash } from '@/lib/adminPasswordHash';
import { beginLoginAttempt, finishLoginAttempt, hashIp } from '@/lib/adminLoginRateLimit';
import { getTrustedClientIp } from '@/lib/clientIp';

function getAdminClient() {
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

const encoder = new TextEncoder();

/** Lee la contraseña: el hash (si existe) tiene prioridad sobre el texto plano legado. */
async function verifyAdminPassword(
  supabase: ReturnType<typeof getAdminClient>,
  password: string,
): Promise<{ ok: boolean; matched?: boolean; reason?: string }> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('key, value')
    .in('key', ['admin_password_hash', 'admin_password']);

  if (error) return { ok: false, reason: `supabase: ${error.code} ${error.message}` };
  const rows = (data ?? []) as Array<{ key: string; value: string }>;
  const hashRow = rows.find(r => r.key === 'admin_password_hash');
  const plainRow = rows.find(r => r.key === 'admin_password');

  if (hashRow?.value) {
    return { ok: true, matched: await verifyPasswordHash(password, hashRow.value.trim()) };
  }
  if (plainRow?.value) {
    return {
      ok: true,
      matched: constantTimeEqual(encoder.encode(password.trim()), encoder.encode(plainRow.value.trim())),
    };
  }
  return { ok: false, reason: 'sin admin_password ni admin_password_hash' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body as { password?: unknown };

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const clientIp = getTrustedClientIp(req);
    if (!clientIp) {
      // Sin IP confiable no se puede aplicar el límite: fail-closed.
      return NextResponse.json({ error: 'Servicio no disponible, intenta más tarde' }, { status: 503 });
    }
    const ipHash = await hashIp(clientIp, ADMIN_SESSION_SECRET);

    const begin = await beginLoginAttempt(supabase, ipHash);
    if (begin.allowed === false && 'unavailable' in begin) {
      return NextResponse.json(
        { error: 'Servicio de acceso no disponible. Intenta más tarde.' },
        { status: 503, headers: { 'Retry-After': '60' } },
      );
    }
    if (begin.allowed === false) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta más tarde.' },
        { status: 429, headers: { 'Retry-After': String((begin as { retryAfterSec: number }).retryAfterSec) } },
      );
    }

    const verification = await verifyAdminPassword(supabase, password);
    if (!verification.ok) {
      await finishLoginAttempt(supabase, begin.attemptId, false);
      console.error('[admin/login] Error de configuración:', verification.reason);
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    if (verification.matched !== true) {
      await finishLoginAttempt(supabase, begin.attemptId, false);
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    await finishLoginAttempt(supabase, begin.attemptId, true);
    const token = await createAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: ADMIN_COOKIE, value: token, ...cookieOptions() });
    return res;
  } catch (err) {
    console.error('[admin/login] Unexpected error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
