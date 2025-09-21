'use client';

import { useMemo, useState } from 'react';
import { formatPrice } from '@/lib/pricingUtils';

interface ShippingEstimatorProps {
  unitPrice: number; // precio unitario final (incluye recargos como tinta)
}

// Tarifas ejemplo: por comuna específica. Si no está, aplica tarifa por defecto
const DEFAULT_TARIFF = 5000;
const FREE_THRESHOLD = 50000; // Envío gratis desde $50.000

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

export default function ShippingEstimator({ unitPrice }: ShippingEstimatorProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [comuna, setComuna] = useState<string>('');
  const [carrier, setCarrier] = useState<CarrierKey>('starken');

  const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const shipping = useMemo(() => {
    if (subtotal >= FREE_THRESHOLD) return 0;
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

  const whatsappHref = useMemo(() => {
    const msg = `Hola, quiero comprar:\n- Producto: Timbre personalizado\n- Cantidad: ${quantity}\n- Comuna: ${comuna || 'por definir'}\n- Subtotal: ${formatPrice(subtotal)}\n- Envío: ${formatPrice(shipping)}\n- Total: ${formatPrice(total)}`;
    // Número real del negocio
    const phone = '56922384216';
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }, [quantity, comuna, subtotal, shipping, total]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🚚 Envío</h3>

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
        <p className="text-xs text-gray-500 mt-1">Envío gratis desde {formatPrice(FREE_THRESHOLD)}.</p>
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

      {/* CTA */}
      <div className="mt-4 flex gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Consultar / Comprar por WhatsApp
        </a>
      </div>
    </div>
  );
}


