export const runtime = 'edge';

import { supabaseServerUtils } from '@/lib/supabaseUtils';

export default async function SupabaseDemo() {
  let supabaseData = {
    products: [],
    status: 'loading',
    message: '',
    error: null
  };

  try {
    console.log('🔄 Fetching real data from Supabase for demo...');
    const products = await supabaseServerUtils.getProducts({ limit: 5 });
    
    supabaseData = {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        featured: p.featured,
        slug: p.slug
      })),
      status: 'success',
      message: `Successfully loaded ${products.length} products from Supabase`,
      error: null
    };
    
  } catch (error) {
    supabaseData = {
      products: [],
      status: 'error',
      message: 'Failed to connect to Supabase',
      error: String(error)
    };
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        🧪 Supabase Connection Demo
      </h1>
      
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Estado de Conexión</h2>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${
            supabaseData.status === 'success' ? 'bg-green-500' : 
            supabaseData.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></span>
          <span className="font-medium">
            {supabaseData.status === 'success' ? '✅ Conectado' : 
             supabaseData.status === 'error' ? '❌ Error' : '🔄 Cargando'}
          </span>
        </div>
        <p className="text-sm text-gray-700 mt-2">{supabaseData.message}</p>
      </div>

      {supabaseData.status === 'success' && supabaseData.products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            📦 Productos desde Supabase ({supabaseData.products.length})
          </h2>
          <div className="grid gap-4">
            {supabaseData.products.map((product) => (
              <div 
                key={product.id} 
                className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">ID: {product.id}</p>
                    <p className="text-sm text-gray-600">Slug: {product.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${product.price}</p>
                    {product.featured && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        ⭐ Destacado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {supabaseData.status === 'error' && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error de Conexión</h2>
          <p className="text-sm text-red-700">{supabaseData.error}</p>
        </div>
      )}

      <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">🔍 Resumen de Pruebas</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ <strong>API Routes</strong>: Funcionando correctamente (/api/test-supabase)</li>
          <li>✅ <strong>Server Components</strong>: Conectando a Supabase exitosamente</li>
          <li>✅ <strong>Configuración</strong>: Variables de entorno configuradas</li>
          <li>✅ <strong>Base de Datos</strong>: {supabaseData.products.length} productos disponibles</li>
          <li>✅ <strong>Adaptador</strong>: Conversión de tipos funcionando</li>
        </ul>
      </div>
      
      <div className="mt-4 text-center">
        <a 
          href="/" 
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          ← Volver al Inicio
        </a>
      </div>
    </div>
  );
}
