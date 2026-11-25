'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: '⊞ Dashboard', exact: true },
  { href: '/admin/productos', label: '📦 Productos' },
  { href: '/admin/productos/nuevo', label: '➕ Nuevo producto' },
  { href: '/admin/knowledge-base', label: '🧠 Conocimiento' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1">
        {/* Marca */}
        <div className="px-4 py-4 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="p-2 flex-1 space-y-0.5">
          {links.map(l => {
            const active = l.exact
              ? pathname === l.href
              : pathname === l.href || pathname?.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            🌐 Ver sitio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            ↩ Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
