'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductoRealPage() {
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMyProduct = async () => {
      try {
        console.log('🚀 Cargando TU producto usando fetch directo...');
        
        // Usar fetch directo a la API de Supabase
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        console.log('🎯 Productos obtenidos vía fetch directo:', products.length);
        
        const product = products[0] || null; // Tu producto "Shiny S-722"
        setProducto(product);
        
        if (product) {
          console.log(`✅ ¡Tu producto cargado: ${product.name}!`);
        }
      } catch (error: any) {
        setError(error.message);
        console.error('❌ Error con fetch directo:', error);
      } finally {
        setLoading(false);
      }
    };

    getMyProduct();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cargando tu producto...
          </h2>
          <p className="text-gray-600">
            Obteniendo datos desde Supabase
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-900 mb-4">
            Error al cargar
          </h1>
          <p className="text-red-600 mb-6">
            {error}
          </p>
          <Link 
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No se encontró tu producto
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudo cargar tu producto desde Supabase. Verifica que tengas productos en tu base de datos.
          </p>
          <Link 
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡TU Producto Real Funciona!
          </h1>
          <p className="text-lg text-gray-600">
            Conectado directamente desde tu Supabase
          </p>
        </div>

        {/* Producto Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="md:flex">
            
            {/* Imagen */}
            <div className="md:w-1/2 bg-gray-100">
              <div className="h-96 flex items-center justify-center p-8">
                {producto.images ? (
                  <img 
                    src={producto.images}
                    alt={producto.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="text-center text-gray-500 hidden">
                  <div className="text-6xl mb-4">📸</div>
                  <p>Imagen no disponible</p>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="md:w-1/2 p-8">
              
              {/* Nombre y Precio */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {producto.name}
                </h2>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ${Math.round(producto.price).toLocaleString('es-CL')}
                </div>
                {producto.featured && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                    ⭐ Producto Destacado
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">
                  {producto.description || producto.short_description || 'Producto de alta calidad'}
                </p>
              </div>

              {/* Detalles */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Información del Producto</h3>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">SKU:</span>
                    <span className="text-gray-900 font-mono text-xs">{producto.slug}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Stock:</span>
                    <span className="text-gray-900">{producto.stock_quantity || 0} unidades</span>
                  </div>
                  
                  {producto.categories && Array.isArray(producto.categories) && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Categoría:</span>
                      <span className="text-gray-900 capitalize">{producto.categories[0]}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Estado:</span>
                    <span className="text-green-600 font-medium">✅ En Stock</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  🛒 Agregar al Carrito
                </button>
                
                <Link 
                  href={`/producto/${producto.slug}`}
                  className="block w-full bg-gray-600 text-white text-center py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Ver Página Completa del Producto
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Información Técnica */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Estado de la Conexión</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">✅ Supabase conectado:</span> Exitoso</p>
            <p><span className="font-medium">✅ Producto encontrado:</span> {producto.name}</p>
            <p><span className="font-medium">✅ Imagen cargada:</span> {producto.images ? 'Sí' : 'No'}</p>
            <p><span className="font-medium">✅ Precio configurado:</span> ${Math.round(producto.price).toLocaleString('es-CL')}</p>
          </div>
        </div>

        {/* Raw Data (para debug) */}
        <details className="bg-gray-100 rounded-lg p-4 mb-8">
          <summary className="font-medium text-gray-900 cursor-pointer">🔍 Ver Datos Raw (Debug)</summary>
          <pre className="mt-4 text-xs bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(producto, null, 2)}
          </pre>
        </details>

        {/* Navegación */}
        <div className="text-center space-x-4">
          <Link 
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Inicio
          </Link>
          
          <Link 
            href="/supabase-demo"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Demo Técnico
          </Link>
        </div>

      </div>
    </div>
  );
}
