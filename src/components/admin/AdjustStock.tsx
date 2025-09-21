'use client'

import { useState } from 'react'

export default function AdjustStock({ id, slug, current }: { id?: string, slug?: string, current?: number }) {
  const [mode, setMode] = useState<'delta' | 'set'>('delta')
  const [value, setValue] = useState<string>('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const body: any = { }
      if (id) body.product_id = id
      if (slug) body.slug = slug
      if (mode === 'delta') body.delta = Number(value)
      else body.set = Number(value)

      const res = await fetch('/api/admin/productos/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Error ajustando stock')
      }
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <select value={mode} onChange={e => setMode(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
        <option value="delta">Descontar / Sumar</option>
        <option value="set">Fijar a</option>
      </select>
      <input
        type="number"
        className="w-24 border rounded px-2 py-1 text-sm"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="submit" disabled={loading} className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50">
        {loading ? 'Aplicando…' : 'Aplicar'}
      </button>
      {typeof current === 'number' && (
        <span className="text-xs text-gray-500">Actual: {current}</span>
      )}
      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}
    </form>
  )
}


