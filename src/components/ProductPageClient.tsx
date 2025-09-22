'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ShippingEstimator from '@/components/ShippingEstimator';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/pricingUtils';

interface ProductPageClientProps {
  product: Product;
  slug: string;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  // const [customizedProduct, setCustomizedProduct] = useState<CustomizedProduct | null>(null);
  // const [selectedColor, setSelectedColor] = useState<string>(
  //   product.customization_options?.color_options?.default_color || '#000000'
  // );
  // Color de tinta (UI)
  const [inkColor, setInkColor] = useState<'negro' | 'azul' | 'rojo' | 'verde' | 'blanco' | 'morado'>('negro');
  const [colorVariants, setColorVariants] = useState<Array<{ id: string; color_slug: string; color_name: string; hex?: string; image_url?: string; stock_quantity: number; is_default: boolean }>>([])
  const [selectedShell, setSelectedShell] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  
  // Recargo por color de tinta
  const inkSurcharge = useMemo(() => (inkColor === 'negro' ? 0 : 2000), [inkColor]);
  const isCustomizable = product.customization_options?.allow_custom_dimensions || false;
  
  // Verificar si el producto tiene múltiples colores
  // const availableColors = product.customization_options?.color_options?.available_colors || [];
  // const hasMultipleColors = availableColors.length > 1;

  // Cargar variantes de colores de carcaza (si existen)
  useEffect(() => {
    const loadColors = async () => {
      try {
        const res = await fetch(`/api/productos/${product.slug}/colores`)
        const data = await res.json()
        if (Array.isArray(data.items)) {
          setColorVariants(data.items)
          const def = data.items.find((c: { is_default: boolean }) => c.is_default) || data.items[0]
          setSelectedShell(def ? def.color_slug : null)
        }
      } catch {}
    }
    loadColors()
  }, [product.slug])

  // Generar mensaje de WhatsApp
  const whatsappMessage = useMemo(() => {
    const selectedShellName = selectedShell ? colorVariants.find(v => v.color_slug === selectedShell)?.color_name || selectedShell : '';
    const totalPrice = (parseFloat(product.price) + inkSurcharge) * quantity;
    
    return `Hola, me interesa este producto: ${product.name}

Detalles:
- Cantidad: ${quantity}
- Color de tinta: ${inkColor}${inkSurcharge > 0 ? ' (+$2.000)' : ''}
${selectedShellName ? `- Color de carcaza: ${selectedShellName}` : ''}

Precio unitario: ${formatPrice(parseFloat(product.price) + inkSurcharge)}
Total: ${formatPrice(totalPrice)}

¿Podrían confirmarme disponibilidad y forma de pago?`;
  }, [product.name, product.price, quantity, inkColor, inkSurcharge, selectedShell, colorVariants]);

