'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface ColorItem {
  id: string
  product_id: string
  color_slug: string
  color_name: string
  hex?: string
  image_url?: string
  stock_quantity: number
  is_default: boolean
  price_diff: number
  active: boolean
}

export default function ManageColorsPage() {
  const routeParams = useParams()
  const productId = (routeParams as any)?.id?.toString() || ''
  const [items, setItems] = useState<ColorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ColorItem>>({ color_slug: '', color_name: '', stock_quantity: 0, active: true })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ColorItem>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/productos/colores?product_id=${productId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Error cargando colores')
      setItems(data.items || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [productId])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/productos/colores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', product_id: productId, ...form })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Error creando color')
      setForm({ color_slug: '', color_name: '', stock_quantity: 0, active: true })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const update = async (id: string, patch: Partial<ColorItem>) => {
    const res = await fetch('/api/admin/productos/colores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...patch })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Error actualizando color')
    await load()
  }

  const remove = async (id: string) => {
    const res = await fetch('/api/admin/productos/colores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Error eliminando color')
    await load()
  }

  const startEdit = (item: ColorItem) => {
    setEditingId(item.id)
    setEditForm({
      color_slug: item.color_slug,
      color_name: item.color_name,
      hex: item.hex,
      image_url: item.image_url,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (id: string) => {
    try {
      setSavingId(id)
      await update(id, {
        color_slug: editForm.color_slug,
        color_name: editForm.color_name,
        hex: editForm.hex,
        image_url: editForm.image_url,
      })
      setEditingId(null)
      setEditForm({})
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar cambios')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestionar colores</h1>
        <Link href="/admin/productos" className="text-sm text-indigo-600 hover:underline">Volver</Link>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
        <input className="border rounded px-2 py-1 text-sm" placeholder="slug (ej. rojo)" value={form.color_slug || ''} onChange={e => setForm({ ...form, color_slug: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="nombre (Rojo)" value={form.color_name || ''} onChange={e => setForm({ ...form, color_name: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="#hex" value={form.hex || ''} onChange={e => setForm({ ...form, hex: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="image_url" value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" type="number" placeholder="stock" value={form.stock_quantity ?? 0} onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
        <div className="md:col-span-6 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })}/> Default</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })}/> Activo</label>
          <button type="submit" className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50">Agregar</button>
        </div>
      </form>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hex</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-sm">
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-1">
                      <input className="border rounded px-2 py-1 text-sm" value={editForm.color_name || ''} onChange={e => setEditForm({ ...editForm, color_name: e.target.value })} placeholder="Nombre" />
                      <input className="border rounded px-2 py-1 text-sm" value={editForm.color_slug || ''} onChange={e => setEditForm({ ...editForm, color_slug: e.target.value })} placeholder="slug" />
                    </div>
                  ) : (
                    <>{item.color_name} <span className="text-gray-400">({item.color_slug})</span></>
                  )}
                </td>
                <td className="px-3 py-2 text-sm">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded border align-middle" style={{ backgroundColor: editForm.hex || item.hex || '#fff' }} />
                      <input className="border rounded px-2 py-1 text-sm w-28" value={editForm.hex || ''} onChange={e => setEditForm({ ...editForm, hex: e.target.value })} placeholder="#hex" />
                    </div>
                  ) : (
                    <><span className="inline-block w-4 h-4 rounded border align-middle mr-2" style={{ backgroundColor: item.hex || '#fff' }} />{item.hex || '-'}</>
                  )}
                </td>
                <td className="px-3 py-2 text-sm">
                  {editingId === item.id ? (
                    <input className="border rounded px-2 py-1 text-sm w-56" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} placeholder="image_url" />
                  ) : (
                    item.image_url ? <a href={item.image_url} target="_blank" className="text-indigo-600 hover:underline">ver</a> : '-'
                  )}
                </td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => update(item.id, { stock_quantity: Math.max(0, item.stock_quantity - 1) })} className="px-2 py-1 border rounded">-1</button>
                    <span>{item.stock_quantity}</span>
                    <button type="button" onClick={() => update(item.id, { stock_quantity: item.stock_quantity + 1 })} className="px-2 py-1 border rounded">+1</button>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm"><input type="checkbox" checked={item.is_default} onChange={e => update(item.id, { is_default: e.target.checked })} /></td>
                <td className="px-3 py-2 text-sm"><input type="checkbox" checked={item.active} onChange={e => update(item.id, { active: e.target.checked })} /></td>
                <td className="px-3 py-2 text-right text-sm">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-3 justify-end">
                      <button type="button" onClick={() => saveEdit(item.id)} className="text-green-700 hover:underline" disabled={savingId === item.id}>{savingId === item.id ? 'Guardando…' : 'Guardar'}</button>
                      <button type="button" onClick={cancelEdit} className="text-gray-600 hover:underline">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-end">
                      <button type="button" onClick={() => startEdit(item)} className="text-indigo-600 hover:underline">Editar</button>
                      <button type="button" onClick={() => remove(item.id)} className="text-red-600 hover:underline">Eliminar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">Sin colores aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


