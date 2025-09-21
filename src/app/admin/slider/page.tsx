'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Slide {
  id?: string
  title: string
  subtitle?: string
  description?: string
  button_text?: string
  button_link?: string
  background_color?: string
  text_color?: string
  image_url?: string
  slide_order?: number
  active?: boolean
}

export default function AdminSliderPage() {
  const [items, setItems] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Slide>({ title: '', subtitle: '', description: '', button_text: '', button_link: '/', background_color: 'bg-gradient-to-r from-indigo-600 to-purple-600', text_color: 'text-white', image_url: '', slide_order: 0, active: true })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Slide>({ title: '', subtitle: '', description: '', button_text: '', button_link: '/', background_color: 'bg-gradient-to-r from-indigo-600 to-purple-600', text_color: 'text-white', image_url: '', slide_order: 0, active: true })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/slider', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Error cargando slides')
      setItems(data.items || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/slider', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...form })
    })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error creando slide')
    setForm({ title: '', subtitle: '', description: '', button_text: '', button_link: '/', background_color: 'bg-gradient-to-r from-indigo-600 to-purple-600', text_color: 'text-white', image_url: '', slide_order: 0, active: true })
    load()
  }

  const update = async (id: string, patch: Partial<Slide>) => {
    const res = await fetch('/api/admin/slider', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id, ...patch })
    })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error actualizando slide')
    load()
  }

  const remove = async (id: string) => {
    const res = await fetch('/api/admin/slider', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id })
    })
    const data = await res.json()
    if (!res.ok) return setError(data?.message || 'Error eliminando slide')
    load()
  }

  const startEdit = (s: Slide) => {
    setEditingId(s.id!)
    setEditForm({
      id: s.id,
      title: s.title || '',
      subtitle: s.subtitle || '',
      description: s.description || '',
      button_text: s.button_text || '',
      button_link: s.button_link || '/',
      background_color: s.background_color || 'bg-gradient-to-r from-indigo-600 to-purple-600',
      text_color: s.text_color || 'text-white',
      image_url: s.image_url || '',
      slide_order: s.slide_order ?? 0,
      active: s.active ?? true,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const { id: _id, ...payload } = editForm as any
    await update(editingId, payload)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Slider - Administración</h1>
        <Link href="/admin" className="text-sm text-indigo-600 hover:underline">Volver</Link>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
        <input className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="Subtítulo" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="Orden" type="number" value={form.slide_order} onChange={e => setForm({ ...form, slide_order: Number(e.target.value) })} />
        <input className="border rounded px-2 py-1 text-sm md:col-span-3" placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="Texto botón" value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="Link botón" value={form.button_link} onChange={e => setForm({ ...form, button_link: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="Clase fondo (Tailwind)" value={form.background_color} onChange={e => setForm({ ...form, background_color: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm" placeholder="Clase texto (Tailwind)" value={form.text_color} onChange={e => setForm({ ...form, text_color: e.target.value })} />
        <input className="border rounded px-2 py-1 text-sm md:col-span-3" placeholder="Imagen URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })}/> Activo</label>
        <button type="submit" className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50">Agregar</button>
      </form>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtítulo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map((s) => (
              <>
                <tr key={s.id}>
                  <td className="px-3 py-2 text-sm">
                    <input className="w-16 border rounded px-2 py-1 text-sm" type="number" defaultValue={s.slide_order ?? 0} onBlur={(e) => update(s.id!, { slide_order: Number(e.target.value) })} />
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <input className="border rounded px-2 py-1 text-sm w-56" defaultValue={s.title} onBlur={(e) => update(s.id!, { title: e.target.value })} />
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <input className="border rounded px-2 py-1 text-sm w-56" defaultValue={s.subtitle} onBlur={(e) => update(s.id!, { subtitle: e.target.value })} />
                  </td>
                  <td className="px-3 py-2 text-sm">{s.image_url ? <a href={s.image_url} target="_blank" className="text-indigo-600 hover:underline">ver</a> : '-'}</td>
                  <td className="px-3 py-2 text-sm"><input type="checkbox" defaultChecked={!!s.active} onChange={(e) => update(s.id!, { active: e.target.checked })} /></td>
                  <td className="px-3 py-2 text-right text-sm">
                    <div className="flex items-center gap-3 justify-end">
                      <button type="button" onClick={() => startEdit(s)} className="text-indigo-600 hover:underline">Editar</button>
                      <button type="button" onClick={() => remove(s.id!)} className="text-red-600 hover:underline">Eliminar</button>
                    </div>
                  </td>
                </tr>
                {editingId === s.id && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 px-3 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <input className="border rounded px-2 py-1 text-sm md:col-span-3" placeholder="Descripción" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Texto botón" value={editForm.button_text || ''} onChange={e => setEditForm({ ...editForm, button_text: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Link botón" value={editForm.button_link || '/'} onChange={e => setEditForm({ ...editForm, button_link: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm md:col-span-3" placeholder="Imagen URL" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Clase fondo (Tailwind)" value={editForm.background_color || ''} onChange={e => setEditForm({ ...editForm, background_color: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Clase texto (Tailwind)" value={editForm.text_color || ''} onChange={e => setEditForm({ ...editForm, text_color: e.target.value })} />
                        <div className="md:col-span-6 flex items-center gap-3 justify-end">
                          <button type="button" onClick={saveEdit} className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-100">Guardar</button>
                          <button type="button" onClick={cancelEdit} className="px-3 py-1 text-sm rounded border">Cancelar</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">Sin slides</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


