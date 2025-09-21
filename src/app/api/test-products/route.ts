import { NextResponse } from 'next/server';
import { supabaseUtils } from '@/lib/supabase';
import { adaptSupabaseProducts } from '@/lib/productAdapter';

export async function GET() {
  try {
    console.log('🧪 Testing product fetching and adaptation...');
    
    // Test 1: Obtener productos raw de Supabase
    const supabaseProducts = await supabaseUtils.getProducts();
    console.log('Raw Supabase products:', supabaseProducts?.length || 0);
    
    if (!supabaseProducts || supabaseProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found in Supabase',
        supabaseProducts: [],
        adaptedProducts: [],
        tests: {
          supabaseQuery: 'Empty result',
          adaptation: 'Skipped'
        }
      });
    }
    
    // Test 2: Mostrar estructura del primer producto
    const firstProduct = supabaseProducts[0];
    console.log('First product structure:', Object.keys(firstProduct));
    
    // Test 3: Adaptar productos
    const adaptedProducts = adaptSupabaseProducts(supabaseProducts);
    console.log('Adapted products:', adaptedProducts?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Product test completed',
      counts: {
        supabase: supabaseProducts.length,
        adapted: adaptedProducts.length
      },
      firstSupabaseProduct: {
        id: firstProduct.id,
        name: firstProduct.name,
        price: firstProduct.price,
        priceType: typeof firstProduct.price,
        imagesType: typeof firstProduct.images,
        imagesLength: Array.isArray(firstProduct.images) ? firstProduct.images.length : 'Not array',
        categoriesType: typeof firstProduct.categories,
        structure: Object.keys(firstProduct)
      },
      firstAdaptedProduct: adaptedProducts[0] ? {
        id: adaptedProducts[0].id,
        name: adaptedProducts[0].name,
        price: adaptedProducts[0].price,
        priceType: typeof adaptedProducts[0].price,
        imagesLength: adaptedProducts[0].images.length,
        categoriesLength: adaptedProducts[0].categories.length
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
