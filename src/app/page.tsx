export const runtime = 'edge';

import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import ProductCarousel from '@/components/ProductCarousel';
import Carousel from '@/components/Carousel';
import Categorias from '@/components/Categorias';
// Slides ahora se obtienen desde Supabase vía API admin pública
import { headers } from 'next/headers';
import { carouselSlides } from '@/lib/carouselData';
import { supabaseServerUtils } from '@/lib/supabaseUtils';
import { adaptSupabaseProducts } from '@/lib/productAdapter';

// Obtener y adaptar productos desde Supabase (server) usando utilidades tipadas
async function getMyRealProducts() {
  const supa = await supabaseServerUtils.getProducts();
  return adaptSupabaseProducts(supa);
}

async function getSlides() {
  try {
    // Construir URL absoluta a partir de headers (funciona en dev y prod)
    const hdrs = await headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
    const proto = hdrs.get('x-forwarded-proto') || 'http';
    const base = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || '');
    const url = `${base}/api/admin/slider`;

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) return []
    const apiSlides = (data.items || []).map((s: any, i: number) => ({
      id: i + 1,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      buttonText: s.button_text,
      buttonLink: s.button_link,
      backgroundColor: s.background_color,
      textColor: s.text_color,
      image: s.image_url,
    }))
    return apiSlides.length > 0 ? apiSlides : carouselSlides
  } catch {
    // Fallback a contenido por defecto si falla el API
    return carouselSlides
  }
}

export default async function Home() {
  // 🚀 Usar SOLO datos REALES desde Supabase (sin fallback a mocks)
  const realProducts = await getMyRealProducts();
  const featuredProducts = realProducts.filter((p: any) => p.featured).slice(0, 4);
  const products = realProducts.slice(0, 8);

  return (
    <div>
      {/* Carousel Hero Section */}
      <Carousel 
        slides={await getSlides()} 
        autoplayInterval={6000}
      />

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestros diseños más populares y queridos por nuestros clientes
            </p>
          </div>

          <ProductCarousel
            products={featuredProducts}
            emptyMessage="No hay productos destacados disponibles en este momento."
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explora por Categorías
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra el timbre perfecto para tu ocasión especial
            </p>
          </div>

          <Categorias />
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Todos Nuestros Productos
              </h2>
              <p className="text-lg text-gray-600">
                Explora nuestra colección completa de timbres personalizados
              </p>
            </div>
            <Link
              href="/productos"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Ver todos →
            </Link>
          </div>

          <ProductGrid
            products={products}
            emptyMessage="No hay productos disponibles en este momento."
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Tienes una idea especial?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Podemos crear un diseño personalizado único para ti
          </p>
          <Link
            href="/contacto"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Solicitar Diseño Personalizado
          </Link>
        </div>
      </section>
    </div>
  );
}
