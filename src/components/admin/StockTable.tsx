'use client';

import { useEffect, useState, useCallback } from 'react';

interface StockItem {
  id?: string;
  marca: string;
  modelo: string;
  color: string;
  stock: number;
  precio?: number;
  medidas?: string;
  imagen_url?: string;
  descripcion?: string;
  categoria?: string;
}

interface StockTableProps {
  // Filtros opcionales para mostrar solo stock de un producto específico
  filterByMarca?: string;
  filterByModelo?: string;
}

export default function StockTable({ filterByMarca, filterByModelo }: StockTableProps = {}) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construir URL con filtros si existen
      const params = new URLSearchParams();
      if (filterByMarca) params.append('marca', filterByMarca);
      if (filterByModelo) params.append('modelo', filterByModelo);
      
      const url = `/api/admin/stock${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || 'Error cargando stock');
      }
      
      setItems(data.items || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterByMarca, filterByModelo]);

  // Cargar datos al montar o cuando cambien los filtros
  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      stock: Math.max(0, newQuantity), // No permitir valores negativos
    };
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Error guardando stock');
      }

      setSuccess('Stock actualizado correctamente');
      setItems(data.items || items);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón guardar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Stock</h2>
          <p className="text-sm text-gray-600 mt-1">
            Edita las cantidades y guarda los cambios
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">✅ {success}</p>
        </div>
      )}

      {/* Tabla de stock */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medidas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={`${item.marca}-${item.modelo}-${item.color}-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.marca}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.modelo}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.color}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.medidas || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.precio ? `$${item.precio.toLocaleString('es-CL')}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm">
                  {item.stock > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      En stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Sin stock
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay registros de stock
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      {items.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total de productos:</span>
              <span className="ml-2 font-semibold text-gray-900">{items.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total en stock:</span>
              <span className="ml-2 font-semibold text-green-600">
                {items.reduce((sum, item) => sum + (item.stock || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Sin stock:</span>
              <span className="ml-2 font-semibold text-red-600">
                {items.filter(item => (item.stock || 0) === 0).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

