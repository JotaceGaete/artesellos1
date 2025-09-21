import { supabaseServerUtils } from '@/lib/supabaseUtils';

export default async function WorkingDemo() {
  let products = [];
  let message = '';

  try {
    const supabaseProducts = await supabaseServerUtils.getProducts();
    
    // Convertir productos de forma segura sin el adaptador problemático
    products = supabaseProducts.map((p, index) => ({
      id: index + 1,
      name: p.name,
      price: `$${Math.round(p.price).toLocaleString('es-CL')}`,
      slug: p.slug,
      description: p.description || 'Sin descripción',
      featured: p.featured || false,
      // Manejar imágenes de forma simple
      imageUrl: Array.isArray(p.images) && p.images.length > 0 
        ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.src || '/placeholder.jpg')
        : '/placeholder.jpg'
    }));
    
    message = `✅ Se encontraron ${products.length} productos en Supabase`;
  } catch (error) {
    message = `❌ Error: ${error}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🎯 Artesellos - Productos Reales de Supabase
          </h1>
          <p className="text-gray-600 mt-1">{message}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagen con manejo seguro */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.imageUrl && product.imageUrl !== '/placeholder.jpg' ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="text-gray-500 text-center p-4" style={{display: product.imageUrl && product.imageUrl !== '/placeholder.jpg' ? 'none' : 'flex'}}>
                    <div>
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm">Imagen no disponible</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {product.description.substring(0, 100)}...
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      {product.price}
                    </span>
                    
                    {product.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        ⭐ Destacado
                      </span>
                    )}
                  </div>
                  
                  <button className="w-full mt-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Ver Más
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No hay productos disponibles
            </h2>
            <p className="text-gray-600">
              Agrega productos en tu panel de Supabase para verlos aquí.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 mb-2">
            🚀 <strong>¡Supabase está funcionando perfectamente!</strong>
          </p>
          <p className="text-sm text-gray-500">
            Esta página muestra los productos reales de tu base de datos Supabase.
          </p>
          <div className="mt-4 space-x-4">
            <a href="/" className="text-indigo-600 hover:text-indigo-800">← Volver al Inicio</a>
            <a href="/debug-product" className="text-purple-600 hover:text-purple-800">Ver Debug</a>
            <a href="/supabase-demo" className="text-green-600 hover:text-green-800">Ver Demo Técnica</a>
          </div>
        </div>
      </div>
    </div>
  );
}
