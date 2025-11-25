'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductImage } from '@/types/product';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isStamping, setIsStamping] = useState(false);

  const currentImage = images[currentImageIndex] || images[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleStampClick = () => {
    setIsStamping(true);
    setTimeout(() => setIsStamping(false), 600);
  };

  // Helper para sanear URLs de imagen
  const getSafeImageUrl = (rawUrl?: string) => {
    const placeholder = 'https://media.artesellos.cl/sin-image-producto-artesellos.png';
    if (!rawUrl || typeof rawUrl !== 'string') return placeholder;
    const url = rawUrl.trim();
    if (!url) return placeholder;
    if (url.startsWith('/')) return url;
    try {
      new URL(url);
      return url;
    } catch {
      return placeholder;
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Sin imagen disponible</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative group">
        <div 
          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={handleStampClick}
        >
          <img
            src={getSafeImageUrl(currentImage?.src)}
            alt={currentImage?.alt || productName}
            className={`w-full h-full object-contain transition-all duration-500 ${
              isStamping ? 'animate-pulse scale-95 -translate-y-2 rotate-1' : ''
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://media.artesellos.cl/sin-image-producto-artesellos.png';
            }}
          />
          
          {/* Efecto de estampado */}
          {isStamping && (
            <div className="absolute inset-0 bg-black opacity-20 transition-opacity duration-300"></div>
          )}
          
          {/* Partículas flotantes */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-bounce"></div>
          <div className="absolute top-8 right-6 w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse"></div>
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600 group-hover:animate-ping"></div>
          
          {/* Indicador de interacción */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            👆 Haz clic para estampar
          </div>
        </div>

        {/* Navegación de imágenes */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Imagen anterior"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Siguiente imagen"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Contador de imágenes */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id.toString() || index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex 
                  ? 'border-indigo-500 ring-2 ring-indigo-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={getSafeImageUrl(image.src)}
                alt={image.alt || productName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
