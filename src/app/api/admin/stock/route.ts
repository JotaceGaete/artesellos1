export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin, getUser } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_ADMIN_EMAILS = new Set<string>([
  'jotacegaete@gmail.com',
  'artesellos@outlook.com',
]);

function authorizeOrBypass() {
  return process.env.NEXT_PUBLIC_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production';
}

// GET: Listar todo el stock (con filtros opcionales)
export async function GET(req: NextRequest) {
  try {
    if (!authorizeOrBypass()) {
      const user = await getUser();
      if (!user || !ALLOWED_ADMIN_EMAILS.has(user.email || '')) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    }

    const supabase = createSupabaseAdmin();
    
    // Obtener parámetros de filtro de la URL
    const { searchParams } = new URL(req.url);
    const filterMarca = searchParams.get('marca');
    const filterModelo = searchParams.get('modelo');
    
    let query = supabase
      .from('stock_timbres')
      .select('*');
    
    // Aplicar filtros si existen
    if (filterMarca) {
      query = query.ilike('marca', `%${filterMarca}%`);
    }
    if (filterModelo) {
      query = query.ilike('modelo', `%${filterModelo}%`);
    }
    
    const { data, error } = await query
      .order('marca', { ascending: true })
      .order('modelo', { ascending: true })
      .order('color', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener stock:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data || [] });
  } catch (error: unknown) {
    console.error('❌ Error en GET /api/admin/stock:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener stock';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Actualizar o insertar stock (upsert masivo)
export async function POST(req: NextRequest) {
  try {
    if (!authorizeOrBypass()) {
      const user = await getUser();
      if (!user || !ALLOWED_ADMIN_EMAILS.has(user.email || '')) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Se esperaba un array de items' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Tipo para items de stock
    interface StockItem {
      marca?: string;
      modelo?: string;
      color?: string;
      quantity?: number;
      stock?: number;
      precio?: number;
      medidas?: string;
      imagen_url?: string;
      descripcion?: string;
      categoria?: string;
      id?: number;
      product_sku?: string;
    }

    // Preparar datos para upsert
    const updates = items.map((item: StockItem) => ({
      // Si viene con product_sku, intentar parsearlo
      marca: item.marca || item.product_sku?.split(' ')[0] || '',
      modelo: item.modelo || item.product_sku?.split(' ')[1] || '',
      color: item.color || '',
      stock: item.quantity !== undefined ? item.quantity : (item.stock || 0),
      // Mantener otros campos si existen
      ...(item.precio !== undefined && { precio: item.precio }),
      ...(item.medidas && { medidas: item.medidas }),
      ...(item.imagen_url && { imagen_url: item.imagen_url }),
      ...(item.descripcion && { descripcion: item.descripcion }),
      ...(item.categoria && { categoria: item.categoria }),
      // Mantener id si existe
      ...(item.id && { id: item.id }),
    }));

    // Estrategia: Actualizar uno por uno para mayor compatibilidad
    const results = [];
    const errors = [];

    for (const update of updates) {
      // Intentar actualizar primero
      const { data: updateData, error: updateError } = await supabase
        .from('stock_timbres')
        .update({ stock: update.stock })
        .eq('marca', update.marca)
        .eq('modelo', update.modelo)
        .eq('color', update.color)
        .select();

      if (updateError || !updateData || updateData.length === 0) {
        // Si no existe, intentar insertar
        const { data: insertData, error: insertError } = await supabase
          .from('stock_timbres')
          .insert([update])
          .select();

        if (insertError) {
          console.error(`Error al insertar ${update.marca} ${update.modelo} ${update.color}:`, insertError);
          errors.push({
            item: update,
            error: insertError.message,
          });
        } else if (insertData && insertData.length > 0) {
          results.push(insertData[0]);
        }
      } else {
        results.push(updateData[0]);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json(
        { error: `Error al actualizar stock: ${errors[0].error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: results,
      message: `Stock actualizado: ${results.length} registros procesados${errors.length > 0 ? `, ${errors.length} errores` : ''}`,
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (error: unknown) {
    console.error('❌ Error en POST /api/admin/stock:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al actualizar stock';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

