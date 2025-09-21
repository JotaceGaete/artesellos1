import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/productos" className="block p-4 border rounded-lg hover:shadow-sm transition-shadow">
          <div className="font-semibold">Productos</div>
          <div className="text-sm text-gray-500">Listar y administrar productos</div>
        </Link>
        <Link href="/admin/productos/nuevo" className="block p-4 border rounded-lg hover:shadow-sm transition-shadow">
          <div className="font-semibold">Nuevo producto</div>
          <div className="text-sm text-gray-500">Crear un producto desde cero</div>
        </Link>
      </div>
    </div>
  )
}


