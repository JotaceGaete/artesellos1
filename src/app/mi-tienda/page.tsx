// TU TIENDA REAL - Versión que SÍ funciona con Supabase
export default async function MiTienda() {
  let productos = [];
  let mensaje = '';

  try {
    console.log('🚀 Cargando TU tienda real desde Supabase...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*&order=created_at.desc`, {
      headers: {
        'apikey': supabaseKey || '',
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      productos = data;
      mensaje = `¡${productos.length} productos cargados desde TU Supabase!`;
      console.log('✅', mensaje);
    } else {
      mensaje = `Error ${response.status}: ${response.statusText}`;
    }
  } catch (error: any) {
    mensaje = `Error: ${error.message}`;
    console.error('❌', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">🎯 Artesellos</h1>
          <p className="text-xl mb-2">Tu Tienda Real de Timbres Personalizados</p>
          <p className="text-indigo-200">{mensaje}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {productos.length > 0 ? (
          <>
            {/* Productos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map((producto) => (
                <div key={producto.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  
                  {/* Imagen */}
                  <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {producto.images ? (
                      <img 
                        src={producto.images}
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
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {producto.name}
                      </h3>
                      {producto.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          ⭐ Destacado
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {producto.description || producto.short_description || 'Timbre personalizado de alta calidad'}
                    </p>

                    {/* Precio */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-green-600">
                        ${Math.round(producto.price).toLocaleString('es-CL')}
                      </div>
                      {producto.regular_price && producto.regular_price !== producto.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ${Math.round(producto.regular_price).toLocaleString('es-CL')}
                        </div>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className="text-green-600">✅ {producto.stock_quantity || 0} disponibles</span>
                      </div>
                      {producto.categories && Array.isArray(producto.categories) && (
                        <div className="flex justify-between">
                          <span>Categoría:</span>
                          <span className="capitalize">{producto.categories[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="space-y-2">
                      <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                        🛒 Agregar al Carrito
                      </button>
                      
                      <a 
                        href={`/producto/${producto.slug}`}
                        className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Ver Detalles
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-8">📊 Estado de Tu Tienda</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{productos.length}</div>
                  <div className="text-gray-700">Productos Activos</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">✅</div>
                  <div className="text-gray-700">Supabase Conectado</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">🚀</div>
                  <div className="text-gray-700">Tienda Funcionando</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Estado sin productos
          <div className="text-center py-16">
            <div className="text-6xl mb-8">📦</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Tu tienda está lista!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Agrega productos en tu panel de Supabase para verlos aquí.
              La conexión está funcionando correctamente.
            </p>
            <div className="space-x-4">
              <a 
                href="/supabase-demo"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Ver Demo Técnico
              </a>
              <a 
                href="/"
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver al Inicio
              </a>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="mt-12 text-center space-x-4">
          <a 
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Inicio
          </a>
          
          <a 
            href="/supabase-demo"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Demo Técnico
          </a>
          
          <a 
            href="/test-connection"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Análisis de Conexión
          </a>
        </div>

      </div>
    </div>
  );
}
