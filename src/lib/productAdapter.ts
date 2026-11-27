import { Product as MockProduct } from '@/types/product';
import { Product as SupabaseProduct } from '@/lib/supabase';
import { resolveAssetUrl } from '@/lib/assetUrl';
import { parseImages } from '@/lib/productImages';

const PLACEHOLDER_IMAGE = 'https://media.artesellos.cl/sin-image-producto-artesellos.png';

 /**
 * Adaptador para convertir productos de Supabase al formato esperado por los componentes
 */
export function adaptSupabaseProduct(supabaseProduct: SupabaseProduct): MockProduct {
  // Generar un ID numérico basado en hash del UUID para consistencia
  const numericId = Math.abs(supabaseProduct.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));

  return {
    id: numericId,
    name: supabaseProduct.name,
    slug: supabaseProduct.slug,
    description: supabaseProduct.description || 'Producto de calidad premium',
    short_description: supabaseProduct.short_description || supabaseProduct.name,
    price: Math.round(supabaseProduct.price).toString(),
    regular_price: Math.round(supabaseProduct.regular_price).toString(),
    sale_price: supabaseProduct.sale_price ? Math.round(supabaseProduct.sale_price).toString() : '',
    on_sale: supabaseProduct.on_sale || false,
    images: adaptImages(supabaseProduct.images, supabaseProduct.id),
    categories: adaptCategories(supabaseProduct.categories),
    attributes: adaptAttributes(supabaseProduct.attributes),
    stock_status: supabaseProduct.stock_status || 'instock',
    stock_quantity: supabaseProduct.stock_quantity || 10,
    weight: supabaseProduct.weight?.toString() || '0.1',
    dimensions: {
      length: supabaseProduct.dimensions?.length?.toString() || '10',
      width: supabaseProduct.dimensions?.width?.toString() || '38',
      height: supabaseProduct.dimensions?.height?.toString() || '14',
    },
    tags: adaptTags(supabaseProduct.tags),
    
    // --- CORRECCIÓN AQUÍ ---
    // Antes: forzaba true si era false.
    // Ahora: Solo es true si en la DB es true. Si es null o false, queda false.
    featured: supabaseProduct.featured === true, 
    // -----------------------

    date_created: supabaseProduct.created_at,
    date_modified: supabaseProduct.updated_at,
    // Configuración específica para timbres
    stamp_info: {
      type: 'automatic',
      default_dimensions: { width: 38, height: 14, unit: 'mm' },
      material: 'Polímero premium',
      max_text_lines: 4,
      recommended_uses: ['Documentos oficiales', 'Correspondencia', 'Facturas', 'Contratos']
    },
    customization_options: {
      allow_custom_dimensions: true,
      dimension_limits: { min_width: 10, max_width: 70, min_height: 10, max_height: 40, unit: 'mm' },
      text_customization: {
        max_lines: 5,
        max_chars_per_line: 35,
        supported_fonts: ['Arial', 'Times New Roman', 'Helvetica', 'Calibri'],
        allow_multiline: true
      },
      color_options: {
        available_colors: ['#000000', '#FF0000', '#0000FF', '#008000', '#800080'],
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

/**
 * Adaptador para convertir múltiples productos
 */
export function adaptSupabaseProducts(supabaseProducts: SupabaseProduct[]): MockProduct[] {
  return supabaseProducts.map(adaptSupabaseProduct);
}

/**
 * Convierte products.images en la lista de imágenes del catálogo público.
 *
 * Usa parseImages, la misma lectura que el administrador: así la primera imagen
 * del administrador es siempre la principal del catálogo, también con valores
 * antiguos guardados como JSON en texto o serializados dos veces.
 */
function adaptImages(images: unknown, _productId: string): MockProduct['images'] {
  const urls = parseImages(images);
  if (urls.length === 0) {
    return [{
      id: 1,
      src: PLACEHOLDER_IMAGE,
      name: 'Imagen del producto',
      alt: 'Imagen del producto'
    }];
  }
  return urls.map((url, index) => ({
    id: index + 1,
    src: resolveAssetUrl(url),
    name: `Imagen ${index + 1}`,
    alt: `Imagen del producto ${index + 1}`
  }));
}

/**
 * Convierte array de strings de categorías a array de objetos ProductCategory
 */
function adaptCategories(categories: string[]): MockProduct['categories'] {
  if (!categories || categories.length === 0) {
    return [{ id: 1, name: 'General', slug: 'general' }];
  }

  return categories.map((categoryName, index) => ({
    id: index + 1,
    name: categoryName,
    slug: categoryName.toLowerCase().replace(/\s+/g, '-')
  }));
}

/**
 * Convierte atributos de Supabase a formato Mock
 * Los atributos pueden venir como:
 * - Un objeto con propiedades (ej: {marca: "Shiny", modelo: "722"})
 * - Un array de objetos (formato estándar)
 * - null o undefined
 */
function adaptAttributes(attributes: any): MockProduct['attributes'] {
  // Si no hay atributos
  if (!attributes) {
    return [];
  }

  // Si es un array vacío
  if (Array.isArray(attributes) && attributes.length === 0) {
    return [];
  }

  // Si es un array con elementos (formato estándar)
  if (Array.isArray(attributes) && attributes.length > 0) {
    return attributes.map((attr, index) => ({
      id: index + 1,
      name: attr.name || 'Atributo',
      options: attr.options || [],
      visible: attr.visible !== false,
      variation: attr.variation || false
    }));
  }

  // Si es un objeto (formato alternativo de Supabase)
  if (typeof attributes === 'object' && !Array.isArray(attributes)) {
    // Convertir el objeto a un array de atributos
    return Object.entries(attributes).map(([key, value], index) => ({
      id: index + 1,
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar primera letra
      options: [String(value)], // Convertir el valor a array de opciones
      visible: true,
      variation: false
    }));
  }

  return [];
}

/**
 * Convierte array de strings de tags a array de objetos ProductTag
 */
function adaptTags(tags: string[]): MockProduct['tags'] {
  if (!tags || tags.length === 0) {
    return [];
  }

  return tags.map((tagName, index) => ({
    id: index + 1,
    name: tagName,
    slug: tagName.toLowerCase().replace(/\s+/g, '-')
  }));
}
