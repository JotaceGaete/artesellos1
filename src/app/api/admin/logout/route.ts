export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, cookieOptions } from '@/lib/adminSession';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: ADMIN_COOKIE, value: '', ...cookieOptions(0) });
  return res;
}
