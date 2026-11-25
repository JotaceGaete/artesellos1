export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin()
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const {
      name,
      slug,
      price,
      regular_price,
      description,
      short_description,
      images,
      stock_quantity,
      stock_status,
      categories,
      featured,
      tags,
    } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Verificar unicidad del slug
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'El slug ya está en uso por otro producto' }, { status: 400 })
    }

    const priceNum = Math.round(Number(price) || 0)
    const regularPriceNum = Math.round(Number(regular_price) || priceNum)

    const updateData = {
      name: String(name).trim(),
      slug: String(slug).trim(),
      price: priceNum,
      regular_price: regularPriceNum,
      description: description ?? '',
      short_description: short_description ?? '',
      images: (Array.isArray(images) ? images.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      stock_quantity: Number(stock_quantity) || 0,
      stock_status: (stock_status === 'outofstock' ? 'outofstock' : 'instock') as 'instock' | 'outofstock',
      categories: (Array.isArray(categories) ? categories.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      featured: Boolean(featured),
      tags: (Array.isArray(tags) ? tags.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      updated_at: new Date().toISOString(),
    }

    const { data: product, error } = await (supabase as any)
      .from('products')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 })
    }

    return NextResponse.json({ success: true, product, message: 'Producto actualizado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin()

    const { data: productToDelete, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !productToDelete) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    await supabase.from('product_colors').delete().eq('product_id', id)

    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Producto eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
