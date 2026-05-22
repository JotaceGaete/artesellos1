'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    router.push('/admin/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center">
        <span className="text-sm font-medium">Panel de Administración</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-300 hover:text-white underline"
        >
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  );
}
