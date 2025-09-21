import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabaseServer'
import AdjustStock from '@/components/admin/AdjustStock'
import CategorySelector from '@/components/admin/CategorySelector'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const supabase = createSupabaseAdmin()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const formatCLP = (n?: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n ?? 0
    try {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(num)
    } catch {
      return `${num}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link href="/admin/productos/nuevo" className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-gray-900 rounded-md hover:bg-black">
          Nuevo producto
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error.message}</div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ajustar stock</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categorías</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {(products ?? []).map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.slug}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatCLP(p.price)}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.stock_quantity ?? '-'}</td>
                <td className="px-4 py-2 text-sm">{p.stock_status === 'instock' ? 'En stock' : p.stock_status}</td>
                <td className="px-4 py-2 text-sm">
                  <AdjustStock id={p.id} slug={p.slug} current={p.stock_quantity} />
                </td>
                <td className="px-4 py-2 text-sm">
                  <CategorySelector productId={p.id} initial={(p.categories as string[]) || []} />
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  <div className="flex items-center justify-end space-x-2">
                    <Link href={`/producto/${p.slug}`} className="text-indigo-600 hover:underline text-xs">
                      Ver
                    </Link>
                    <Link href={`/admin/productos/${p.id}`} className="text-blue-600 hover:underline text-xs">
                      Editar
                    </Link>
                    <Link href={`/admin/productos/${p.id}/colores`} className="text-green-600 hover:underline text-xs">
                      Colores
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Sin productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


