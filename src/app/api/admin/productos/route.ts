export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseServer';
import type { Json } from '@/types/database';

// Middleware protege esta ruta — no se requiere auth adicional aquí

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) return NextResponse.json({ message: error.message }, { status: 500 });
      return NextResponse.json({ products: products || [] });
    }

    return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name, slug, price, regular_price,
      description, short_description,
      images, categories, tags,
      featured, stock_status, stock_quantity,
    } = body as {
      name: string; slug: string; price: number; regular_price?: number;
      description?: string; short_description?: string;
      images?: string[]; categories?: string[]; tags?: string[];
      featured?: boolean; stock_status?: string; stock_quantity?: number;
    };

    if (!name || !slug || !Number.isFinite(price)) {
      return NextResponse.json({ message: 'Datos inválidos (nombre, slug, precio requeridos)' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Verificar unicidad del slug
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'El slug ya está en uso' }, { status: 400 });
    }

    const priceNum = Math.round(Number(price) || 0);
    const regularPriceNum = Math.round(Number(regular_price) || priceNum);

    const payload = {
      name: String(name).trim(),
      slug: String(slug).trim(),
      price: priceNum,
      regular_price: regularPriceNum,
      on_sale: regularPriceNum > priceNum,
      description: description ?? '',
      short_description: short_description ?? '',
      images: (Array.isArray(images) ? images.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      categories: (Array.isArray(categories) ? categories.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      tags: (Array.isArray(tags) ? tags.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      featured: Boolean(featured),
      stock_status: (stock_status === 'outofstock' ? 'outofstock' : 'instock') as 'instock' | 'outofstock',
      stock_quantity: Number(stock_quantity) || 10,
      attributes: [] as Json,
    };

    const { data, error } = await (supabase as any)
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 });
  }
}
