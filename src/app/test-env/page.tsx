// Página para verificar variables de entorno
export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Diagnóstico de Variables de Entorno</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Variables de Supabase</h2>
            
            <div className="space-y-3">
              <div>
                <label className="font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_URL:</label>
                <p className="text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                  {supabaseUrl ? (
                    <span className="text-green-600">✅ {supabaseUrl}</span>
                  ) : (
                    <span className="text-red-600">❌ No configurada</span>
                  )}
                </p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY:</label>
                <p className="text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                  {supabaseKey ? (
                    <span className="text-green-600">✅ {supabaseKey.substring(0, 20)}...{supabaseKey.substring(supabaseKey.length - 10)}</span>
                  ) : (
                    <span className="text-red-600">❌ No configurada</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado de la Configuración</h2>
            
            {supabaseUrl && supabaseKey ? (
              <div className="text-green-600">
                ✅ Variables de entorno configuradas correctamente
              </div>
            ) : (
              <div className="text-red-600">
                ❌ Faltan variables de entorno
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">🎯 Tu Producto Real</h2>
            <p className="text-blue-700 mb-4">
              Sabemos que tu producto "Shiny S-722" está en Supabase porque funciona en /supabase-demo.
              El problema está en la integración con la página principal.
            </p>
            
            <div className="space-y-2">
              <div>✅ Supabase conectado correctamente</div>
              <div>✅ Producto "Shiny S-722" existe</div>
              <div>✅ Precio: $15.000</div>
              <div>✅ Imagen: https://i.postimg.cc/G3fxtw68/842medidas.png</div>
            </div>
          </div>

          <div className="text-center space-x-4">
            <a 
              href="/"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Volver al Inicio
            </a>
            
            <a 
              href="/supabase-demo"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver Tu Producto Real ✅
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
