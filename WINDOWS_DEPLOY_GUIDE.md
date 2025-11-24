# 🪟 Guía de Deploy en Windows para Cloudflare Pages

## ⚠️ Problema Identificado

`@cloudflare/next-on-pages` tiene problemas conocidos en Windows. El error específico:

```
SHELLAC COMMAND FAILED!
Executing: npm --version
```

Esto ocurre porque la herramienta no puede ejecutar comandos de shell correctamente en Windows.

## ✅ Soluciones Disponibles

### Opción 1: Deploy Manual desde Cloudflare Dashboard (MÁS RÁPIDO)

Esta es la forma más simple y confiable para Windows:

#### Paso 1: Crear el Build de Next.js

```bash
npm run build
```

✅ **Ya completado exitosamente**

#### Paso 2: Subir a Cloudflare Pages

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Workers & Pages** > **Create application** > **Pages**
3. Selecciona **Upload assets**
4. Arrastra la carpeta `.next` completa O crea un ZIP con:
   - `.next/`
   - `public/`
   - `package.json`
   - `next.config.js` (si existe)

#### Paso 3: Configurar el Proyecto

- **Project name:** `artesellos`
- **Production branch:** `main`
- **Build command:** (dejar vacío, ya está compilado)
- **Build output directory:** `.next`

---

### Opción 2: Usar WSL (Windows Subsystem for Linux) - RECOMENDADO

Esta es la solución oficial recomendada por Cloudflare.

#### Instalar WSL

```powershell
# En PowerShell como Administrador
wsl --install
```

Esto instalará Ubuntu por defecto.

#### Configurar el Proyecto en WSL

```bash
# Abrir WSL
wsl

# Navegar al proyecto (Windows drives están en /mnt/)
cd /mnt/c/artesellosapp2/artesellos-ecommerce

# Instalar dependencias (si es necesario)
npm install

# Ejecutar el deploy
npm run deploy
```

**Ventajas:**
- ✅ Funciona exactamente como en Linux/Mac
- ✅ Todos los comandos de Cloudflare funcionan
- ✅ Deploy automático desde la terminal

---

### Opción 3: GitHub Actions (Deploy Automático)

Configura GitHub Actions para que haga el deploy automáticamente cuando hagas push.

#### Crear `.github/workflows/deploy.yml`

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run pages:build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: artesellos
          directory: .vercel/output/static
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

#### Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Añade:
   - `CLOUDFLARE_API_TOKEN`: Tu API token de Cloudflare
   - `CLOUDFLARE_ACCOUNT_ID`: Tu Account ID de Cloudflare

**Ventajas:**
- ✅ Deploy automático con cada push
- ✅ No necesitas configurar nada en tu máquina Windows
- ✅ Logs de deploy visibles en GitHub

---

### Opción 4: Usar Vercel (Alternativa)

Si Cloudflare Pages sigue dando problemas, Vercel es una alternativa excelente que funciona perfectamente en Windows:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Ventajas:**
- ✅ Funciona perfectamente en Windows
- ✅ Deploy en segundos
- ✅ Configuración automática de Next.js
- ✅ CDN global

---

## 🎯 Recomendación Final

Para tu caso específico en Windows, te recomiendo:

1. **Corto plazo (HOY):** Usa el **Deploy Manual** desde Cloudflare Dashboard
   - Es rápido y funciona inmediatamente
   - No requiere configuración adicional

2. **Largo plazo:** Configura **GitHub Actions**
   - Deploy automático con cada cambio
   - No depende de tu sistema operativo
   - Más profesional y escalable

3. **Si necesitas deploy frecuente desde terminal:** Usa **WSL**
   - Una vez configurado, funciona perfectamente
   - Experiencia idéntica a Linux/Mac

---

## 📝 Comandos Útiles

```bash
# Build local (funciona en Windows)
npm run build

# Ver el build generado
dir .next

# Limpiar build anterior
Remove-Item -Recurse -Force .next

# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🔗 Enlaces Útiles

- [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [WSL Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Estado:** ✅ Build de Next.js completado exitosamente
**Problema:** ⚠️ `@cloudflare/next-on-pages` no funciona en Windows
**Solución:** ✅ Múltiples alternativas disponibles

