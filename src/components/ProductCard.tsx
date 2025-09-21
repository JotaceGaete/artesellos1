'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/lib/cartContext';
import WholesalePrice from '@/components/wholesale/WholesalePrice';
import { formatDimensions } from '@/lib/pricingUtils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  // Favoritos deshabilitado en MVP
  const [isHovered, setIsHovered] = useState(false);
  
  // Imagen principal y secundaria para el efecto hover (con saneo de URL)
  const safeUrl = (url?: string) => {
    const placeholder = '/placeholder-product.jpg';
    if (!url || typeof url !== 'string') return placeholder;
    const trimmed = url.trim();
    if (!trimmed) return placeholder;

    // URL absoluta o relativa al root ya válida
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }

    // Intentar resolver como key de CDN/base (ej: "timbres/archivo.jpg")
    try {
      const base = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || 'https://artesellos.cl').replace(/\/+$/, '');
      let key = trimmed.replace(/^\/+/, '');
      key = key.replace(/^(timbres\/)/i, '');
      const encoded = key.split('/')
        .filter(Boolean)
        .map((seg) => encodeURIComponent(seg))
        .join('/');
      return `${base}/${encoded}`;
    } catch {
      // Fallback final: si todo falla, usar placeholder
      return placeholder;
    }
  };

  const primaryImage = safeUrl(product.images?.[0]?.src || (product as any).images?.[0]);
  const secondaryImage = safeUrl(product.images?.[1]?.src || (product as any).images?.[1]) || primaryImage;
  const currentImage = isHovered && product.images.length > 1 ? secondaryImage : primaryImage;
  
  const isOnSale = product.on_sale && product.sale_price;

  // Helper function to calculate discount percentage
  const calculateDiscountPercentage = (regularPrice: string, salePrice: string): number => {
    const regular = parseFloat(regularPrice);
    const sale = parseFloat(salePrice);
    return Math.round((1 - sale / regular) * 100);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    addToCart(product, 1);
  };


  // Función para formatear dimensiones
  const formatDimensions = (dimensions: { width: number; height: number; unit: string }) => {
    return `${dimensions.width} x ${dimensions.height} ${dimensions.unit}`;
  };

  // Verificar si el producto permite personalización
  const isCustomizable = product.customization_options?.allow_custom_dimensions || false;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col focus-within:ring-2 focus-within:ring-indigo-500">
      <Link href={`/producto/${product.slug}`} aria-label={`Ver detalles del producto ${product.name}`} className="outline-none">
        <div
          className="relative bg-gray-100 rounded-t-2xl overflow-hidden"
          style={{ 
            height: '380px', 
            minHeight: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Efecto de sombra dinámica */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-1 translate-y-1"></div>
          
          {/* Contenedor de la imagen con animaciones */}
          <div className="relative transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-1 w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={product.images?.[0]?.alt || product.name}
              style={{ 
                maxWidth: '90%',
                maxHeight: '90%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                filter: isHovered ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'none'
              }}
              className="transition-all duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&q=80';
              }}
            />
            
            {/* Efecto de "estampado" sutil */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
          </div>
          
          {/* Partículas flotantes animadas */}
          <div className="absolute top-3 left-3 w-1 h-1 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-bounce"></div>
          <div className="absolute top-6 right-4 w-0.5 h-0.5 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse"></div>
          <div className="absolute bottom-4 left-6 w-1 h-1 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600 group-hover:animate-ping"></div>

          {/* Badges compactos */}
          {isOnSale && (
            <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-md bg-red-600 text-white font-semibold">Oferta</span>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 ml-${isOnSale ? '12' : '0'} text-[10px] px-2 py-0.5 rounded-md bg-indigo-600 text-white font-semibold">Destacado</span>
          )}

          {/* Favoritos eliminado en MVP */}
        </div>
      </Link>

      <div className="p-2 flex-1 flex flex-col">
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-1">
          {product.categories.slice(0, 2).map((category, index) => {
            // Manejar tanto objetos como strings para categorías
            const categoryName = typeof category === 'string' ? category : category.name;
            const categoryId = typeof category === 'string' ? category : category.id;
            
            return (
              <span
                key={`${product.id}-category-${categoryId || index}`}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {categoryName}
              </span>
            );
          })}
        </div>

        {/* Product Name */}
        <Link href={`/producto/${product.slug}`} className="outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stamp Dimensions and Type */}
        {product.stamp_info && (
          <div className="flex items-center justify-between mb-1 min-h-[1.5rem]">
            <div className="flex items-center space-x-1">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {product.stamp_info.type === 'automatic' ? 'Automático' :
                 product.stamp_info.type === 'manual' ? 'Manual' :
                 product.stamp_info.type === 'self-inking' ? 'Autoentintable' : 'Preentintado'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDimensions(product.stamp_info.default_dimensions)}
              </span>
            </div>
            {isCustomizable && (
              <span className="text-xs text-green-600 font-medium">
                ✏️ Personalizable
              </span>
            )}
          </div>
        )}

        {/* Short Description */}
        <p className="text-sm text-gray-600 mb-1 line-clamp-2 flex-1">
          {product.short_description}
        </p>

        {/* Price and Stock - Fixed height section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1">
            <WholesalePrice 
              productId={product.id.toString()}
              retailPrice={parseFloat(isOnSale ? product.sale_price : product.price)}
              className="flex-1"
              showLabel={false}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
