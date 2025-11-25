'use client';

import { useMemo, useState, useEffect } from 'react';
import { formatPrice } from '@/lib/pricingUtils';

interface ShippingEstimatorProps {
  unitPrice: number; // precio unitario final (incluye recargos como tinta)
  onShippingCalculated?: (shipping: number) => void; // callback para notificar el costo de envío
}

// Tarifas de envío
const DEFAULT_TARIFF = 5000;
const FREE_THRESHOLD = 50000; // Envío gratis desde $50.000
const REDUCED_RATE_THRESHOLD = 15000; // Tarifa reducida desde $15.000
const REDUCED_RATE = 3500; // Costo de envío para pedidos > $15.000

const TARIFAS_POR_COMUNA: Record<string, number> = {
  Rancagua: 6000,
  Santiago: 5000,
  Valparaíso: 6000,
  Concepción: 7000,
};

const SUGERENCIAS_COMUNAS = [
  'Santiago',
  'Rancagua',
  'Valparaíso',
  'Viña del Mar',
  'Concepción',
  'Temuco',
  'Puerto Montt',
  'Antofagasta',
  'La Serena',
  'Talca',
];

type CarrierKey = 'starken' | 'chilexpress' | 'bluexpress' | 'correos';

const CARRIERS: Record<CarrierKey, { name: string; price: number; icon: string }> = {
  starken: {
    name: 'Starken',
    price: 5000,
    icon: 'https://media.artesellos.cl/starken.jfif',
  },
  chilexpress: {
    name: 'Chilexpress',
    price: 6000,
    icon: 'https://media.artesellos.cl/chilexpress.png',
  },
  bluexpress: {
    name: 'Bluexpress',
    price: 6000,
    icon: 'https://media.artesellos.cl/bluexpress.jfif',
  },
  correos: {
    name: 'Correos de Chile',
    price: 6000,
    icon: 'https://media.artesellos.cl/correos.png',
  },
};

export default function ShippingEstimator({ unitPrice, onShippingCalculated }: ShippingEstimatorProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [comuna, setComuna] = useState<string>('');
  const [carrier, setCarrier] = useState<CarrierKey>('starken');

  const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const shipping = useMemo(() => {
    // Envío gratis desde $50.000
    if (subtotal >= FREE_THRESHOLD) return 0;
    
    // Tarifa reducida de $3.500 para pedidos superiores a $15.000
    if (subtotal > REDUCED_RATE_THRESHOLD) return REDUCED_RATE;
    
    // Para pedidos de $15.000 o menos, usar tarifa normal
    // Si hay tarifa especial por comuna, úsala; si no, usar la del transportista elegido
    const key = (comuna || '').trim();
    if (key) {
      const found = Object.keys(TARIFAS_POR_COMUNA).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      );
      if (found) return TARIFAS_POR_COMUNA[found];
    }
    return CARRIERS[carrier].price ?? DEFAULT_TARIFF;
  }, [carrier, comuna, subtotal]);

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
          • Pedidos hasta $15.000: Costo según transportista<br/>
          • <strong>Pedidos sobre $15.000: Solo $3.500</strong><br/>
          • Pedidos sobre $50.000: <strong>¡Envío GRATIS!</strong>
        </p>
      </div>

      {/* Transportista */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Elige tu transportista</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(CARRIERS) as CarrierKey[]).map((key) => {
            const c = CARRIERS[key];
            const selected = carrier === key;
            return (
              <button
                key={key}
                onClick={() => setCarrier(key)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selected ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-pressed={selected}
              >
                <img src={c.icon} alt={c.name} className="w-8 h-8 object-contain" />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-600">{formatPrice(c.price)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comuna */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingresa tu comuna
        </label>
        <input
          list="comunas"
          value={comuna}
          onChange={(e) => setComuna(e.target.value)}
          placeholder="Ej: Rancagua"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <datalist id="comunas">
          {SUGERENCIAS_COMUNAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-gray-500 mt-1">
          Si existe tarifa por comuna, se aplicará automáticamente. Si no, usaremos la tarifa del transportista elegido.
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
          💡 Envío ${formatPrice(REDUCED_RATE)} para compras sobre {formatPrice(REDUCED_RATE_THRESHOLD)} • Envío gratis desde {formatPrice(FREE_THRESHOLD)}
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
            <span>Envío ({CARRIERS[carrier].name}):</span>
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


