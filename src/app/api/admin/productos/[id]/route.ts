import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import type { Database, Json } from '@/types/database'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener producto por ID
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
      console.error('Error fetching product:', error)
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error in GET /api/admin/productos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar producto
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
      description,
      short_description,
      images,
      stock_quantity,
      stock_status
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nombre y slug son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Verificar que el slug no esté en uso por otro producto
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'El slug ya está en uso por otro producto' },
        { status: 400 }
      )
    }

    // Construir payload para actualización
    const updateData = {
      name: name as string,
      slug: slug as string,
      price: Number(price) as number,
      description: description as string,
      short_description: short_description as string,
      images: images as Json,
      stock_quantity: Number(stock_quantity) || 0,
      stock_status: stock_status as 'instock' | 'outofstock' | 'onbackorder',
      updated_at: new Date().toISOString()
    }

    // Actualizar el producto - usar any para evitar inferencia never
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      product,
      message: 'Producto actualizado exitosamente' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/productos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin()

    // Verificar que el producto existe
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar colores relacionados primero (si existen)
    await supabase
      .from('product_colors')
      .delete()
      .eq('product_id', id)

    // Eliminar el producto
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar el producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `Producto "${product.name}" eliminado exitosamente` 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/productos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
