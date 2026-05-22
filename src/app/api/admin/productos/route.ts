export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import { requireAdminSession } from '@/lib/adminSession'

// GET - Listar productos
export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req)
    if (authError) return authError

    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'list') {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 })
      }

      return NextResponse.json({ products: products || [] })
    }

    return NextResponse.json({ message: 'Acción no válida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdminSession(req)
    if (authError) return authError

    const body = await req.json().catch(() => ({}))
    const { name, slug, price, description, short_description, images, categories } = body as {
      name: string
      slug: string
      price: number
      description?: string
      short_description?: string
      images?: string[]
      categories?: string[]
    }

    if (!name || !slug || !Number.isFinite(price)) {
      return NextResponse.json({ message: 'Datos inválidos (nombre, slug, precio)' }, { status: 400 })
    }

    // Usar admin para insertar y evitar RLS
    const supabase = createSupabaseAdmin()

    // Normalizar imágenes: array de strings
    const normalizedImages: string[] = Array.isArray(images)
      ? images.map((s) => String(s).trim()).filter(Boolean)
      : []
    const normalizedCategories: string[] = Array.isArray(categories)
      ? categories.map((s) => String(s).trim()).filter(Boolean)
      : []

    const payload: any = {
      name,
      slug,
      price: Math.round(price),
      regular_price: Math.round(price),
      on_sale: false,
      description: description ?? '',
      short_description: short_description ?? '',
      images: normalizedImages,
      categories: normalizedCategories,
      attributes: [],
      stock_status: 'instock',
      stock_quantity: 10,
      tags: [],
      featured: false,
    }

    const { data, error } = await (supabase as any)
      .from('products')
      .insert([payload])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, product: data })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error interno' }, { status: 500 })
  }
}


