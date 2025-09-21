'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseUtils } from '@/lib/supabase';

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const statusLabels = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const statusSteps = [
  { key: 'pending', label: 'Pedido Recibido', description: 'Tu pedido ha sido confirmado' },
  { key: 'processing', label: 'En Producción', description: 'Estamos preparando tus timbres' },
  { key: 'shipped', label: 'Enviado', description: 'Tu pedido está en camino' },
  { key: 'delivered', label: 'Entregado', description: '¡Pedido completado!' },
];

export default function SeguimientoPage() {
  const [searchType, setSearchType] = useState<'email' | 'order_id'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSearched(true);

    try {
      let foundOrders: Order[] = [];

      if (searchType === 'email') {
        const result = await supabaseUtils.getOrdersByEmail(searchValue);
        foundOrders = result || [];
      } else {
        // Buscar por ID de orden
        const order = await supabaseUtils.getOrderById(searchValue);
        if (order) {
          foundOrders = [order];
        }
      }

      setOrders(foundOrders);

      if (foundOrders.length === 0) {
        setError('No se encontraron pedidos con esa información.');
      }
    } catch (err) {
      console.error('Error searching orders:', err);
      setError('Error al buscar pedidos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Seguimiento de Pedidos
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ingresa tu correo electrónico o número de pedido para ver el estado de tu compra.
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Buscar por:
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="email"
                  checked={searchType === 'email'}
                  onChange={(e) => setSearchType(e.target.value as 'email')}
                  className="mr-2"
                />
                <span className="text-sm">Correo electrónico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="order_id"
                  checked={searchType === 'order_id'}
                  onChange={(e) => setSearchType(e.target.value as 'order_id')}
                  className="mr-2"
                />
                <span className="text-sm">Número de pedido</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'email'
                    ? 'ejemplo@correo.com'
                    : 'ART-00123'
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Resultados */}
      {searched && (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
              {error}
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Pedidos encontrados ({orders.length})
              </h2>

              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Header del pedido */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Realizado el {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusLabels[order.status].color}`}>
                          {statusLabels[order.status].label}
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado del pedido */}
                  <div className="px-6 py-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Estado del Pedido
                    </h4>
                    <div className="space-y-4">
                      {statusSteps.map((step, index) => {
                        const currentStepIndex = getCurrentStepIndex(order.status);
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                          <div key={step.key} className="flex items-start">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isCurrent
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                }`}
                              >
                                {isCompleted ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <h5 className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                                {step.label}
                              </h5>
                              <p className={`text-sm ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                                {step.description}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  Actualizado: {formatDate(order.updated_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Información de envío */}
                  {order.tracking_number && (
                    <div className="px-6 py-4 bg-blue-50 border-t">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">
                        Información de Envío
                      </h4>
                      <p className="text-blue-800">
                        <strong>Número de seguimiento:</strong> {order.tracking_number}
                      </p>
                      <p className="text-blue-800 text-sm mt-1">
                        Puedes rastrear tu pedido en el sitio web del courier correspondiente.
                      </p>
                    </div>
                  )}

                  {/* Items del pedido */}
                  <div className="px-6 py-4 border-t">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Productos
                    </h4>
                    <div className="space-y-3">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Cliente:</strong> {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {order.customer_email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          ¿Necesitas ayuda?
                        </p>
                        <Link
                          href="/contacto"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Contactar soporte →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Información adicional */}
      {!searched && (
        <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            ¿No encuentras tu pedido?
          </h3>
          <ul className="text-blue-800 space-y-2 mb-6">
            <li>• Verifica que el correo electrónico sea correcto</li>
            <li>• Si realizaste el pedido recientemente, puede tomar unos minutos en aparecer</li>
            <li>• Los pedidos aparecen con el formato ART-XXXXX</li>
            <li>• Si tienes problemas, contacta nuestro soporte</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contacto"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Contactar Soporte
            </Link>
            <Link
              href="/productos"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              Ver Productos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
