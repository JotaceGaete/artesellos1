# Artesellos - Tienda Online de Timbres Personalizados

Una tienda online moderna y responsiva para timbres personalizados, construida con Next.js 14, App Router y TailwindCSS.

## 🚀 Características

- **Next.js 14** con App Router
- **TailwindCSS** para estilos modernos y responsivos
- **TypeScript** para desarrollo seguro
- **Componentes modulares** y reutilizables
- **Carrito de compras** funcional
- **Datos mockeados** preparados para WooCommerce
- **SEO optimizado** con metadatos dinámicos
- **Diseño responsivo** para todos los dispositivos

## 📁 Estructura del Proyecto

```
artesellosapp/
├── src/
│   ├── app/                    # Páginas de Next.js (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página de inicio
│   │   ├── producto/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Página de producto individual
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes reutilizables
│   │   ├── Header.tsx         # Cabecera con navegación
│   │   ├── Footer.tsx         # Pie de página
│   │   ├── ProductCard.tsx    # Tarjeta de producto
│   │   └── ProductGrid.tsx    # Cuadrícula de productos
│   ├── lib/                   # Utilidades y configuración
│   │   ├── woocommerce.ts     # Simulación API de WooCommerce
│   │   ├── mockData.ts        # Datos de ejemplo
│   │   └── cartContext.tsx    # Contexto del carrito
│   └── types/                 # Definiciones TypeScript
│       └── product.ts         # Tipos de productos y carrito
├── public/                    # Archivos estáticos
└── package.json               # Dependencias
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd artesellosapp
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🛒 Funcionalidades Implementadas

### ✅ Completado

- **Layout principal** con header, navegación y footer
- **Página de inicio** con hero section, productos destacados y categorías
- **Componentes de productos** (ProductCard, ProductGrid)
- **Página de producto individual** con detalles completos
- **Carrito de compras** funcional con contexto global
- **Datos mockeados** que simulan la API de WooCommerce
- **Diseño responsivo** para móvil, tablet y desktop
- **SEO básico** con metadatos dinámicos

### 🔄 Preparado para Futuro

- **Integración con WooCommerce** - API simulada lista para conexión real
- **Autenticación WooCommerce** - preparada para tokens y claves API
- **Páginas adicionales** - categorías, búsqueda, carrito completo
- **Sistema de pagos** - estructura preparada para integración

## 🔧 Conexión con WooCommerce

### Configuración de la API

Para conectar con WooCommerce, actualiza las variables de entorno en `.env.local`:

```env
NEXT_PUBLIC_WOOCOMMERCE_URL=https://tu-sitio-wordpress.com
WOOCOMMERCE_CONSUMER_KEY=tu_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=tu_consumer_secret
```

### Endpoints Utilizados

La aplicación está preparada para consumir estos endpoints de WooCommerce:

- `GET /wp-json/wc/v3/products` - Lista de productos
- `GET /wp-json/wc/v3/products/{id}` - Producto individual
- `GET /wp-json/wc/v3/products/categories` - Categorías
- `POST /wp-json/wc/v3/orders` - Crear pedidos (futuro)

### Simulación Actual

Actualmente, `src/lib/woocommerce.ts` simula estas llamadas con datos mockeados. Para activar la integración real:

1. Actualiza `WooCommerceAPI` para hacer llamadas HTTP reales
2. Implementa manejo de errores de API
3. Agrega autenticación con tokens

## 🎨 Personalización

### Colores y Tema

Los colores principales están definidos en TailwindCSS:
- **Primario**: Indigo (`indigo-600`)
- **Secundario**: Purple (`purple-600`)
- **Fondo**: Gray (`gray-50`, `gray-100`)

### Fuentes

- **Principal**: Inter (Google Fonts)
- **Variable CSS**: `--font-inter`

## 📱 Responsive Design

La aplicación está optimizada para:
- **Móvil**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otros Proveedores

Asegúrate de que el servidor soporte:
- Node.js 18+
- Variables de entorno
- Funciones server-side (Next.js)

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Servidor de producción
npm run lint     # Ejecutar ESLint
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para preguntas o soporte técnico, contacta al equipo de desarrollo.

---

¡Gracias por elegir Artesellos para tu tienda de timbres personalizados! 🎨✨