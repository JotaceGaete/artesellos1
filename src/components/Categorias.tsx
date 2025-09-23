'use client';

import Link from "next/link";

// 5 banners estáticos cuadrados - tú colocarás el contenido
const STATIC_BANNERS = [
  { id: 1, title: "Banner 1", href: "/", image: "https://media.artesellos.cl/Banners/Banner1.webp" },
  { id: 2, title: "Banner 2", href: "/", image: "https://media.artesellos.cl/Banners/banner2.webp" },
  { id: 3, title: "Banner 3", href: "/" },
  { id: 4, title: "Banner 4", href: "/" },
  { id: 5, title: "Banner 5", href: "/" },
];

export default function Categorias() {
  return (
    <div className="space-y-8">
      {/* 5 Banners estáticos cuadrados */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATIC_BANNERS.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Zona gris donde tú colocarás el contenido */}
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              {banner.image ? (
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm font-medium">
                  {banner.title}
                </span>
              )}
            </div>
            {/* Overlay para hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </Link>
        ))}
      </div>

      {/* Franja gris inferior (como la zona de "99% Positive") */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="text-center">
          <div className="text-gray-600 text-sm font-medium mb-2">
            Zona de confianza y garantías
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>99% Satisfacción</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Envío Rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Calidad Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}