'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ADMIN_PASSWORD = 'artesellos2024';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      router.replace('/admin');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      router.push('/admin');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-lg font-semibold text-gray-700 tracking-wide uppercase">Artesellos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900">Artesellos Admin</h1>
            <p className="mt-1.5 text-sm text-gray-500">Acceso exclusivo para administradores</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                placeholder="Ingresa la contraseña"
                autoFocus
                autoComplete="current-password"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Entrar al panel
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
