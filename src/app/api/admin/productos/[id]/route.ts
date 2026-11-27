export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import { loadCategories } from '@/lib/categoriesServer';
import { unknownCategorySlugs } from '@/lib/categories';
import { requireAdminSession } from '@/lib/adminSession'
import type { Json } from '@/types/database'
import { normalizeProductImages, resolveImagesUpdate } from '@/lib/productImages'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

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
    // products.images es TEXT en la base: se normaliza a string[] para el frontend.
    return NextResponse.json(normalizeProductImages(product))
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
    }
    const {
      name,
      slug,
      price,
      regular_price,
      description,
      short_description,
      stock_quantity,
      stock_status,
      categories,
      featured,
      tags,
    } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    // Protección de imágenes: ausente = conservar; inválido = 400; [] solo con clear_images: true.
    const imagesUpdate = resolveImagesUpdate(body)
    if ('error' in imagesUpdate) {
      return NextResponse.json({ error: imagesUpdate.error }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Las categorías deben existir en la tabla categories (o en el respaldo del código).
    const categorySlugs = Array.isArray(categories) ? categories.map((s: any) => String(s).trim()).filter(Boolean) : []
    const { categories: knownCategories } = await loadCategories(supabase)
    const unknown = unknownCategorySlugs(categorySlugs, knownCategories)
    if (unknown.length > 0) {
      return NextResponse.json({ error: `Categoría inexistente: ${unknown.join(', ')}` }, { status: 400 })
    }

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

    const updateData: Record<string, unknown> = {
      name: String(name).trim(),
      slug: String(slug).trim(),
      price: priceNum,
      regular_price: regularPriceNum,
      description: description ?? '',
      short_description: short_description ?? '',
      stock_quantity: Number(stock_quantity) || 0,
      stock_status: (stock_status === 'outofstock' ? 'outofstock' : 'instock') as 'instock' | 'outofstock',
      categories: (Array.isArray(categories) ? categories.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      featured: Boolean(featured),
      tags: (Array.isArray(tags) ? tags.map((s: any) => String(s).trim()).filter(Boolean) : []) as Json,
      updated_at: new Date().toISOString(),
    }
    if (imagesUpdate.action === 'set') {
      updateData.images = imagesUpdate.value
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

    return NextResponse.json({ success: true, product: normalizeProductImages(product), message: 'Producto actualizado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * Actualización parcial de visibilidad. Solo toca `stock_status` (y `updated_at`);
 * nunca lee ni escribe `images` ni otros campos.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json().catch(() => null)
    const stockStatus = body && typeof body === 'object' ? (body as Record<string, unknown>).stock_status : undefined
    if (stockStatus !== 'instock' && stockStatus !== 'outofstock') {
      return NextResponse.json({ error: 'stock_status debe ser "instock" u "outofstock"' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: product, error } = await (supabase as any)
      .from('products')
      .update({ stock_status: stockStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, stock_status')
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Error al cambiar la visibilidad' }, { status: 500 })
    }
    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

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
