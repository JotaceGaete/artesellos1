// Test directo de conexión Supabase SIN dependencias
export default async function TestConnection() {
  let connectionResult = {
    envVars: false,
    fetchAttempt: false,
    data: null as any,
    error: null as string | null,
    details: {} as Record<string, any>
  };

  // 1. Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  connectionResult.envVars = !!(supabaseUrl && supabaseKey);
  connectionResult.details.supabaseUrl = supabaseUrl || 'MISSING';
  connectionResult.details.supabaseKeyLength = supabaseKey?.length || 0;

  // 2. Test de fetch directo
  if (connectionResult.envVars) {
    try {
      console.log('🔗 Intentando fetch directo a Supabase...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      connectionResult.details.responseStatus = response.status;
      connectionResult.details.responseHeaders = Object.fromEntries(response.headers.entries());

      if (response.ok) {
        const data = await response.json();
        connectionResult.fetchAttempt = true;
        connectionResult.data = data;
        console.log('✅ Fetch exitoso, datos:', data);
      } else {
        const errorText = await response.text();
        connectionResult.error = `HTTP ${response.status}: ${errorText}`;
        console.error('❌ Error en response:', connectionResult.error);
      }
    } catch (fetchError: any) {
      connectionResult.error = `Fetch failed: ${fetchError.message}`;
      console.error('❌ Error en fetch:', fetchError);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Análisis Profundo de Conexión Supabase</h1>
        
        {/* Status general */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📊 Resumen del Estado</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={connectionResult.envVars ? "text-green-600" : "text-red-600"}>
                {connectionResult.envVars ? "✅" : "❌"}
              </span>
              <span>Variables de entorno configuradas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={connectionResult.fetchAttempt ? "text-green-600" : "text-red-600"}>
                {connectionResult.fetchAttempt ? "✅" : "❌"}
              </span>
              <span>Conexión a Supabase exitosa</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={connectionResult.data ? "text-green-600" : "text-red-600"}>
                {connectionResult.data ? "✅" : "❌"}
              </span>
              <span>Datos obtenidos</span>
            </div>
          </div>
        </div>

        {/* Variables de entorno */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🔑 Variables de Entorno</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono break-all">
                {connectionResult.details.supabaseUrl}
              </div>
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
                {connectionResult.details.supabaseKeyLength > 0 
                  ? `Configurada (${connectionResult.details.supabaseKeyLength} caracteres)` 
                  : 'NO CONFIGURADA'}
              </div>
            </div>
          </div>
        </div>

        {/* Resultado del fetch */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🌐 Resultado de la Conexión</h2>
          
          {connectionResult.error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
              <p className="text-red-700 text-sm">{connectionResult.error}</p>
            </div>
          ) : null}

          {connectionResult.details.responseStatus && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">HTTP Response</h3>
              <p className="text-sm">
                <strong>Status:</strong> {connectionResult.details.responseStatus}
              </p>
            </div>
          )}

          {connectionResult.data && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Datos Obtenidos</h3>
              <p className="text-sm text-green-700 mb-2">
                {Array.isArray(connectionResult.data) 
                  ? `${connectionResult.data.length} productos encontrados` 
                  : 'Datos recibidos'}
              </p>
              
              {Array.isArray(connectionResult.data) && connectionResult.data.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">🎯 Tu Producto:</h4>
                  <div className="bg-white p-3 rounded border text-sm">
                    <p><strong>Nombre:</strong> {connectionResult.data[0].name}</p>
                    <p><strong>Precio:</strong> ${connectionResult.data[0].price}</p>
                    <p><strong>Slug:</strong> {connectionResult.data[0].slug}</p>
                    <p><strong>Imagen:</strong> {connectionResult.data[0].images ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Raw data para debug */}
        <details className="mb-8 p-6 bg-white rounded-lg shadow">
          <summary className="text-xl font-semibold cursor-pointer">🔍 Datos Raw (Debug)</summary>
          <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(connectionResult, null, 2)}
          </pre>
        </details>

        {/* Navegación */}
        <div className="text-center space-x-4">
          <a 
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Inicio
          </a>
          
          {connectionResult.data && (
            <a 
              href="/supabase-demo"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver Demo Completo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