  const whatsappUrl = `https://wa.me/56922384216?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Inicio
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images - Galería Moderna */}
        <div className="space-y-6">
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Selector de color de carcaza (variantes) */}
          {colorVariants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Color de carcaza</h3>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map((variant) => {
                  const disabled = (variant.stock_quantity ?? 0) <= 0
                  const active = selectedShell === variant.color_slug
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedShell(variant.color_slug)}
                      disabled={disabled}
                      aria-pressed={active}
                      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        active
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={disabled ? `${variant.color_name} (Agotado)` : variant.color_name}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full border ${active ? 'border-indigo-600' : 'border-gray-300'} group-hover:scale-[1.05] transition-transform`}
                        style={{ backgroundColor: variant.hex || '#fff' }}
                      />
                      <span>{variant.color_name}</span>
                      {disabled && (
                        <span className="ml-1 inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">Agotado</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selector de color de tinta */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Color de tinta
              <span className="text-sm font-normal text-gray-500 ml-2">
                — {inkColor}{inkColor !== 'negro' ? ' (+$2.000)' : ''}
              </span>
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Negro es el color por defecto</span> que tiene el timbre. 
              Otros colores de tinta llevan recargo de $2.000.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {([
                { key: 'negro', hex: '#000000' },
                { key: 'rojo', hex: '#FF0000' },
                { key: 'azul', hex: '#0000FF' },
                { key: 'verde', hex: '#008000' },
                { key: 'blanco', hex: '#FFFFFF' },
                { key: 'morado', hex: '#800080' },
              ] as { key: 'negro' | 'azul' | 'rojo' | 'verde' | 'blanco' | 'morado'; hex: string }[]).map(({ key, hex }) => (
                <button
                  key={key}
                  onClick={() => setInkColor(key)}
                  className={`relative h-10 w-10 rounded-full border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    inkColor === key ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 scale-[1.05]' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Seleccionar tinta ${key}`}
                >
                  {key === 'blanco' && (
                    <span className="absolute inset-0 rounded-full border border-gray-300" />
                  )}
                </button>
              ))}
            </div>
            {inkSurcharge > 0 && (
              <p className="text-sm text-gray-600">Recargo por tinta: +$2.000</p>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {(product.categories as any[]).map((category, index) => {
              const categoryName = typeof category === 'string' ? category : category.name;
              const categorySlug = typeof category === 'string' ? category.toLowerCase() : category.slug;
              const categoryId = typeof category === 'string' ? category : category.id;
              
              return (
                <Link
                  key={`category-${categoryId || index}`}
                  href={`/categoria/${categorySlug}`}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {categoryName}
                </Link>
              );
            })}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Stamp Info */}
          {product.stamp_info && (
            <div className="flex items-center space-x-4 py-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {product.stamp_info.type === 'automatic' ? 'Automático' :
                 product.stamp_info.type === 'manual' ? 'Manual' :
                 product.stamp_info.type === 'self-inking' ? 'Autoentintable' : 'Preentintado'}
              </span>
              {isCustomizable && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✏️ Personalizable
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-4">
            {product.on_sale && product.sale_price ? (
              <>
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(parseFloat(product.sale_price) + inkSurcharge)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(parseFloat(product.regular_price))}
                </span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  -{Math.round((1 - parseFloat(product.sale_price) / parseFloat(product.regular_price)) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(parseFloat(product.price) + inkSurcharge)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {product.stock_status === 'instock' ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">En stock</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Agotado</span>
              </>
            )}
          </div>

          {/* Short Description */}
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700">{product.short_description}</p>
          </div>

          {/* Selector de cantidad */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Cantidad:
              </label>
              <select
                  id="quantity"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: Math.min(10, product.stock_quantity || 10) }, (_, i) => i + 1).map((num) => (
                    <option key={`quantity-${num}`} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
            </div>
          </div>

          {/* Estimador de envío */}
          <div className="border-t pt-6">
            <ShippingEstimator unitPrice={parseFloat(product.price) + inkSurcharge} />
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">SKU:</span>
                <span className="ml-2 text-gray-600">{product.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Categoría:</span>
                <span className="ml-2 text-gray-600">
                  {product.categories.map(cat => typeof cat === 'string' ? cat : cat.name).join(', ')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Peso:</span>
                <span className="ml-2 text-gray-600">{product.weight} kg</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Dimensiones:</span>
                <span className="ml-2 text-gray-600">
                  {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-16 border-t pt-16">
        <div className="prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Descripción del Producto</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {(product.tags as any[]).map((tag, index) => {
              const tagName = typeof tag === 'string' ? tag : tag.name; 
              const tagSlug = typeof tag === 'string' ? tag.toLowerCase() : tag.slug;
              const tagId = typeof tag === 'string' ? tag : tag.id;
              
              return (
                <Link
                  key={`tag-${tagId || index}`}
                  href={`/tag/${tagSlug}`}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tagName}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky WhatsApp Button - Solo en móviles */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 md:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-3 shadow-lg"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>¡Hablemos por WhatsApp!</span>
        </a>
      </div>

      {/* WhatsApp Button para Desktop */}
      <div className="hidden md:block mt-8">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-3 shadow-lg"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>¡Hablemos por WhatsApp!</span>
        </a>
      </div>
    </div>
  );
}