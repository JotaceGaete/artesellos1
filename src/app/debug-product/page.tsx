export const runtime = 'edge';

import { supabaseServerUtils } from '@/lib/supabaseUtils';
import Link from 'next/link';

export default async function DebugProduct() {
  let productData = null;
  let error = null;

  try {
    const products = await supabaseServerUtils.getProducts({ limit: 1 });
    productData = products[0];
  } catch (err) {
    error = String(err);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Producto Supabase</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
          <h2 className="font-semibold text-red-900">Error:</h2>
          <pre className="text-sm text-red-700 mt-2">{error}</pre>
        </div>
      )}

      {productData && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-semibold text-green-900 mb-2">✅ Producto Encontrado</h2>
            <p><strong>Nombre:</strong> {productData.name}</p>
            <p><strong>ID:</strong> {productData.id}</p>
            <p><strong>Slug:</strong> {productData.slug}</p>
            <p><strong>Precio:</strong> {productData.price}</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-semibold text-blue-900 mb-2">🖼️ Estructura de Imágenes</h2>
            <p><strong>Tipo:</strong> {typeof productData.images}</p>
            <p><strong>Es Array:</strong> {Array.isArray(productData.images) ? 'Sí' : 'No'}</p>
            <pre className="text-sm bg-white p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(productData.images, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded">
            <h2 className="font-semibold text-purple-900 mb-2">📋 Estructura Completa</h2>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(productData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link 
          href="/" 
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          ← Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
