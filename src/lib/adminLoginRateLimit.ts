// Límite persistente de intentos de login de administración (fail-closed).
// Usa las funciones admin_login_begin / admin_login_finish de la migración
// 20261125000000_admin_login_attempts.sql. Si la base no responde, NO se permite
// el intento: el login queda bloqueado hasta que el mecanismo vuelva a funcionar.

import type { SupabaseClient } from '@supabase/supabase-js';

export type LoginBegin =
  | { allowed: true; attemptId: number }
  | { allowed: false; retryAfterSec: number }
  | { allowed: false; unavailable: true };

/** HMAC-SHA256 de la IP con el secreto de sesión: no se guarda la IP en claro. */
export async function hashIp(ip: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`login:${ip}`));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Registra el intento como pendiente y comprueba el límite. Fail-closed ante errores. */
export async function beginLoginAttempt(admin: SupabaseClient, ipHash: string): Promise<LoginBegin> {
  try {
    const { data, error } = await admin.rpc('admin_login_begin', { p_ip_hash: ipHash });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== 'boolean') throw new Error('respuesta inesperada de admin_login_begin');
    if (!row.allowed) return { allowed: false, retryAfterSec: Number(row.retry_after_sec) || 900 };
    return { allowed: true, attemptId: Number(row.attempt_id) };
  } catch (err) {
    console.error('[admin/login] ADMIN_LOGIN_GATE_UNAVAILABLE:', err instanceof Error ? err.message : String(err));
    return { allowed: false, unavailable: true };
  }
}

/** Resuelve el intento. Un fallo aquí deja el intento como pendiente (cuenta como fallo). */
export async function finishLoginAttempt(
  admin: SupabaseClient,
  attemptId: number,
  succeeded: boolean,
): Promise<void> {
  try {
    const { error } = await admin.rpc('admin_login_finish', {
      p_attempt_id: attemptId,
      p_succeeded: succeeded,
    });
    if (error) throw error;
  } catch (err) {
    console.error('[admin/login] ADMIN_LOGIN_FINISH_FAILED:', err instanceof Error ? err.message : String(err));
  }
}
