// Test específico del supabaseServerUtils
export const runtime = 'edge';

import { supabaseServerUtils } from '@/lib/supabaseUtils';

export default async function TestServerUtils() {
  let testResults = {
    import: false,
    execution: false,
    data: null,
    error: null,
    logs: []
  };

  // Test 1: Verificar que la importación funciona
  try {
    testResults.import = !!supabaseServerUtils;
    testResults.logs.push('✅ Import de supabaseServerUtils exitoso');
  } catch (importError: any) {
    testResults.logs.push(`❌ Error en import: ${importError.message}`);
  }

  // Test 2: Intentar ejecutar getProducts
  if (testResults.import) {
    try {
      testResults.logs.push('🔄 Intentando ejecutar supabaseServerUtils.getProducts()...');
      
      const products = await supabaseServerUtils.getProducts({ limit: 1 });
      
      testResults.execution = true;
      testResults.data = products;
      testResults.logs.push(`✅ Ejecución exitosa: ${products.length} productos obtenidos`);
      
      if (products.length > 0) {
        testResults.logs.push(`🎯 Primer producto: ${products[0].name}`);
      }
      
    } catch (execError: any) {
      testResults.error = execError.message;
      testResults.logs.push(`❌ Error en ejecución: ${execError.message}`);
      
      // Log del stack trace para más detalles
      if (execError.stack) {
        testResults.logs.push(`📋 Stack trace: ${execError.stack.substring(0, 500)}...`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Test de supabaseServerUtils</h1>
        
        {/* Resumen */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📊 Resultados</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={testResults.import ? "text-green-600" : "text-red-600"}>
                {testResults.import ? "✅" : "❌"}
              </span>
              <span>Import de supabaseServerUtils</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={testResults.execution ? "text-green-600" : "text-red-600"}>
                {testResults.execution ? "✅" : "❌"}
              </span>
              <span>Ejecución de getProducts()</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={testResults.data && testResults.data.length > 0 ? "text-green-600" : "text-red-600"}>
                {testResults.data && testResults.data.length > 0 ? "✅" : "❌"}
              </span>
              <span>Datos obtenidos de Supabase</span>
            </div>
          </div>
        </div>

        {/* Error details */}
        {testResults.error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-900 mb-4">❌ Error Detectado</h2>
            <p className="text-red-700 text-sm font-mono bg-white p-3 rounded">
              {testResults.error}
            </p>
          </div>
        )}

        {/* Datos obtenidos */}
        {testResults.data && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold text-green-900 mb-4">✅ Datos Obtenidos</h2>
            {Array.isArray(testResults.data) && testResults.data.length > 0 && (
              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold mb-2">🎯 Tu Producto:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Nombre:</strong> {testResults.data[0].name}</p>
                  <p><strong>ID:</strong> {testResults.data[0].id}</p>
                  <p><strong>Slug:</strong> {testResults.data[0].slug}</p>
                  <p><strong>Precio:</strong> ${testResults.data[0].price}</p>
                  <p><strong>Imagen:</strong> {testResults.data[0].images ? 'Configurada' : 'No configurada'}</p>
                  <p><strong>Destacado:</strong> {testResults.data[0].featured ? 'Sí' : 'No'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logs */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📝 Logs de Ejecución</h2>
          <div className="space-y-1 text-sm font-mono bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            {testResults.logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">{log}</div>
            ))}
          </div>
        </div>

        {/* Raw data para debugging */}
        <details className="mb-8 p-6 bg-white rounded-lg shadow">
          <summary className="text-xl font-semibold cursor-pointer">🔍 Datos Raw</summary>
          <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </details>

        {/* Navegación */}
        <div className="text-center space-x-4">
          <a 
            href="/test-connection"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Test de Conexión
          </a>
          
          <a 
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
