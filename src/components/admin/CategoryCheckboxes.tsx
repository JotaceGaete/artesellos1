'use client';

import { buildCategoryTree, type Category } from '@/lib/categories';

interface Props {
  categories: Category[];
  selected: string[];
  onToggle: (slug: string) => void;
  loading?: boolean;
}

/**
 * Casillas de categorías para la ficha de producto: categorías raíz y, debajo,
 * sus subcategorías. Las ocultas solo aparecen si el producto ya las tiene.
 */
export default function CategoryCheckboxes({ categories, selected, onToggle, loading }: Props) {
  const usable = categories.filter(c => c.is_active || selected.includes(c.slug));
  const tree = buildCategoryTree(usable);
  const known = new Set(categories.map(c => c.slug));
  const orphans = selected.filter(s => !known.has(s));

  const box = (c: Category, child = false) => (
    <label key={c.id} className={`flex items-center gap-2 cursor-pointer select-none ${child ? 'ml-6' : ''}`}>
      <input
        type="checkbox"
        checked={selected.includes(c.slug)}
        onChange={() => onToggle(c.slug)}
        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-700">
        {c.name}
        {!c.is_active && <span className="ml-1 text-xs text-gray-400">(oculta)</span>}
      </span>
    </label>
  );

  if (loading && categories.length === 0) {
    return <p className="text-xs text-gray-400">Cargando categorías…</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {tree.map(root => (
          <div key={root.id} className="space-y-2">
            {box(root)}
            {root.children.map(child => box(child, true))}
          </div>
        ))}
      </div>
      {orphans.length > 0 && (
        <p className="text-xs text-amber-600">
          Categorías que ya no existen: {orphans.join(', ')}. Desmárcalas antes de guardar.
        </p>
      )}
      {orphans.map(s => (
        <label key={s} className="inline-flex items-center gap-2 mr-4">
          <input type="checkbox" checked onChange={() => onToggle(s)} className="w-4 h-4" />
          <span className="text-sm text-gray-500 line-through">{s}</span>
        </label>
      ))}
    </div>
  );
}
