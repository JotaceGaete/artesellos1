export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, computeAdminToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { password } = body as { password?: string };

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ message: 'Admin no configurado. Define ADMIN_PASSWORD en .env.local' }, { status: 500 });
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
  }

  const token = await computeAdminToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}
