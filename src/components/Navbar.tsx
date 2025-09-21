'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cartContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const { cart } = useCart()
  const [showToast, setShowToast] = useState(false)
  const prevCount = useRef(cart.item_count)

  const formatCLP = (n?: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0)

  useEffect(() => {
    if (cart.item_count > prevCount.current) {
      setShowToast(true)
      const t = setTimeout(() => setShowToast(false), 2200)
      return () => clearTimeout(t)
    }
    prevCount.current = cart.item_count
  }, [cart.item_count])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (query) {
      router.push(`/productos?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/productos')
    }
    setSearchQuery('')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Productos' },
    { href: '/contacto', label: 'Contacto' }
  ]


  return (
    <>
      <nav className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo (futuro: imagen) */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
                {/* Placeholder de logo; reemplazar por <img src="/logo.svg" ... /> */}
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">A</div>
                <span className="text-xl font-bold text-gray-900">Artesellos</span>
                <span className="hidden sm:block text-xs text-gray-500">Timbres Personalizados</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 text-sm font-semibold relative transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-gray-900 after:absolute after:bottom-[-6px] after:left-4 after:right-4 after:h-[2px] after:bg-indigo-600 after:rounded-full'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              </div>
              
              {/* Servicios eliminado */}
            </div>

            {/* Buscador Desktop */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos…"
                  className="w-64 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Buscar"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Iconos y Botón Login */}
            <div className="flex items-center space-x-3">
              {/* Carrito */}
              <Link
                href="/checkout"
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Carrito"
                title="Carrito"
              >
                <ShoppingCart className="w-5 h-5 transition-colors" />
                {cart.item_count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[11px] leading-[18px] text-white bg-indigo-600 rounded-full text-center px-[4px]">
                    {cart.item_count}
                  </span>
                )}
              </Link>

              {/* Botón Iniciar Sesión */}
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-900 rounded-xl hover:scale-105 hover:shadow-sm transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Iniciar Sesión
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Menú"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Toast de carrito */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border shadow-lg rounded-lg px-4 py-3">
          <div className="text-sm text-gray-800">
            Agregado al carrito • {cart.item_count} item{cart.item_count !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-600">Total: {formatCLP(cart.total)}</div>
          <div className="mt-2 text-right">
            <Link href="/checkout" className="text-xs font-medium text-indigo-600 hover:underline">Ver carrito</Link>
          </div>
        </div>
      )}
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
            
            {/* Buscador Mobile */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos…"
                className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block py-2 text-sm transition-colors ${
                    isActiveLink(link.href)
                      ? 'font-medium text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Servicios eliminado en mobile */}
            </div>

            {/* Botón Iniciar Sesión Mobile */}
            <Link
              href="/login"
              onClick={closeMenu}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
