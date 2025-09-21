// Adaptador simple y directo para convertir datos de Supabase
export function adaptSupabaseProductSimple(supabaseProduct: any) {
  console.log('🔄 Adaptando producto:', supabaseProduct.name);
  
  return {
    id: Math.abs(supabaseProduct.id.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)),
    name: supabaseProduct.name || 'Producto Sin Nombre',
    slug: supabaseProduct.slug || 'producto',
    description: supabaseProduct.description || 'Descripción del producto',
    short_description: supabaseProduct.short_description || supabaseProduct.name || 'Producto de calidad',
    price: Math.round(supabaseProduct.price || 0).toString(),
    regular_price: Math.round(supabaseProduct.regular_price || supabaseProduct.price || 0).toString(),
    sale_price: '',
    on_sale: false,
    // Manejo específico de imagen (string simple como tienes en Supabase)
    images: [{
      id: 1,
      src: typeof supabaseProduct.images === 'string' 
        ? supabaseProduct.images 
        : 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&q=80',
      name: 'Imagen del producto',
      alt: supabaseProduct.name || 'Imagen del producto'
    }],
    categories: [{
      id: 1,
      name: Array.isArray(supabaseProduct.categories) 
        ? supabaseProduct.categories[0] || 'General'
        : 'General',
      slug: 'general'
    }],
    attributes: [],
    stock_status: 'instock' as const,
    stock_quantity: supabaseProduct.stock_quantity || 10,
    weight: '0.1',
    dimensions: {
      length: '10',
      width: '38', 
      height: '14',
    },
    tags: [],
    featured: supabaseProduct.featured || true,
    date_created: supabaseProduct.created_at,
    date_modified: supabaseProduct.updated_at,
    stamp_info: {
      type: 'automatic' as const,
      default_dimensions: { width: 38, height: 14, unit: 'mm' as const },
      material: 'Polímero premium',
      max_text_lines: 4,
      recommended_uses: ['Documentos oficiales', 'Correspondencia']
    },
    customization_options: {
      allow_custom_dimensions: true,
      dimension_limits: { min_width: 10, max_width: 70, min_height: 10, max_height: 40, unit: 'mm' as const },
      text_customization: {
        max_lines: 5,
        max_chars_per_line: 35,
        supported_fonts: ['Arial', 'Times New Roman', 'Helvetica'],
        allow_multiline: true
      },
      color_options: {
        available_colors: ['#000000', '#FF0000', '#0000FF', '#008000'],
        default_color: '#000000'
      },
      price_multipliers: {
        dimension_multiplier: 15,
        color_multiplier: 1000,
        text_multiplier: 2000
      }
    }
  };
}

export function adaptSupabaseProductsSimple(supabaseProducts: any[]) {
  return supabaseProducts.map(adaptSupabaseProductSimple);
}
