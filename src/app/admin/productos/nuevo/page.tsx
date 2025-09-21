'use client'

import { useState } from 'react'
import { FIXED_CATEGORIES } from '@/lib/woocommerce'
import { useRouter } from 'next/navigation'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [images, setImages] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          price: Number(price.replace(/\D/g, '')),
          description,
          short_description: shortDescription,
          images: images
            .split(/\n|,/) // coma o salto de línea
            .map(s => s.trim())
            .filter(Boolean),
          categories,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Error al crear producto')
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Precio (CLP entero)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" inputMode="numeric" pattern="[0-9\.\s]*" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción corta</label>
          <input value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 min-h-[120px]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categorías</label>
          <div className="flex flex-wrap gap-3">
            {FIXED_CATEGORIES.map(cat => (
              <label key={cat.slug} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={categories.includes(cat.slug)}
                  onChange={e => setCategories(prev => e.target.checked ? [...prev, cat.slug] : prev.filter(s => s !== cat.slug))}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Imágenes (una por línea o separadas por coma)</label>
          <textarea value={images} onChange={e => setImages(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 min-h-[120px]" placeholder="https://artesellos.cl/imagen1.webp\nhttps://artesellos.cl/imagen2.webp" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="pt-2">
          <button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-md hover:bg-black disabled:opacity-50">
            {submitting ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </div>
  )
}


