export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/lib/adminSession';
import { publicEnv } from '@/lib/env/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env/server/supabase';

const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getAdminClient() {
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

async function ensureBucket(supabase: ReturnType<typeof getAdminClient>) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });
  // Ignore "already exists" error
  if (error && !error.message.toLowerCase().includes('already exist')) {
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req);
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Usar JPG, PNG, WebP o GIF.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el límite de 5 MB' }, { status: 400 });
    }

    const supabase = getAdminClient();
    await ensureBucket(supabase);

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error('[upload-image] storage error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('[upload-image] unexpected error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
