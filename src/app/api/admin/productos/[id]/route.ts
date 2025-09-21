import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
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
      .neq('id', params.id)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'El slug ya está en uso por otro producto' },
        { status: 400 }
      )
    }

    // Actualizar el producto
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        slug,
        price: Number(price),
        description,
        short_description,
        images: JSON.stringify(images),
        stock_quantity: Number(stock_quantity) || 0,
        stock_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()

    // Verificar que el producto existe
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', params.id)
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
      .eq('product_id', params.id)

    // Eliminar el producto
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

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
