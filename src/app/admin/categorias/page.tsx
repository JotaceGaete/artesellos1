'use client';

import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCategories } from '@/lib/useCategories';
import {
  buildCategoryTree,
  deleteBlockReason,
  moveCategory,
  toSlug,
  type CategoryWithCount,
} from '@/lib/categories';

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300';

interface Draft {
  name: string;
  slug: string;
  slugTouched: boolean;
  parent_id: string;
  description: string;
}

const emptyDraft: Draft = { name: '', slug: '', slugTouched: false, parent_id: '', description: '' };

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div role="status" className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'ok' ? '✓' : '✕'} {msg}
    </div>
  );
}

export default function AdminCategoriasPage() {
  const { categories, source, loading, reload } = useCategories<CategoryWithCount>('admin');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const roots = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
  const readOnly = source === 'fallback';

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || 'Error');
    return data;
  }

  async function run(key: string, fn: () => Promise<void>, okMsg: string) {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      await reload();
      showToast(okMsg);
    } catch (e: any) {
      showToast(e.message, 'err');
    } finally {
      setBusy(null);
    }
  }

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    run('create', async () => {
      await call('/api/admin/categorias', 'POST', {
        name: draft.name,
        slug: draft.slug || toSlug(draft.name),
        parent_id: draft.parent_id || null,
        description: draft.description,
      });
      setDraft(emptyDraft);
    }, 'Categoría creada');
  };

  const startEdit = (c: CategoryWithCount) => {
    setEditingId(c.id);
    setEdit({ name: c.name, slug: c.slug, slugTouched: true, parent_id: c.parent_id ?? '', description: c.description ?? '' });
  };

  const saveEdit = (c: CategoryWithCount) =>
    run(`edit-${c.id}`, async () => {
      const body: Record<string, unknown> = {
        name: edit.name,
        description: edit.description,
        parent_id: edit.parent_id || null,
      };
      if (edit.slug !== c.slug) body.slug = edit.slug;
      await call(`/api/admin/categorias/${c.id}`, 'PUT', body);
      setEditingId(null);
    }, 'Cambios guardados');

  const toggleActive = (c: CategoryWithCount) =>
    run(`active-${c.id}`, async () => {
      await call(`/api/admin/categorias/${c.id}`, 'PUT', { is_active: !c.is_active });
    }, c.is_active ? 'Categoría oculta' : 'Categoría visible');

  const move = (c: CategoryWithCount, dir: -1 | 1) => {
    const items = moveCategory(categories, c.id, dir);
    if (items.length === 0) return;
    run(`move-${c.id}`, async () => {
      await call('/api/admin/categorias', 'PATCH', { items });
    }, 'Orden actualizado');
  };

  const remove = (c: CategoryWithCount) => {
    if (!confirm(`¿Eliminar la categoría "${c.name}"? Esta acción no se puede deshacer.`)) return;
    run(`delete-${c.id}`, async () => {
      await call(`/api/admin/categorias/${c.id}`, 'DELETE');
    }, 'Categoría eliminada');
  };

  const row = (c: CategoryWithCount, isChild: boolean, index: number, total: number) => {
    const blocked = deleteBlockReason(c, categories, c.product_count);
    const editing = editingId === c.id;
    const parentInactive = isChild && categories.find(p => p.id === c.parent_id)?.is_active === false;
    return (
      <li key={c.id} data-testid={`cat-${c.slug}`} className={`${isChild ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className={`flex flex-wrap items-center gap-3 py-3 ${!c.is_active ? 'opacity-60' : ''}`}>
          <div className="flex flex-col">
            <button type="button" aria-label={`Subir ${c.name}`} disabled={readOnly || index === 0 || !!busy} onClick={() => move(c, -1)} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 leading-none">▲</button>
            <button type="button" aria-label={`Bajar ${c.name}`} disabled={readOnly || index === total - 1 || !!busy} onClick={() => move(c, 1)} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 leading-none">▼</button>
          </div>

          {editing ? (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input aria-label="Nombre" className={INPUT} value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
              <input
                aria-label="Slug"
                className={INPUT}
                value={edit.slug}
                disabled={c.product_count > 0}
                title={c.product_count > 0 ? 'No se puede cambiar el slug de una categoría con productos' : undefined}
                onChange={e => setEdit({ ...edit, slug: toSlug(e.target.value) })}
              />
              <select aria-label="Categoría padre" className={INPUT} value={edit.parent_id} disabled={c.children_count > 0} onChange={e => setEdit({ ...edit, parent_id: e.target.value })}>
                <option value="">— Categoría principal —</option>
                {roots.filter(r => r.id !== c.id).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <input aria-label="Descripción" className={INPUT} value={edit.description} placeholder="Descripción (opcional)" onChange={e => setEdit({ ...edit, description: e.target.value })} />
            </div>
          ) : (
            <div className="flex-1 min-w-[12rem]">
              <p className="text-sm font-semibold text-gray-900">
                {c.name}
                {!c.is_active && <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-800 text-white rounded">Oculta</span>}
                {parentInactive && c.is_active && <span className="ml-2 text-xs text-amber-600">(no visible: su categoría principal está oculta)</span>}
              </p>
              <p className="text-xs text-gray-400">/{c.slug} · {c.product_count} producto{c.product_count === 1 ? '' : 's'}{!isChild && c.children_count > 0 ? ` · ${c.children_count} subcategoría${c.children_count === 1 ? '' : 's'}` : ''}</p>
            </div>
          )}

          <div className="flex items-center gap-1">
            {editing ? (
              <>
                <button type="button" disabled={!!busy || !edit.name.trim()} onClick={() => saveEdit(c)} className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Guardar</button>
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              </>
            ) : (
              <>
                <button type="button" disabled={readOnly || !!busy} onClick={() => startEdit(c)} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Editar</button>
                <button type="button" disabled={readOnly || !!busy} onClick={() => toggleActive(c)} className={`px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-50 ${c.is_active ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}>
                  {c.is_active ? '🙈 Ocultar' : '👁 Mostrar'}
                </button>
                <button
                  type="button"
                  disabled={readOnly || !!busy || !!blocked}
                  title={blocked ?? 'Eliminar'}
                  aria-label={`Eliminar ${c.name}`}
                  onClick={() => remove(c)}
                  className="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Las categorías visibles aparecen en el catálogo en este orden. Las subcategorías se muestran dentro de su categoría principal.
          </p>
        </div>

        {readOnly && !loading && (
          <div className="px-4 py-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
            Falta aplicar la migración de categorías en la base de datos. Se muestran las categorías actuales del sitio en modo solo lectura.
          </div>
        )}

        <form onSubmit={create} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
          <label className="text-xs text-gray-500 sm:col-span-2">Nombre
            <input className={INPUT} value={draft.name} disabled={readOnly} placeholder="Ej: Timbres de madera"
              onChange={e => setDraft(d => ({ ...d, name: e.target.value, slug: d.slugTouched ? d.slug : toSlug(e.target.value) }))} />
          </label>
          <label className="text-xs text-gray-500">Slug
            <input className={INPUT} value={draft.slug} disabled={readOnly}
              onChange={e => setDraft(d => ({ ...d, slug: toSlug(e.target.value), slugTouched: true }))} />
          </label>
          <label className="text-xs text-gray-500">Dentro de
            <select className={INPUT} value={draft.parent_id} disabled={readOnly} onChange={e => setDraft(d => ({ ...d, parent_id: e.target.value }))}>
              <option value="">— Categoría principal —</option>
              {roots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <button type="submit" disabled={readOnly || !!busy || !draft.name.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {busy === 'create' ? 'Creando…' : '+ Crear'}
          </button>
        </form>

        <div className="bg-white rounded-xl border border-gray-200 px-4">
          {loading ? (
            <p className="py-6 text-sm text-gray-400">Cargando…</p>
          ) : tree.length === 0 ? (
            <p className="py-6 text-sm text-gray-400">No hay categorías.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tree.map((root, i) => (
                <li key={root.id}>
                  <ul>
                    {row(root, false, i, tree.length)}
                    {root.children.map((child, j) => row(child as CategoryWithCount, true, j, root.children.length))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </AdminLayout>
  );
}
