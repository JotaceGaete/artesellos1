'use client';

import { useMemo, useState, useEffect } from 'react';
import { formatPrice } from '@/lib/pricingUtils';

interface ShippingEstimatorProps {
  unitPrice: number; // precio unitario final (incluye recargos como tinta)
  onShippingCalculated?: (shipping: number) => void; // callback para notificar el costo de envío
}

// Tarifas de envío fijas
const DEFAULT_TARIFF = 5000; // Tarifa por defecto para pedidos hasta $15.000
const FREE_THRESHOLD = 50000; // Envío gratis desde $50.000
const REDUCED_RATE_THRESHOLD = 15000; // Tarifa reducida desde $15.000
const REDUCED_RATE = 3500; // Costo de envío para pedidos > $15.000

export default function ShippingEstimator({ unitPrice, onShippingCalculated }: ShippingEstimatorProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const shipping = useMemo(() => {
    // Envío gratis desde $50.000
    if (subtotal >= FREE_THRESHOLD) return 0;
    
    // Tarifa reducida de $3.500 para pedidos superiores a $15.000
    if (subtotal > REDUCED_RATE_THRESHOLD) return REDUCED_RATE;
    
    // Para pedidos de $15.000 o menos, usar tarifa por defecto
    return DEFAULT_TARIFF;
  }, [subtotal]);

  const total = subtotal + shipping;

  // Notificar al componente padre cuando cambie el costo de envío
  useEffect(() => {
    if (onShippingCalculated) {
      onShippingCalculated(shipping);
    }
  }, [shipping, onShippingCalculated]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">🚚 Envío</h3>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          📦 <strong>Tarifas de envío:</strong><br/>
          • Pedidos hasta $15.000: {formatPrice(DEFAULT_TARIFF)}<br/>
          • <strong>Pedidos sobre $15.000: Solo {formatPrice(REDUCED_RATE)}</strong><br/>
          • Pedidos sobre $50.000: <strong>¡Envío GRATIS!</strong>
        </p>
      </div>

      {/* Cantidad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          💡 Envío {formatPrice(REDUCED_RATE)} para compras sobre {formatPrice(REDUCED_RATE_THRESHOLD)} • Envío gratis desde {formatPrice(FREE_THRESHOLD)}
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Precio unitario:</span>
            <span>{formatPrice(unitPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal ({quantity}):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío:</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="border-t pt-1 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
