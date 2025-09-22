'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { supabaseUtils } from '@/lib/supabase';

interface CheckoutFormData {
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  billing_address: {
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: 'transfer' | 'card' | 'paypal';
  order_notes?: string;
  same_address: boolean;
}

const checkoutSteps = [
  { id: 'cart', name: 'Carrito', completed: true },
  { id: 'shipping', name: 'Envío', completed: false },
  { id: 'payment', name: 'Pago', completed: false },
  { id: 'review', name: 'Revisar', completed: false },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();
  const [currentStep, setCurrentStep] = useState('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    customer: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
    shipping_address: {
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Chile',
    },
    billing_address: {
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Chile',
    },
    payment_method: 'transfer',
    order_notes: '',
    same_address: true,
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !orderPlaced) {
      router.push('/productos');
    }
  }, [cart.items.length, router, orderPlaced]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('customer.')) {
      const field = name.replace('customer.', '');
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [field]: value,
        },
      }));
    } else if (name.startsWith('shipping_address.')) {
      const field = name.replace('shipping_address.', '');
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [field]: value,
        },
      }));
    } else if (name.startsWith('billing_address.')) {
      const field = name.replace('billing_address.', '');
      setFormData(prev => ({
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [field]: value,
        },
      }));
    } else if (type === 'checkbox') {
      if (name === 'same_address') {
        setFormData(prev => ({
          ...prev,
          same_address: checked,
          billing_address: checked ? prev.shipping_address : prev.billing_address,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Copy shipping address to billing when same_address is checked
  useEffect(() => {
    if (formData.same_address) {
      setFormData(prev => ({
        ...prev,
        billing_address: prev.shipping_address,
      }));
    }
  }, [formData.shipping_address, formData.same_address]);

  const calculateShipping = () => {
    // Lógica simple de cálculo de envío
    const subtotal = cart.total;
    if (subtotal > 50000) return 0; // Envío gratis sobre $50.000
    return 5000; // $5.000 de envío
  };

  const calculateTax = () => {
    return Math.round(cart.total * 0.19); // 19% IVA
  };

  const calculateTotal = () => {
    return cart.total + calculateShipping() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderData = {
        customer_email: formData.customer.email,
        customer_name: `${formData.customer.first_name} ${formData.customer.last_name}`,
        customer_phone: formData.customer.phone,
        status: 'pending',
        total: calculateTotal(),
        subtotal: cart.total,
        tax_amount: calculateTax(),
        shipping_amount: calculateShipping(),
        discount_amount: 0,
        currency: 'CLP',
        payment_method: formData.payment_method,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address,
        order_notes: formData.order_notes,
      };

      // Intento via API interna (evita depender del cliente de Supabase y RLS)
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) })
      const data = await res.json()
      if (!res.ok || !data?.order?.id) throw new Error(data?.message || 'No se pudo crear el pedido')

      // Aquí iría la lógica para crear los order_items
      // Por ahora, solo limpiamos el carrito y mostramos éxito
      clearCart();
      setOrderPlaced(true);

      // Redirect to order confirmation
      setTimeout(() => {
        router.push(`/pedido-confirmado/${data.order.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const payWithMercadoPago = async () => {
    setIsProcessing(true)
    try {
      // 1) Crear la orden primero para obtener el ID
      const orderData = {
        customer_email: formData.customer.email,
        customer_name: `${formData.customer.first_name} ${formData.customer.last_name}`,
        customer_phone: formData.customer.phone,
        status: 'pending',
        total: calculateTotal(),
        subtotal: cart.total,
        tax_amount: calculateTax(),
        shipping_amount: calculateShipping(),
        discount_amount: 0,
        currency: 'CLP',
        payment_method: 'card',
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address,
        order_notes: formData.order_notes,
      }

      const orderRes = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) })
      const orderJson = await orderRes.json()
      if (!orderRes.ok || !orderJson?.order?.id) throw new Error(orderJson?.message || 'No se pudo crear la orden')
      const orderId = String(orderJson.order.id)

      // 2) Preparar items y payer para la preferencia
      const items = cart.items.map((it) => ({
        title: it.product.name,
        quantity: it.quantity,
        unit_price: Math.round(parseFloat(it.product.price)),
        currency_id: 'CLP',
      }))
      const payer = { name: `${formData.customer.first_name} ${formData.customer.last_name}`.trim(), email: formData.customer.email }
      const returnUrl = typeof window !== 'undefined' ? window.location.origin + '/pago-exitoso' : ''

      // 3) Llamar a la nueva API que crea el link con external_reference
      const prefRes = await fetch('/api/create-payment-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, items, payer, returnUrl }) })
      const prefData = await prefRes.json()
      if (!prefRes.ok) throw new Error(prefData?.message || 'Error creando link de pago')

      // 4) Redirigir al link de pago de Mercado Pago
      window.location.href = prefData.init_point
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'No se pudo iniciar el pago';
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Pedido realizado exitosamente!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Gracias por tu compra. Te enviaremos un correo de confirmación con los detalles de tu pedido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Continuar Comprando
            </Link>
            <Link
              href="/"
              className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Agrega algunos productos antes de proceder al checkout.
          </p>
          <Link
            href="/productos"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con pasos */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Checkout
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {checkoutSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.completed || step.id === currentStep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step.completed || step.id === currentStep ? 'text-indigo-600' : 'text-gray-600'
              }`}>
                {step.name}
              </span>
              {index < checkoutSteps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  step.completed ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Información del cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Información Personal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer.first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="customer.first_name"
                  name="customer.first_name"
                  required
                  value={formData.customer.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="customer.last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="customer.last_name"
                  name="customer.last_name"
                  required
                  value={formData.customer.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="customer.email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="customer.email"
                  name="customer.email"
                  required
                  value={formData.customer.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="customer.phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="customer.phone"
                  name="customer.phone"
                  required
                  value={formData.customer.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Dirección de Envío
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="shipping_address.address_1" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="shipping_address.address_1"
                  name="shipping_address.address_1"
                  required
                  value={formData.shipping_address.address_1}
                  onChange={handleInputChange}
                  placeholder="Calle, número, departamento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="shipping_address.address_2" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección adicional
                </label>
                <input
                  type="text"
                  id="shipping_address.address_2"
                  name="shipping_address.address_2"
                  value={formData.shipping_address.address_2}
                  onChange={handleInputChange}
                  placeholder="Referencias adicionales"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="shipping_address.city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="shipping_address.city"
                    name="shipping_address.city"
                    required
                    value={formData.shipping_address.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="shipping_address.state" className="block text-sm font-medium text-gray-700 mb-1">
                    Región *
                  </label>
                  <input
                    type="text"
                    id="shipping_address.state"
                    name="shipping_address.state"
                    required
                    value={formData.shipping_address.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="shipping_address.postcode" className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    id="shipping_address.postcode"
                    name="shipping_address.postcode"
                    value={formData.shipping_address.postcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="shipping_address.country" className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    id="shipping_address.country"
                    name="shipping_address.country"
                    value={formData.shipping_address.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de facturación */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="same_address"
                name="same_address"
                checked={formData.same_address}
                onChange={handleInputChange}
                className="mr-3"
              />
              <label htmlFor="same_address" className="text-sm font-medium text-gray-700">
                La dirección de facturación es la misma que la de envío
              </label>
            </div>

            {!formData.same_address && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Dirección de Facturación
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="billing_address.address_1" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      id="billing_address.address_1"
                      name="billing_address.address_1"
                      required
                      value={formData.billing_address.address_1}
                      onChange={handleInputChange}
                      placeholder="Calle, número, departamento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="billing_address.address_2" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección adicional
                    </label>
                    <input
                      type="text"
                      id="billing_address.address_2"
                      name="billing_address.address_2"
                      value={formData.billing_address.address_2}
                      onChange={handleInputChange}
                      placeholder="Referencias adicionales"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="billing_address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        id="billing_address.city"
                        name="billing_address.city"
                        required
                        value={formData.billing_address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="billing_address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        Región *
                      </label>
                      <input
                        type="text"
                        id="billing_address.state"
                        name="billing_address.state"
                        required
                        value={formData.billing_address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="billing_address.postcode" className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        id="billing_address.postcode"
                        name="billing_address.postcode"
                        value={formData.billing_address.postcode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="billing_address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        id="billing_address.country"
                        name="billing_address.country"
                        value={formData.billing_address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Método de pago */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Método de Pago
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="transfer"
                  name="payment_method"
                  value="transfer"
                  checked={formData.payment_method === 'transfer'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <label htmlFor="transfer" className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">Transferencia Bancaria</span>
                      <p className="text-sm text-gray-600">Pago seguro por transferencia</p>
                    </div>
                    <span className="text-sm text-green-600">Recomendado</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="card"
                  name="payment_method"
                  value="card"
                  checked={formData.payment_method === 'card'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <label htmlFor="card" className="flex-1">
                  <div>
                    <span className="font-medium text-gray-900">Tarjeta de Crédito/Débito</span>
                    <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="paypal"
                  name="payment_method"
                  value="paypal"
                  checked={formData.payment_method === 'paypal'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <label htmlFor="paypal" className="flex-1">
                  <div>
                    <span className="font-medium text-gray-900">PayPal</span>
                    <p className="text-sm text-gray-600">Pago seguro con PayPal</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Notas del pedido */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notas del Pedido (Opcional)
            </h2>
            <textarea
              id="order_notes"
              name="order_notes"
              rows={4}
              value={formData.order_notes}
              onChange={handleInputChange}
              placeholder="Instrucciones especiales para el envío, mensajes personalizados, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
              Resumen del Pedido
              </h2>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:underline"
              >
                Vaciar carrito
              </button>
            </div>

            {/* Items del carrito */}
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.product.images[0]?.src || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="text-xs text-gray-600">Cant.</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id as number, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1 border rounded"
                      />
                      <button
                        onClick={() => removeFromCart(item.product.id as number)}
                        className="ml-2 text-xs text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(parseFloat(item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cálculos */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="text-gray-900">
                  {calculateShipping() === 0 ? 'Gratis' : formatCurrency(calculateShipping())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (19%)</span>
                <span className="text-gray-900">{formatCurrency(calculateTax())}</span>
              </div>
              {cart.total < 50000 && (
                <div className="text-xs text-gray-500 mt-2">
                  Agrega {formatCurrency(50000 - cart.total)} más para envío gratis
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Botones de compra */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : `Realizar Pedido - ${formatCurrency(calculateTotal())}`}
            </button>

            {/* Botón de pago con Mercado Pago */}
            <button
              onClick={payWithMercadoPago}
              disabled={isProcessing}
              className="w-full mt-3 border border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isProcessing ? 'Procesando…' : 'Pagar con Mercado Pago'}
            </button>

            {/* Información adicional */}
            <div className="mt-6 text-xs text-gray-500 space-y-2">
              <p>
                Al realizar el pedido, aceptas nuestros{' '}
                <Link href="/terminos" className="text-indigo-600 hover:underline">
                  términos y condiciones
                </Link>
              </p>
              <p>
                Recibirás un correo de confirmación con los detalles de tu pedido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
