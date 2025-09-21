'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { useFavorites } from '@/lib/favoritesContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const { favorites } = useFavorites();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-indigo-600">
                Artesellos
              </div>
              <span className="ml-2 text-sm text-gray-500 hidden sm:block">
                Timbres Personalizados
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Todos los Productos
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Servicios
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  href="/diseno-personalizado"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Diseño Personalizado
                </Link>
                <Link
                  href="/cotizaciones"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cotizaciones
                </Link>
                <Link
                  href="/registro-comercios"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Registro Mayorista
                </Link>
                <Link
                  href="/seguimiento"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Seguimiento
                </Link>
              </div>
            </div>
            <Link
              href="/sobre-nosotros"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/contacto"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            <Link href="/favoritos" className="relative">
              <svg className="w-6 h-6 text-gray-700 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {favorites.items.length > 99 ? '99+' : favorites.items.length}
                </span>
              )}
            </Link>
            {/* Search */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cart */}
            <Link href="/carrito" className="relative">
              <svg className="w-6 h-6 text-gray-700 hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M9 19a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              {cart.item_count > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {cart.item_count > 99 ? '99+' : cart.item_count}
                </span>
              )}
            </Link>


            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

                    {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top duration-300">
                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/productos"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Productos
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Servicios
                  </div>
                  <Link
                    href="/diseno-personalizado"
                    className="text-gray-700 hover:text-indigo-600 px-6 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Diseño Personalizado
                  </Link>
                  <Link
                    href="/cotizaciones"
                    className="text-gray-700 hover:text-indigo-600 px-6 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cotizaciones
                  </Link>
                  <Link
                    href="/registro-comercios"
                    className="text-gray-700 hover:text-indigo-600 px-6 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registro Mayorista
                  </Link>
                  <Link
                    href="/seguimiento"
                    className="text-gray-700 hover:text-indigo-600 px-6 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seguimiento
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    href="/sobre-nosotros"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sobre Nosotros
                  </Link>
                  <Link
                    href="/contacto"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contacto
                  </Link>
                  <Link
                    href="/terminos"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Términos y Condiciones
                  </Link>
                </nav>

            {/* Mobile Search */}
            <div className="mt-4 px-3">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
