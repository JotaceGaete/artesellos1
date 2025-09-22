'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';
import Link from 'next/link';

// TU TIENDA REAL - Versión que SÍ funciona con Supabase
export default function MiTienda() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProductos() {
      try {
        console.log('🚀 Cargando TU tienda real desde Supabase...');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('❌ Variables de entorno de Supabase no configuradas');
        }

        console.log('🔧 Supabase URL:', supabaseUrl ? 'Configurada ✅' : '❌ Faltante');
        console.log('🔧 Supabase Key:', supabaseKey ? 'Configurada ✅' : '❌ Faltante');

        // Crear cliente de Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Obtener productos directamente
        const { data: productosData, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(`Error de Supabase: ${error.message}`);
        }
        
        if (productosData && productosData.length > 0) {
          setProductos(productosData);
          setMensaje(`¡${productosData.length} productos cargados desde TU Supabase!`);
          console.log('✅', mensaje);
        } else {
          setMensaje('No se encontraron productos en la base de datos.');
          console.log('⚠️ No se encontraron productos');
        }
      } catch (error: any) {
        setMensaje(`Error: ${error.message}`);
        console.error('❌', error);
      } finally {
        setLoading(false);
      }
    }

    loadProductos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏪 Mi Tienda Real
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Productos cargados directamente desde Supabase
          </p>
          
          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-gray-800">
                {mensaje || 'Cargando...'}
              </span>
            </div>
          </div>
        </div>

        {/* Productos Grid */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productos.map((producto) => (
              <div key={producto.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                
                {/* Imagen */}
                <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {producto.images && producto.images.length > 0 ? (
                    <img 
                      src={producto.images[0].src}
                      alt={producto.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <p>Sin imagen</p>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {producto.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {producto.description || producto.short_description || 'Sin descripción'}
                  </p>

                  {/* Precio */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      ${producto.price?.toLocaleString() || 'N/A'}
                    </div>
                    {producto.on_sale && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        En Oferta
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      Stock: {producto.stock_quantity || 'N/A'}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      producto.stock_status === 'instock' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.stock_status === 'instock' ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>

                  {/* Categorías */}
                  {producto.categories && producto.categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {producto.categories.map((categoria, index) => (
                          <span 
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                          >
                            {typeof categoria === 'string' ? categoria : categoria.name || 'Categoría'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {producto.tags && producto.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {producto.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                          >
                            #{typeof tag === 'string' ? tag : tag.name || 'Tag'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div className="flex space-x-2">
                    <Link 
                      href={`/product/${producto.slug}`}
                      className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Ver Producto
                    </Link>
                    <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-600 mb-6">
              {mensaje || 'No se pudieron cargar los productos desde la base de datos.'}
            </p>
            <Link 
              href="/"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎉 ¡Tu tienda está funcionando!
            </h3>
            <p className="text-gray-600 mb-4">
              Los productos se están cargando directamente desde tu base de datos de Supabase.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Ir al Inicio
              </Link>
              <Link 
                href="/productos"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Ver Todos los Productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}