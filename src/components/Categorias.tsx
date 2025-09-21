'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  { 
    slug: "romanticos", 
    title: "Románticos", 
    img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&h=900&fit=crop&q=80", 
    alt: "Timbre romántico con corazón e impresión en papel" 
  },
  { 
    slug: "celebraciones", 
    title: "Celebraciones", 
    img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=900&fit=crop&q=80", 
    alt: "Timbre para cumpleaños con globos e impresión" 
  },
  { 
    slug: "infantiles", 
    title: "Infantiles", 
    img: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1200&h=900&fit=crop&q=80", 
    alt: "Timbre infantil con dibujo colorido y huella" 
  },
  { 
    slug: "bodas", 
    title: "Bodas", 
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=900&fit=crop&q=80", 
    alt: "Timbre para bodas con anillos e impresión elegante" 
  },
  { 
    slug: "academicos", 
    title: "Académicos", 
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=900&fit=crop&q=80", 
    alt: "Timbre académico con birrete e impresión formal" 
  },
  { 
    slug: "festivos", 
    title: "Festivos", 
    img: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&h=900&fit=crop&q=80", 
    alt: "Timbre navideño con árbol e impresión festiva" 
  },
];

export default function Categorias() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (isHovering) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: Math.floor(el.clientWidth * 0.9), behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovering]);

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const delta = Math.floor(el.clientWidth * 0.9) * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L7.586 11l3.707-3.707a1 1 0 011.414 1.414L10.414 11l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
      </button>

      <div
        ref={trackRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="flex gap-4 md:gap-5 xl:gap-6 px-1">
          {CATEGORIES.map(c => (
            <Link 
              href={`/categoria/${c.slug}`} 
              key={c.slug} 
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[340px] lg:w-[360px]"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={c.img}
                  alt={c.alt}
                  fill
                  sizes="(max-width:768px) 80vw, (max-width:1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={false}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-2 left-3 text-white font-semibold text-sm drop-shadow-lg">
                {c.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L9.586 11 7.293 8.707a1 1 0 111.414-1.414L12.414 11l-3.707 3.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
}
