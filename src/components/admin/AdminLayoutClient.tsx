'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminProtection from '@/components/AdminProtection';

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminProtection>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}
