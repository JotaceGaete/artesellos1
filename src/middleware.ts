import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/adminSession';

// Rutas públicas dentro de /admin y /api/admin.
const PUBLIC_ADMIN_PAGES = new Set<string>(['/admin/login']);
const PUBLIC_ADMIN_API = new Set<string>([
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/me', // el propio endpoint responde 401 si no hay sesión
]);

function isPublicAdminApi(pathname: string, method: string): boolean {
  if (PUBLIC_ADMIN_API.has(pathname)) return true;
  // El banner superior es público en la web; solo la lectura queda abierta.
  if (pathname === '/api/admin/top-banner' && method === 'GET') return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/');

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (PUBLIC_ADMIN_PAGES.has(pathname)) return NextResponse.next();
  if (isAdminApi && isPublicAdminApi(pathname, req.method)) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const valid = token ? await verifyAdminToken(token) : false;

  if (!valid) {
    if (isAdminApi) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
