'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => { if (res.ok) router.replace('/admin'); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Contraseña incorrecta');
        setPassword('');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Verificando...' : 'Entrar al panel'}
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
