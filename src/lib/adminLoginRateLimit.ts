// Límite persistente de intentos de login de administración.
// Persiste en la tabla admin_login_attempts (Supabase), por lo que sobrevive
// a los reinicios de las funciones serverless de Vercel.
// Si la tabla no existe o la consulta falla, se registra el error y se permite
// el intento (la contraseña sigue siendo obligatoria). Ver la migración asociada.

import type { SupabaseClient } from '@supabase/supabase-js';

export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_IP = 5;
export const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
export const MAX_FAILURES_GLOBAL = 50;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export type LoginGate = { allowed: boolean; retryAfterSec?: number };

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

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

async function countFailures(
  admin: SupabaseClient,
  sinceIso: string,
  ipHash?: string,
): Promise<number> {
  let query = admin
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('succeeded', false)
    .gte('created_at', sinceIso);
  if (ipHash) query = query.eq('ip_hash', ipHash);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function checkLoginGate(admin: SupabaseClient, ipHash: string): Promise<LoginGate> {
  try {
    const now = Date.now();
    const perIp = await countFailures(admin, new Date(now - WINDOW_MS).toISOString(), ipHash);
    if (perIp >= MAX_FAILURES_PER_IP) {
      return { allowed: false, retryAfterSec: Math.ceil(WINDOW_MS / 1000) };
    }
    const global = await countFailures(admin, new Date(now - GLOBAL_WINDOW_MS).toISOString());
    if (global >= MAX_FAILURES_GLOBAL) {
      return { allowed: false, retryAfterSec: Math.ceil(GLOBAL_WINDOW_MS / 1000) };
    }
    return { allowed: true };
  } catch (err) {
    console.error('[admin/login] Límite de intentos no disponible, se permite el intento:', err instanceof Error ? err.message : String(err));
    return { allowed: true };
  }
}

export async function recordLoginAttempt(
  admin: SupabaseClient,
  ipHash: string,
  succeeded: boolean,
): Promise<void> {
  try {
    const { error } = await admin
      .from('admin_login_attempts')
      .insert({ ip_hash: ipHash, succeeded });
    if (error) throw error;
    if (!succeeded) {
      // Limpieza básica de registros antiguos.
      await admin
        .from('admin_login_attempts')
        .delete()
        .lt('created_at', new Date(Date.now() - RETENTION_MS).toISOString());
    }
  } catch (err) {
    console.error('[admin/login] No se pudo registrar el intento:', err instanceof Error ? err.message : String(err));
  }
}
