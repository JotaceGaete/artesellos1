import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_SECRET } from '@/lib/env/server/admin-session';

export const ADMIN_COOKIE = 'admin_session';
const MAX_AGE_SEC = 60 * 60 * 8; // 8 hours

function getSigningSecret(): string {
  return ADMIN_SESSION_SECRET;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createAdminToken(): Promise<string> {
  const now = Date.now();
  const payload = JSON.stringify({ iat: now, exp: now + MAX_AGE_SEC * 1000 });
  const key = await importKey(getSigningSecret());
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const b64Payload = btoa(payload);
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${b64Payload}.${b64Sig}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const dotIdx = token.indexOf('.');
    if (dotIdx === -1) return false;
    const b64Payload = token.slice(0, dotIdx);
    const b64Sig = token.slice(dotIdx + 1);
    const payloadStr = atob(b64Payload);
    const payload = JSON.parse(payloadStr) as { exp?: number };
    if (!payload.exp || Date.now() > payload.exp) return false;
    const key = await importKey(getSigningSecret());
    const sigBytes = Uint8Array.from(atob(b64Sig), c => c.charCodeAt(0));
    return crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(payloadStr),
    );
  } catch {
    return false;
  }
}

export function cookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

/** Returns a 401 NextResponse if the request has no valid admin cookie, null if ok. */
export async function requireAdminSession(
  req: NextRequest,
): Promise<NextResponse | null> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  const valid = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ message: 'Sesión expirada' }, { status: 401 });
  }
  return null;
}
