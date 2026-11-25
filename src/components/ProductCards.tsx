'use client';

// Fichas de producto del chat: foto a la izquierda, información a la derecha y ampliación al pulsar.
// Usado por el widget flotante y por /consultas. No muestra cantidades de stock, solo disponibilidad.
import { useEffect, useState } from 'react';
import type { ProductCard } from '@/lib/chatStream';

const DISPONIBILIDAD: Record<ProductCard['disponibilidad'], { label: string; className: string }> = {
  disponible: { label: 'Disponible', className: 'font-semibold text-green-700' },
  agotado: { label: 'Agotado', className: 'font-semibold text-red-600' },
  consultar: { label: 'Consultar disponibilidad', className: 'text-gray-600' },
};

export default function ProductCards({ products }: { products: ProductCard[] }) {
  const [zoom, setZoom] = useState<ProductCard | null>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  return (
    <>
      <ul className="mt-3 space-y-3">
        {products.map((p, i) => {
          const titulo = `${p.marca} ${p.modelo}`.trim();
          const disp = DISPONIBILIDAD[p.disponibilidad];
          return (
            <li
              key={`${p.marca}-${p.modelo}-${p.color}-${i}`}
              className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <button
                type="button"
                onClick={() => p.imagen_url && setZoom(p)}
                disabled={!p.imagen_url}
                aria-label={p.imagen_url ? `Ampliar foto de ${titulo} ${p.color}` : `${titulo} sin fotografía`}
                className="flex h-[110px] w-[90px] flex-none items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 disabled:cursor-default"
              >
                {p.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagen_url}
                    alt={`${titulo} ${p.color}`}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-1 text-center text-xs text-gray-400">Sin foto</span>
                )}
              </button>

              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="break-words text-[16px] font-bold leading-snug text-gray-900">{titulo}</h3>
                {p.color && <p className="break-words text-[16px] text-gray-700">{p.color}</p>}
                {p.medidas && <p className="text-[16px] text-gray-600">{p.medidas}</p>}
                <p className="text-[18px] font-bold text-indigo-700">
                  {p.precio !== null ? `$${p.precio.toLocaleString('es-CL')}` : 'Consultar precio'}
                </p>
                <p className={`text-[16px] ${disp.className}`}>{disp.label}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {zoom?.imagen_url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${zoom.marca} ${zoom.modelo}`}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[60] flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.imagen_url}
            alt={`${zoom.marca} ${zoom.modelo} ${zoom.color}`}
            className="max-h-[90vh] max-w-[95vw] object-contain"
          />
        </div>
      )}
    </>
  );
}
