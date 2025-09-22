# Variables de Entorno para Cloudflare Pages

## 🔧 Configuración Requerida

Para que tu aplicación funcione en Cloudflare Pages, debes configurar las siguientes variables de entorno en el panel de control de Cloudflare Pages:

### 📋 Variables a Configurar:

#### 1. NEXT_PUBLIC_SUPABASE_URL
- **Nombre**: `NEXT_PUBLIC_SUPABASE_URL`
- **Valor**: `https://ueannxyewstuptivnzjf.supabase.co`
- **Entorno**: Production (y Preview si quieres)

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Nombre**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Valor**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlYW5ueHlld3N0dXB0aXZuempmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjY4MzksImV4cCI6MjA3MjMwMjgzOX0.dhcH6n7VapQYSD90XO7haC5TVB0_ugFJJzyrF3AKHuU`
- **Entorno**: Production (y Preview si quieres)

### 🎯 Pasos para Configurar:

1. Ve a tu proyecto en [Cloudflare Pages](https://dash.cloudflare.com/)
2. Selecciona tu proyecto `artesellos-ecommerce`
3. Ve a **Settings** → **Environment variables**
4. Haz clic en **Add variable**
5. Agrega cada variable con el nombre y valor correspondiente
6. Selecciona **Production** (y **Preview** si quieres)
7. Haz clic en **Save**

### ✅ Verificación:

Después de configurar las variables:
1. Ve a **Deployments**
2. Haz clic en **Retry deployment** en el último deployment
3. O haz un nuevo commit para forzar un nuevo deployment

### 🔍 Archivos que usan estas variables:

- `src/lib/supabase.ts`
- `src/lib/supabaseServer.ts`
- `src/app/mi-producto/page.tsx`
- `src/app/mi-tienda/page.tsx`
- `src/app/producto-real/page.tsx`
- `src/app/test-connection/page.tsx`
- `src/app/test-env/page.tsx`
- `src/app/api/test-supabase/route.ts`

### ⚠️ Importante:

- Las variables que empiezan con `NEXT_PUBLIC_` son públicas y se incluyen en el bundle del cliente
- Asegúrate de que la URL y la clave anónima sean correctas
- La clave anónima es segura para usar en el cliente
