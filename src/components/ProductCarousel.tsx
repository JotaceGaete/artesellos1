'use client';

import { useRef } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface ProductCarouselProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductCarousel({ products, emptyMessage = 'No se encontraron productos.' }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l6 3" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const delta = Math.floor(el.clientWidth * 0.9) * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Botón Izquierdo */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollByAmount('left')}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L7.586 11l3.707-3.707a1 1 0 011.414 1.414L10.414 11l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
      </button>

      {/* Pista */}
      <div
        ref={trackRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Ocultar scrollbar en Webkit */}
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="flex gap-4 md:gap-5 xl:gap-6 px-1">
          {products.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Botón Derecho */}
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scrollByAmount('right')}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L9.586 11 7.293 8.707a1 1 0 111.414-1.414L12.414 11l-3.707 3.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
}


