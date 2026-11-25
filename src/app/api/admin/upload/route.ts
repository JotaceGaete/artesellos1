export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';

const BUCKET = 'images';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No se recibió ningún archivo' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Archivo demasiado grande (máx. 5 MB)' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type) && !file.name.endsWith('.webp')) {
      return NextResponse.json({ message: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || 'webp').toLowerCase();
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
      contentType: file.type || 'image/webp',
      upsert: false,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Error al subir imagen' }, { status: 500 });
  }
}
