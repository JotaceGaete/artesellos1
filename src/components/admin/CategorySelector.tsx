'use client'

import { useEffect, useState } from 'react'
import { FIXED_CATEGORIES } from '@/lib/woocommerce'

export default function CategorySelector({ initial = [], productId }: { initial?: string[]; productId?: string }) {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelected(initial)
  }, [initial])

  const toggle = (slug: string, checked: boolean) => {
    setSelected(prev => {
      const set = new Set(prev)
      if (checked) set.add(slug)
      else set.delete(slug)
      return Array.from(set)
    })
  }

  const save = async () => {
    if (!productId) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/productos/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, categories: selected })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'No se pudo guardar categorías')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {FIXED_CATEGORIES.map(cat => (
          <label key={cat.slug} className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(cat.slug) || selected.includes(cat.name)}
              onChange={e => toggle(cat.slug, e.target.checked)}
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving || !productId} className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50">
          {saving ? 'Guardando…' : 'Guardar categorías'}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
}


