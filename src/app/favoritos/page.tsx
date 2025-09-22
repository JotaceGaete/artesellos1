'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/lib/favoritesContext';
import { useCart } from '@/lib/cartContext';

export default function FavoritosPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleRemoveFromFavorites = (productId: string) => {
    removeFromFavorites(productId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  if (favorites.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tu lista de deseos está vacía
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Explora nuestros productos y agrega tus favoritos haciendo clic en el corazón.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Explorar Productos
            </Link>
            <Link
              href="/diseno-personalizado"
              className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Diseñar Personalizado
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Lista de Deseos
          </h1>
          <p className="text-gray-600">
            {favorites.items.length} {favorites.items.length === 1 ? 'producto' : 'productos'} guardados
          </p>
        </div>
        <button
          onClick={clearFavorites}
          className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
        >
          Limpiar lista
        </button>
      </div>

      {/* Grid de productos favoritos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.items.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="relative">
              <Link href={`/producto/${product.slug}`}>
                <div className="relative bg-gray-100 flex items-center justify-center" style={{ height: '260px' }}>
                  <Image
                    src={product.images[0]?.src || '/placeholder-product.jpg'}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>

              {/* Botón de quitar de favoritos */}
              <button
                onClick={() => handleRemoveFromFavorites(product.id.toString())}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                title="Quitar de favoritos"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Badges */}
              {product.on_sale && product.sale_price && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  ¡Oferta!
                </div>
              )}
              {product.featured && (
                <div className="absolute top-3 left-3 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Destacado
                </div>
              )}
            </div>

            <div className="p-4">
              {/* Categorías */}
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categories?.slice(0, 2).map((category: any) => (
                  <span
                    key={category.id}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              {/* Nombre del producto */}
              <Link href={`/producto/${product.slug}`}>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              {/* Descripción corta */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.short_description}
              </p>

              {/* Precio */}
              <div className="mb-4">
                {product.on_sale && product.sale_price ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(parseFloat(product.sale_price))}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(parseFloat(product.regular_price))}
                    </span>
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                      -{Math.round((1 - parseFloat(product.sale_price) / parseFloat(product.regular_price)) * 100)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(parseFloat(product.price))}
                  </span>
                )}
              </div>

              {/* Estado del stock */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-xs">
                  {product.stock_status === 'instock' ? (
                    <span className="text-green-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      En stock
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <Link
                  href={`/producto/${product.slug}`}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center text-sm"
                >
                  Ver Detalles
                </Link>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock_status !== 'instock'}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  {product.stock_status === 'instock' ? 'Agregar' : 'Agotado'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones masivas */}
      {favorites.items.length > 1 && (
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Masivas
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                favorites.items.forEach(product => {
                  if (product.stock_status === 'instock') {
                    handleAddToCart(product);
                  }
                });
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Agregar Todos al Carrito
            </button>
            <button
              onClick={clearFavorites}
              className="border border-red-300 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Vaciar Lista de Deseos
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Sabías que...?
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Tus favoritos se guardan automáticamente en tu navegador</li>
              <li>• Puedes agregar productos desde cualquier página</li>
              <li>• Recibirás notificaciones cuando haya ofertas en tus favoritos</li>
              <li>• Comparte tu lista con amigos usando el enlace</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
