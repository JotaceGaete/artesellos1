'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseUtils } from '@/lib/supabase';
import { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderConfirmationPageProps {
  params: {
    id: string;
  };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await supabaseUtils.getOrderById(params.id);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('Pedido no encontrado');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error al cargar la información del pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error al cargar el pedido
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {error || 'No se pudo encontrar la información del pedido.'}
          </p>
          <Link
            href="/"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header de confirmación */}
      <div className="text-center mb-12">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Gracias por tu compra, {order.customer_name}
        </p>
        <p className="text-lg text-gray-600">
          Tu pedido ha sido recibido y está siendo procesado.
        </p>
      </div>

      {/* Información del pedido */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Pedido #{order.id}
              </h2>
              <p className="text-sm text-gray-600">
                Realizado el {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Confirmado
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información del cliente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Cliente
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nombre:</span> {order.customer_name}</p>
                <p><span className="font-medium">Email:</span> {order.customer_email}</p>
                <p><span className="font-medium">Teléfono:</span> {order.customer_phone}</p>
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dirección de Envío
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{(order.shipping_address as any)?.address_1}</p>
                {(order.shipping_address as any)?.address_2 && (
                  <p>{(order.shipping_address as any).address_2}</p>
                )}
                <p>
                  {(order.shipping_address as any)?.city}, {(order.shipping_address as any)?.state}
                </p>
                <p>{(order.shipping_address as any)?.country}</p>
                {(order.shipping_address as any)?.postcode && (
                  <p>Código Postal: {(order.shipping_address as any).postcode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 px-6 py-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen del Pedido
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order.subtotal || order.total * 0.81)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span className="text-gray-900">{formatCurrency(order.shipping_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (19%)</span>
              <span className="text-gray-900">{formatCurrency(order.tax_amount || order.total * 0.19)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="bg-blue-50 rounded-lg p-8 border border-blue-200 mb-8">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          ¿Qué sucede ahora?
        </h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-blue-900">Confirmación por email</h4>
              <p className="text-blue-700 text-sm">
                Recibirás un email de confirmación con todos los detalles de tu pedido.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-blue-900">Procesamiento del pedido</h4>
              <p className="text-blue-700 text-sm">
                Nuestro equipo comenzará a preparar tu pedido personalizado.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-blue-900">Envío y entrega</h4>
              <p className="text-blue-700 text-sm">
                Te enviaremos actualizaciones sobre el envío y entrega de tu pedido.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-600 mb-6">
            Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/seguimiento"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Rastrear Pedido
            </Link>
            <Link
              href="/contacto"
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </div>

      {/* Acciones adicionales */}
      <div className="text-center mt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/productos"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Continuar comprando →
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Volver al inicio →
          </Link>
        </div>
      </div>
    </div>
  );
}
