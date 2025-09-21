'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/productos/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar producto')
      }

      // Refrescar la página para mostrar los cambios
      router.refresh()
    } catch (error) {
      console.error('Error eliminando producto:', error)
      alert('Error al eliminar el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
      title={`Eliminar ${productName}`}
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
