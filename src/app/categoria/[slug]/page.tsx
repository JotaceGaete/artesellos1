'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/woocommerce';
import ProductCard from '@/components/ProductCard';
import type { Product as ProductType } from '@/types/product';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  featured: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  
  const [products, setProducts] = useState<ProductType[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const productsPerPage = 12;

  useEffect(() => {
    if (slug) {
      loadCategoryAndProducts();
    }
  }, [currentPage, slug]);

  // Función para convertir productos de WooCommerce al formato esperado por ProductCard
  const convertWooCommerceToProductType = (wooProduct: Product): ProductType => {
    return {
      id: wooProduct.id,
      name: wooProduct.name,
      slug: wooProduct.slug,
      description: wooProduct.description,
      short_description: wooProduct.short_description,
      price: wooProduct.price,
      regular_price: wooProduct.regular_price,
      sale_price: wooProduct.sale_price,
      on_sale: wooProduct.on_sale,
      images: wooProduct.images,
      categories: wooProduct.categories,
      attributes: [],
      stock_status: wooProduct.stock_status,
      stock_quantity: null,
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      tags: [],
      featured: wooProduct.featured,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    };
  };

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);

      // Cargar todas las categorías
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);

      // Encontrar la categoría actual
      const currentCategory = categoriesData?.find(cat => cat.slug === slug);
      setCategory(currentCategory || null);

      // Cargar productos de la categoría
      const filters: any = {
        per_page: productsPerPage,
        page: currentPage,
      };

      if (currentCategory) {
        filters.category = currentCategory.id;
      }

      const result = await getProducts(filters);
      const convertedProducts = (result.products || []).map(convertWooCommerceToProductType);
      setProducts(convertedProducts);
      setTotalPages(Math.ceil((result.products || []).length / productsPerPage));

    } catch (error) {
      console.error('Error loading category products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCategoryDescription = (slug: string) => {
    const descriptions: Record<string, string> = {
      'romanticos': 'Timbres perfectos para ocasiones románticas, aniversarios y momentos especiales con tu pareja.',
      'celebraciones': 'Celebra cumpleaños, graduaciones y otros momentos felices con nuestros diseños festivos.',
      'infantiles': 'Diseños tiernos y coloridos para celebrar la llegada de un nuevo miembro a la familia.',
      'bodas': 'Timbres elegantes para invitaciones matrimoniales y celebraciones nupciales.',
      'academicos': 'Celebra logros académicos con diseños profesionales y motivadores.',
      'festivos': 'Timbres para Navidad y otras celebraciones especiales del año.',
    };

    return descriptions[slug] || `Descubre nuestros timbres de la categoría ${formatCategoryName(slug)}.`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Inicio
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900">{category?.name || formatCategoryName(slug)}</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {category?.name || formatCategoryName(slug)}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          {getCategoryDescription(slug)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar con categorías */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Categorías
            </h3>
            <nav className="space-y-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    cat.slug === slug
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{cat.name}</span>
                    {cat.count && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {cat.count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>

            {/* Enlaces útiles */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Enlaces Útiles
              </h4>
              <div className="space-y-2">
                <Link
                  href="/productos"
                  className="block text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Ver todos los productos
                </Link>
                <Link
                  href="/cotizaciones"
                  className="block text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Solicitar cotización
                </Link>
                <Link
                  href="/contacto"
                  className="block text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Contactar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          {products.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNumber
                              ? 'text-indigo-600 bg-indigo-50 border border-indigo-500'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l6 3" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay productos en esta categoría
              </h3>
              <p className="text-gray-600 mb-6">
                Actualmente no tenemos productos disponibles en la categoría {category?.name || formatCategoryName(slug)}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/productos"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Ver todos los productos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          ¿No encuentras lo que buscas?
        </h2>
        <p className="text-lg mb-6 text-indigo-100">
          Contáctanos y te ayudaremos a encontrar el producto perfecto
        </p>
        <div className="flex justify-center">
          <Link
            href="/contacto"
            className="px-8 py-3 text-sm font-semibold text-indigo-600 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Contactar
          </Link>
        </div>
      </div>
    </div>
  );
}
