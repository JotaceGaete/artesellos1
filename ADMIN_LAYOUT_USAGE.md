# 📐 AdminLayout - Panel de Administración

## ✅ Componente Creado

Se ha creado el componente `AdminLayout.tsx` en `src/components/admin/AdminLayout.tsx`

---

## 🎨 Características

### ✅ Requisitos Cumplidos:

1. ✅ **Server Component** - No usa 'use client'
2. ✅ **Acepta children** - Prop para contenido de página
3. ✅ **Layout flex** - Sidebar fijo + contenido principal
4. ✅ **Sidebar fijo** - Ancho 250px (w-64), fondo gris oscuro
5. ✅ **Enlaces de navegación** - Productos, Slider, Top Banner
6. ✅ **Área scrollable** - Contenido principal con scroll

---

## 📋 Estructura

```
┌─────────────────────────────────────────┐
│  Sidebar (250px) │  Contenido Principal │
│  ┌─────────────┐ │  ┌─────────────────┐ │
│  │ Logo        │ │  │                 │ │
│  ├─────────────┤ │  │   {children}    │ │
│  │ Productos   │ │  │                 │ │
│  │ Slider      │ │  │   (scrollable)  │ │
│  │ Top Banner  │ │  │                 │ │
│  ├─────────────┤ │  └─────────────────┘ │
│  │ Volver      │ │                      │
│  └─────────────┘ │                      │
└─────────────────────────────────────────┘
```

---

## 🚀 Uso

### Ejemplo 1: Página de Productos

```tsx
// src/app/admin/productos/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminProductosPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>
        {/* Tu contenido aquí */}
      </div>
    </AdminLayout>
  );
}
```

### Ejemplo 2: Página de Slider

```tsx
// src/app/admin/slider/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSliderPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Slider Principal</h1>
        {/* Tu contenido aquí */}
      </div>
    </AdminLayout>
  );
}
```

### Ejemplo 3: Página de Top Banner

```tsx
// src/app/admin/top-banner/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminTopBannerPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Top Banner</h1>
        {/* Tu contenido aquí */}
      </div>
    </AdminLayout>
  );
}
```

---

## 🎨 Estilos y Diseño

### Sidebar:
- **Ancho**: 250px (w-64)
- **Fondo**: Gris oscuro (bg-gray-800)
- **Texto**: Blanco
- **Posición**: Fija a la izquierda
- **Altura**: 100vh

### Enlaces:
- **Hover**: Fondo gris claro (bg-gray-700)
- **Iconos**: Lucide React (Package, Image, Megaphone)
- **Transiciones**: Suaves (200ms)

### Contenido Principal:
- **Margen izquierdo**: 250px (ml-64) para compensar sidebar fijo
- **Padding**: 32px (p-8)
- **Scroll**: Automático cuando el contenido excede la altura

---

## 🔗 Rutas Configuradas

| Ruta | Descripción | Icono |
|------|-------------|-------|
| `/admin/productos` | Gestión de productos | Package |
| `/admin/slider` | Slider principal | Image |
| `/admin/top-banner` | Top banner | Megaphone |

---

## 🎯 Personalización

### Cambiar Ancho del Sidebar:

```tsx
// En AdminLayout.tsx, cambiar:
<aside className="w-64 ...">  // 250px
// Por:
<aside className="w-48 ...">  // 192px (más estrecho)
// O:
<aside className="w-80 ...">  // 320px (más ancho)
```

### Agregar Más Enlaces:

```tsx
<Link
  href="/admin/nueva-ruta"
  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 group"
>
  <Icono className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
  <span className="font-medium">Nueva Sección</span>
</Link>
```

### Cambiar Colores:

```tsx
// Sidebar más oscuro
<aside className="w-64 bg-gray-900 ...">

// Sidebar con color de marca
<aside className="w-64 bg-indigo-900 ...">
```

---

## 📱 Responsive (Opcional)

Si quieres hacer el sidebar responsive, puedes agregar:

```tsx
// Sidebar oculto en móvil, visible en desktop
<aside className="hidden lg:flex w-64 bg-gray-800 ...">

// Botón hamburguesa para móvil
<button className="lg:hidden fixed top-4 left-4 z-50 ...">
  {/* Menú móvil */}
</button>
```

---

## 🔐 Protección de Rutas

Para proteger las rutas de admin, puedes crear un middleware:

```tsx
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar autenticación
  const isAuthenticated = request.cookies.get('auth-token');
  
  if (request.nextUrl.pathname.startsWith('/admin') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

---

## 📝 Archivos Relacionados

- ✅ `src/components/admin/AdminLayout.tsx` - Componente principal
- 📄 `ADMIN_LAYOUT_USAGE.md` - Esta documentación

---

## 🎉 Listo para Usar

El componente está listo. Solo necesitas:

1. ✅ Crear las páginas en `/admin/productos`, `/admin/slider`, `/admin/top-banner`
2. ✅ Envolver el contenido con `<AdminLayout>`
3. ✅ Personalizar según tus necesidades

---

**Fecha de creación:** 25 de noviembre, 2025  
**Estado:** ✅ Completado y listo para usar  
**Tipo:** Server Component  
**Dependencias:** lucide-react (ya instalado)

