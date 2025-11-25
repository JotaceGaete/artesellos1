'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/productos/nuevo', label: 'Nuevo producto' },
  { href: '/admin/slider', label: 'Slider' },
  { href: '/admin/top-banner', label: 'Top banner' },
  { href: '/admin/knowledge-base', label: 'Base de Conocimiento' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:block w-56 shrink-0 border-r bg-white">
      <nav className="p-4 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + '/')
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


