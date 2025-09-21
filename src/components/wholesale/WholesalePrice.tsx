'use client'

import { useWholesale } from '@/lib/hooks/useWholesale'
import { formatPrice } from '@/lib/pricingUtils'
import { Star, TrendingDown } from 'lucide-react'

interface WholesalePriceProps {
  productId: string
  retailPrice: number
  className?: string
  showLabel?: boolean
}

export default function WholesalePrice({ 
  productId, 
  retailPrice, 
  className = '',
  showLabel = true 
}: WholesalePriceProps) {
  const { getProductPrice, isApprovedWholesale, wholesaleAccount } = useWholesale()
  
  const pricing = getProductPrice(productId, retailPrice)

  if (!pricing.is_wholesale) {
    // Precio retail normal
    return (
      <div className={className}>
        <span className="text-3xl font-bold text-gray-900">
          {formatPrice(pricing.final_price)}
        </span>
      </div>
    )
  }

  // Precio mayorista
  return (
    <div className={className}>
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-indigo-600">
              {formatPrice(pricing.final_price)}
            </span>
            {showLabel && (
              <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs font-semibold">
                <Star className="w-3 h-3" />
                <span>Mayorista</span>
              </div>
            )}
          </div>
          
          {pricing.discount_percentage && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(pricing.retail_price)}
              </span>
              <div className="flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                <TrendingDown className="w-3 h-3" />
                <span>-{pricing.discount_percentage}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLabel && pricing.level && (
        <p className="text-sm text-gray-600 mt-2">
          Tarifa: Nivel {pricing.level} ({pricing.discount_percentage}% descuento)
        </p>
      )}
    </div>
  )
}

// Componente para mostrar el banner de nivel en el header
export function WholesaleLevelBanner() {
  const { isApprovedWholesale, wholesaleAccount } = useWholesale()

  if (!isApprovedWholesale || !wholesaleAccount) {
    return null
  }

  const getLevelInfo = (level?: string) => {
    switch (level) {
      case 'A':
        return { name: 'Nivel A', discount: '30%', color: 'bg-green-600' }
      case 'B':
        return { name: 'Nivel B', discount: '25%', color: 'bg-blue-600' }
      case 'C':
        return { name: 'Nivel C', discount: '20%', color: 'bg-orange-600' }
      default:
        return { name: 'Sin nivel', discount: '0%', color: 'bg-gray-600' }
    }
  }

  const levelInfo = getLevelInfo(wholesaleAccount.nivel)

  return (
    <div className={`${levelInfo.color} text-white py-2`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <Star className="w-4 h-4" />
          <span className="font-semibold">
            Tarifa Mayorista: {levelInfo.name} - {levelInfo.discount} descuento
          </span>
          <span className="text-white/80">
            | {wholesaleAccount.nombre_fantasia || wholesaleAccount.razon_social}
          </span>
        </div>
      </div>
    </div>
  )
}
