'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'

interface BannerItem { id?: string; text: string; url?: string; active?: boolean; order_index?: number }

export default function AdminTopBannerPage() {
  const [items, setItems] = useState<BannerItem[]>([])
  const [form, setForm] = useState<BannerItem>({ text: '', url: '', active: true, order_index: 0 })
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    const res = await fetch('/api/admin/top-banner', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error cargando mensajes')
    setItems(data.items || [])
  }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/top-banner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...form }) })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error creando mensaje')
    setForm({ text: '', url: '', active: true, order_index: 0 })
    load()
  }

  const update = async (id: string, patch: Partial<BannerItem>) => {
    const res = await fetch('/api/admin/top-banner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id, ...patch }) })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error actualizando')
    load()
  }

  const remove = async (id: string) => {
    const res = await fetch('/api/admin/top-banner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error eliminando')
    load()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Top Banner</h1>
        </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
        <input className="border rounded px-2 py-1 text-sm md:col-span-3" placeholder="Texto" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} required />
        <input className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="URL opcional" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="Orden" type="number" value={form.order_index} onChange={e => setForm({ ...form, order_index: Number(e.target.value) })} />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })}/> Activo</label>
        <button type="submit" className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50">Agregar</button>
      </form>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Texto</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map((m: any) => (
              <tr key={m.id}>
                <td className="px-3 py-2 text-sm"><input className="w-16 border rounded px-2 py-1 text-sm" type="number" defaultValue={m.order_index ?? 0} onBlur={(e) => update(m.id, { order_index: Number(e.target.value) })} /></td>
                <td className="px-3 py-2 text-sm"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={m.text} onBlur={(e) => update(m.id, { text: e.target.value })} /></td>
                <td className="px-3 py-2 text-sm"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={m.url || ''} onBlur={(e) => update(m.id, { url: e.target.value })} /></td>
                <td className="px-3 py-2 text-sm"><input type="checkbox" defaultChecked={!!m.active} onChange={(e) => update(m.id, { active: e.target.checked })} /></td>
                <td className="px-3 py-2 text-right text-sm"><button onClick={() => remove(m.id)} className="text-red-600 hover:underline">Eliminar</button></td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">Sin mensajes</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </AdminLayout>
  )
}


