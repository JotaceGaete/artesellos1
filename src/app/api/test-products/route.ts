export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabaseUtils } from '@/lib/supabase';
import { adaptSupabaseProducts } from '@/lib/productAdapter';

export async function GET() {
  try {
    console.log('🧪 Testing product fetching and adaptation...');
    
    // Test 1: Obtener productos raw de Supabase
    const supabaseProduct = await (supabaseUtils as any).getProduct('sample-id');
    console.log('Raw Supabase product:', supabaseProduct ? 'Found' : 'Not found');
    
    if (!supabaseProduct) {
      return NextResponse.json({
        success: true,
        message: 'No product found in Supabase',
        supabaseProduct: null,
        adaptedProduct: null,
        tests: {
          supabaseQuery: 'Empty result',
          adaptation: 'Skipped'
        }
      });
    }
    
    // Test 2: Mostrar estructura del producto
    console.log('Product structure:', Object.keys(supabaseProduct));
    
    // Test 3: Adaptar producto (convertir a array para el adaptador)
    const adaptedProducts = adaptSupabaseProducts([supabaseProduct]);
    const adaptedProduct = adaptedProducts[0];
    console.log('Adapted product:', adaptedProduct ? 'Success' : 'Failed');
    
    return NextResponse.json({
      success: true,
      message: 'Product test completed',
      supabaseProduct: {
        id: supabaseProduct.id,
        name: supabaseProduct.name,
        price: supabaseProduct.price,
        priceType: typeof supabaseProduct.price,
        imagesType: typeof supabaseProduct.images,
        imagesLength: Array.isArray(supabaseProduct.images) ? supabaseProduct.images.length : 'Not array',
        categoriesType: typeof supabaseProduct.categories,
        structure: Object.keys(supabaseProduct)
      },
      adaptedProduct: adaptedProduct ? {
        id: adaptedProduct.id,
        name: adaptedProduct.name,
        price: adaptedProduct.price,
        priceType: typeof adaptedProduct.price,
        imagesLength: adaptedProduct.images.length,
        categoriesLength: adaptedProduct.categories.length
      } : null,
      tests: {
        supabaseQuery: 'Success',
        adaptation: 'Success'
      }
    });
    
  } catch (error) {
    console.error('💥 Error in product test:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Product test failed',
      tests: {
        supabaseQuery: 'Failed',
        adaptation: 'Failed'
      }
    }, { status: 500 });
  }
}
