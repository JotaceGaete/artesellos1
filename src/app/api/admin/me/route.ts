export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';

export async function GET(req: NextRequest) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;
  return NextResponse.json({ ok: true });
}
