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

// Rangos publicados de Cloudflare (https://www.cloudflare.com/ips/). artesellos.cl pasa por el
// proxy de Cloudflare, así que Vercel ve en x-forwarded-for la IP del nodo de Cloudflare, que cambia
// en cada petición. Solo cuando la conexión viene de uno de estos rangos se confía en
// cf-connecting-ip; si alguien llega directo a Vercel, esa cabecera se ignora y no puede falsificarse.
const CLOUDFLARE_CIDRS = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
];

function ipv4ToBigInt(ip: string): bigint | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = BigInt(0);
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = (n << BigInt(8)) | BigInt(v);
  }
  return n;
}

function ipv6ToBigInt(ip: string): bigint | null {
  if (!ip.includes(':')) return null;
  const zone = ip.indexOf('%');
  if (zone !== -1) ip = ip.slice(0, zone);
  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  let n = BigInt(0);
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(g)) return null;
    n = (n << BigInt(16)) | BigInt(parseInt(g, 16));
  }
  return n;
}

function parseIp(ip: string): { value: bigint; bits: number } | null {
  const v4 = ipv4ToBigInt(ip);
  if (v4 !== null) return { value: v4, bits: 32 };
  const v6 = ipv6ToBigInt(ip);
  if (v6 !== null) return { value: v6, bits: 128 };
  return null;
}

export function isCloudflareIp(ip: string): boolean {
  const addr = parseIp(ip.trim());
  if (!addr) return false;
  return CLOUDFLARE_CIDRS.some(cidr => {
    const [base, lenStr] = cidr.split('/');
    const net = parseIp(base);
    if (!net || net.bits !== addr.bits) return false;
    const shift = BigInt(addr.bits - Number(lenStr));
    return (addr.value >> shift) === (net.value >> shift);
  });
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const connecting = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip')?.trim() || 'unknown';
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  if (cfIp && parseIp(cfIp) && isCloudflareIp(connecting)) return cfIp;
  return connecting;
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
