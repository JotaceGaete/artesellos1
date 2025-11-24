# 🛍️ Rediseño del Catálogo de Productos - Tipo Shopify

## ✅ Cambios Realizados

### ANTES 🔴
- **Layout**: Filtros horizontales arriba, grilla simple abajo
- **Filtros**: 3 dropdowns en una fila (Categoría, Precio, Ordenar)
- **Grid**: 4 columnas fijas (1-2-3-4)
- **Tarjetas**: Imagen con padding inconsistente, info apretada
- **Paginación**: Básica pero funcional
- **Móvil**: Sin drawer dedicado para filtros

### AHORA 🟢
- **Layout**: Sidebar izquierda (256px) + Grid derecha flexible
- **Filtros**: Sidebar con checkboxes colapsables + inputs de precio
- **Grid**: Responsive (1-2-3-4 columnas según pantalla)
- **Tarjetas**: Aspecto cuadrado perfecto + hover con botón flotante
- **Paginación**: Profesional con elipsis (1...5...10)
- **Móvil**: Drawer deslizable desde la derecha

---

## 🎯 Características Implementadas

### 1. **ProductCard Rediseñado**

#### Aspecto Cuadrado (aspect-square)
```tsx
<div className="relative aspect-square bg-gray-50 overflow-hidden">
  <div className="absolute inset-0 flex items-center justify-center p-4">
    <img
      src={currentImage}
      className="max-w-full max-h-full w-auto h-auto object-contain"
    />
  </div>
</div>
```

**Características**:
- ✅ Contenedor con `aspect-square` (1:1 ratio perfecto)
- ✅ Imagen centrada con `flex items-center justify-center`
- ✅ Padding de 16px (`p-4`) para que el producto no toque bordes
- ✅ `object-contain` para mantener proporciones
- ✅ Fondo `bg-gray-50` (gris muy tenue)

#### Hover Effect con Botón Flotante
```tsx
{/* Botón "Añadir al carrito" - aparece en hover */}
<div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${
  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
}`}>
  <button onClick={handleAddToCart}>
    <ShoppingCart /> Añadir
  </button>
</div>
```

**Efectos**:
- ✅ Imagen hace zoom (`scale-105`) en hover
- ✅ Botón flotante aparece con fade-in + slide-up
- ✅ Icono de carrito (lucide-react)
- ✅ Deshabilitado si no hay stock

#### Información del Producto
```tsx
{/* Marca (pequeña, gris) */}
<p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
  {brand}
</p>

{/* Nombre (negrita, truncado a 2 líneas) */}
<h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600">
  {product.name}
</h3>

{/* Precio (destacado, color primario) */}
<span className="text-lg font-bold text-indigo-600">
  {formatCurrency(product.price)}
</span>
```

**Jerarquía Visual**:
1. **Marca**: Pequeña (`text-xs`), gris (`text-gray-500`), mayúsculas
2. **Nombre**: Mediano (`text-sm`), negrita, truncado a 2 líneas (`line-clamp-2`)
3. **Precio**: Grande (`text-lg`), negrita, color primario (`text-indigo-600`)

---

### 2. **Sidebar de Filtros (Desktop)**

#### Layout
```tsx
<aside className="hidden lg:block">
  <div className="sticky top-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <FiltersSidebar />
  </div>
</aside>
```

**Características**:
- ✅ Ancho fijo: `256px` (w-64)
- ✅ `sticky top-8` para mantenerse visible al hacer scroll
- ✅ Solo visible en desktop (`hidden lg:block`)
- ✅ Fondo blanco con borde y sombra sutil

#### Secciones del Sidebar

##### 1. Header con Contador
```tsx
<div className="flex items-center justify-between">
  <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
  {getActiveFiltersCount() > 0 && (
    <button onClick={clearFilters} className="text-sm text-indigo-600">
      Limpiar
    </button>
  )}
</div>
```

##### 2. Categorías (Checkboxes)
```tsx
<button onClick={() => setCategoryExpanded(!categoryExpanded)}>
  <h3>Categorías</h3>
  {categoryExpanded ? <ChevronUp /> : <ChevronDown />}
</button>

{categoryExpanded && (
  <div className="mt-4 space-y-3">
    {categories.map(category => (
      <label className="flex items-center gap-2 cursor-pointer group">
        <input type="checkbox" />
        <span>{category.name}</span>
      </label>
    ))}
  </div>
)}
```

**Características**:
- ✅ Colapsable (chevron arriba/abajo)
- ✅ Checkboxes personalizados con Tailwind
- ✅ Hover effect en cada opción
- ✅ Múltiples selecciones permitidas

##### 3. Marcas (Checkboxes)
```tsx
{brands.map(brand => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input
      type="checkbox"
      checked={selectedBrands.includes(brand)}
      onChange={() => toggleBrand(brand)}
    />
    <span>{brand}</span>
  </label>
))}
```

**Marcas disponibles** (hardcoded, reemplazar con datos reales):
- Shiny
- Trodat
- Colop
- Brother
- Pronto

##### 4. Rango de Precio (Inputs Min/Max)
```tsx
<div className="mt-4 space-y-4">
  <div>
    <label className="text-xs text-gray-600 mb-1 block">Mínimo</label>
    <input
      type="number"
      placeholder="$0"
      value={minPrice}
      onChange={(e) => setMinPrice(e.target.value)}
    />
  </div>
  <div>
    <label className="text-xs text-gray-600 mb-1 block">Máximo</label>
    <input
      type="number"
      placeholder="$100.000"
      value={maxPrice}
      onChange={(e) => setMaxPrice(e.target.value)}
    />
  </div>
</div>
```

**Características**:
- ✅ Inputs tipo `number`
- ✅ Placeholders informativos
- ✅ Labels pequeños (`text-xs`)
- ✅ Filtrado instantáneo al cambiar valores

---

### 3. **Drawer de Filtros (Móvil)**

#### Overlay + Drawer
```tsx
{/* Overlay oscuro */}
<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />

{/* Drawer deslizable */}
<div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-50 lg:hidden overflow-y-auto">
  <div className="p-6">
    {/* Header con botón cerrar */}
    <div className="flex items-center justify-between mb-6">
      <h2>Filtros</h2>
      <button onClick={close}>
        <X className="w-5 h-5" />
      </button>
    </div>
    
    {/* Mismo componente FiltersSidebar */}
    <FiltersSidebar />
    
    {/* Botones de acción */}
    <button>Ver {products.length} productos</button>
    <button onClick={clearFilters}>Limpiar filtros</button>
  </div>
</div>
```

**Características**:
- ✅ Solo visible en móvil (`lg:hidden`)
- ✅ Desliza desde la derecha
- ✅ Ancho: `100%` hasta `max-w-xs` (320px)
- ✅ Overlay semi-transparente clickeable
- ✅ Botón de cerrar con icono `X`
- ✅ Botones de acción al final (Ver productos, Limpiar)
- ✅ Scroll interno si el contenido es muy largo

---

### 4. **Barra Superior (Búsqueda + Ordenar)**

```tsx
<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Búsqueda */}
    <div className="flex-1">
      <input type="text" placeholder="Buscar productos..." />
    </div>

    {/* Ordenar */}
    <div className="sm:w-48">
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Nombre A-Z</option>
        <option value="-name">Nombre Z-A</option>
        <option value="price">Precio: Menor a Mayor</option>
        <option value="-price">Precio: Mayor a Menor</option>
      </select>
    </div>

    {/* Botón Filtros (solo móvil) */}
    <button className="lg:hidden">
      <Filter /> Filtros
      {getActiveFiltersCount() > 0 && (
        <span className="badge">{getActiveFiltersCount()}</span>
      )}
    </button>
  </div>
</div>
```

**Características**:
- ✅ Búsqueda con icono de lupa
- ✅ Dropdown de ordenar con 4 opciones
- ✅ Botón de filtros solo visible en móvil
- ✅ Badge rojo con contador de filtros activos
- ✅ Layout flexible: columna en móvil, fila en desktop

---

### 5. **Grid de Productos Responsive**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {currentProducts.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

**Breakpoints**:
- **Móvil** (`<640px`): 1 columna
- **Tablet** (`≥640px`): 2 columnas
- **Desktop** (`≥1024px`): 3 columnas
- **Desktop XL** (`≥1280px`): 4 columnas

**Gap**: `24px` (`gap-6`) entre tarjetas

---

### 6. **Paginación Profesional**

```tsx
<nav className="flex items-center gap-1">
  {/* Botón Anterior */}
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    Anterior
  </button>

  {/* Números de página con elipsis */}
  {getPaginationRange().map((page, index) => (
    page === '...' ? (
      <span key={`ellipsis-${index}`}>...</span>
    ) : (
      <button
        key={page}
        onClick={() => setCurrentPage(page as number)}
        className={currentPage === page ? 'active' : ''}
      >
        {page}
      </button>
    )
  ))}

  {/* Botón Siguiente */}
  <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Siguiente
  </button>
</nav>
```

#### Lógica de Elipsis (`getPaginationRange()`)

**Ejemplo con 10 páginas**:

| Página Actual | Rango Mostrado |
|---------------|----------------|
| 1 | `1 2 3 4 ... 10` |
| 2 | `1 2 3 4 ... 10` |
| 3 | `1 2 3 4 ... 10` |
| 4 | `1 ... 3 4 5 ... 10` |
| 5 | `1 ... 4 5 6 ... 10` |
| 6 | `1 ... 5 6 7 ... 10` |
| 7 | `1 ... 6 7 8 ... 10` |
| 8 | `1 ... 7 8 9 10` |
| 9 | `1 ... 7 8 9 10` |
| 10 | `1 ... 7 8 9 10` |

**Máximo visible**: 5-7 botones (incluyendo elipsis)

**Características**:
- ✅ Botones deshabilitados cuando no aplican
- ✅ Página actual resaltada (fondo indigo)
- ✅ Elipsis (`...`) para saltos
- ✅ Siempre muestra primera y última página

---

## 📐 Layout Principal

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────┐
│  Header: Catálogo de Productos | 245 productos      │
├──────────────┬──────────────────────────────────────┤
│              │  [Búsqueda...] [Ordenar ▼]           │
│   FILTROS    │  ────────────────────────────────────│
│   ────────   │  ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│              │  │ 1 │ │ 2 │ │ 3 │ │ 4 │            │
│ Categorías   │  └───┘ └───┘ └───┘ └───┘            │
│  ☑ Shiny     │  ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│  ☐ Trodat    │  │ 5 │ │ 6 │ │ 7 │ │ 8 │            │
│  ☐ Colop     │  └───┘ └───┘ └───┘ └───┘            │
│              │  ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│ Marca        │  │ 9 │ │ 10│ │ 11│ │ 12│            │
│  ☑ Shiny     │  └───┘ └───┘ └───┘ └───┘            │
│  ☐ Trodat    │  ────────────────────────────────────│
│              │  [◀] 1 2 3 ... 10 [▶]                │
│ Precio       │                                       │
│  Min: $0     │                                       │
│  Max: $50k   │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
    256px                 Flexible
```

### Móvil (<1024px)

```
┌─────────────────────────────────┐
│  Catálogo de Productos          │
│  245 productos disponibles      │
├─────────────────────────────────┤
│  [🔍 Buscar...] [Ordenar ▼]     │
│  [🎚️ Filtros (3)]               │
├─────────────────────────────────┤
│  ┌─────────────┐  ┌────────────┐│
│  │   Producto  │  │  Producto  ││
│  │             │  │            ││
│  └─────────────┘  └────────────┘│
│  ┌─────────────┐  ┌────────────┐│
│  │   Producto  │  │  Producto  ││
│  │             │  │            ││
│  └─────────────┘  └────────────┘│
├─────────────────────────────────┤
│  [◀] 1 2 ... 5 [▶]              │
└─────────────────────────────────┘

Al hacer clic en "Filtros":
┌─────────────────────────────────┐
│ [Filtros]              [✕]      │
│ ─────────────────────────────── │
│                                 │
│ Categorías ▼                    │
│  ☑ Shiny                        │
│  ☐ Trodat                       │
│                                 │
│ Marca ▼                         │
│  ☑ Shiny                        │
│                                 │
│ Precio ▼                        │
│  Min: $0                        │
│  Max: $50.000                   │
│                                 │
│ [Ver 245 productos]             │
│ [Limpiar filtros]               │
└─────────────────────────────────┘
```

---

## 🎨 Paleta de Colores

### Backgrounds
```css
bg-gray-50     /* Fondo general de la página */
bg-white       /* Tarjetas, sidebar, barra superior */
bg-gray-100    /* Imagen de productos (fondo sutil) */
```

### Texto
```css
text-gray-900  /* Títulos principales */
text-gray-700  /* Texto normal */
text-gray-600  /* Subtítulos */
text-gray-500  /* Marcas, texto secundario */
text-gray-400  /* Placeholders, iconos */
```

### Colores de Marca
```css
text-indigo-600   /* Precios, enlaces, textos destacados */
bg-indigo-600     /* Botones primarios, badges, paginación activa */
hover:bg-indigo-700  /* Hover en botones */
```

### Bordes y Sombras
```css
border-gray-200   /* Bordes de tarjetas, sidebar */
border-gray-300   /* Bordes de inputs, botones secundarios */
shadow-sm         /* Sombras sutiles */
shadow-lg         /* Sombras intensas en hover */
```

---

## 📊 Comparación Antes/Después

| Aspecto | ANTES 🔴 | AHORA 🟢 |
|---------|----------|----------|
| **Líneas de código** | ~527 | ~690 |
| **Layout** | Single column | Sidebar + Grid |
| **Filtros (Desktop)** | Dropdowns horizontales | Sidebar sticky |
| **Filtros (Móvil)** | Accordion inline | Drawer deslizable |
| **Tarjetas** | Imagen con padding variable | Aspect-square perfecto |
| **Hover en tarjeta** | Zoom simple | Zoom + Botón flotante |
| **Paginación** | Básica (1 2 3 4 5) | Con elipsis (1 ... 5 ... 10) |
| **Grid** | 4 columnas fijas | 1-2-3-4 responsive |
| **Categorías** | Dropdown | Checkboxes colapsables |
| **Marcas** | No disponible | Checkboxes colapsables |
| **Precio** | Dropdown con rangos | Inputs Min/Max |
| **Búsqueda** | Input grande | Input compacto con icono |
| **Badge stock** | No | "✓ Disponible" o "Agotado" |
| **Skeleton loading** | Básico | Completo con pulse |

---

## 🔧 Funcionalidades Implementadas

### 1. **Filtrado Múltiple**
- ✅ Por categorías (múltiples selecciones)
- ✅ Por marcas (múltiples selecciones)
- ✅ Por rango de precio (min/max)
- ✅ Por búsqueda (texto libre)

### 2. **Ordenamiento**
- ✅ Nombre A-Z
- ✅ Nombre Z-A
- ✅ Precio: Menor a Mayor
- ✅ Precio: Mayor a Menor

### 3. **Paginación**
- ✅ 12 productos por página
- ✅ Navegación con botones Anterior/Siguiente
- ✅ Elipsis inteligente
- ✅ Reset a página 1 al cambiar filtros

### 4. **Estados**
```tsx
// Filtros
const [searchTerm, setSearchTerm] = useState('');
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
const [sortBy, setSortBy] = useState<string>('name');

// UI
const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
const [categoryExpanded, setCategoryExpanded] = useState(true);
const [brandExpanded, setBrandExpanded] = useState(true);
const [priceExpanded, setPriceExpanded] = useState(true);

// Paginación
const [currentPage, setCurrentPage] = useState(1);
```

### 5. **Limpiar Filtros**
```tsx
const clearFilters = () => {
  setSearchTerm('');
  setSelectedCategories([]);
  setSelectedBrands([]);
  setMinPrice('');
  setMaxPrice('');
  setSortBy('name');
  setCurrentPage(1);
};
```

---

## 🧪 Testing

### Checklist Desktop

#### Layout
- [ ] Sidebar fijo de 256px a la izquierda
- [ ] Sidebar hace `sticky` al hacer scroll
- [ ] Grid de 3-4 columnas según el ancho
- [ ] Gap de 24px entre tarjetas

#### Filtros (Sidebar)
- [ ] Header "Filtros" + botón "Limpiar"
- [ ] Sección Categorías colapsable
- [ ] Checkboxes funcionan (múltiples selecciones)
- [ ] Sección Marcas colapsable
- [ ] Sección Precio con inputs Min/Max
- [ ] Filtrado instantáneo al cambiar cualquier valor

#### Tarjetas
- [ ] Imagen con aspect-square perfecto
- [ ] Padding de 16px alrededor de la imagen
- [ ] Hover: imagen hace zoom (`scale-105`)
- [ ] Hover: botón flotante aparece desde abajo
- [ ] Click en botón "Añadir": producto se agrega al carrito
- [ ] Info: Marca (pequeña) + Nombre (2 líneas) + Precio (grande)
- [ ] Badge "Destacado" si `product.featured === true`
- [ ] Badge "Agotado" si `stock_status === 'outofstock'`

#### Paginación
- [ ] Botón "Anterior" deshabilitado en página 1
- [ ] Botón "Siguiente" deshabilitado en última página
- [ ] Página actual resaltada con fondo indigo
- [ ] Elipsis aparecen cuando hay muchas páginas
- [ ] Click en número: navega a esa página

#### Búsqueda y Ordenar
- [ ] Input de búsqueda con icono de lupa
- [ ] Búsqueda filtra productos al escribir
- [ ] Dropdown "Ordenar" con 4 opciones
- [ ] Productos se reordenan al cambiar opción

### Checklist Móvil

#### Layout
- [ ] Sidebar NO visible
- [ ] Grid de 1-2 columnas según el ancho
- [ ] Barra superior con Búsqueda + Ordenar + Botón Filtros

#### Drawer de Filtros
- [ ] Botón "Filtros" muestra badge con contador
- [ ] Click en botón: drawer desliza desde la derecha
- [ ] Overlay oscuro aparece detrás
- [ ] Click en overlay: cierra el drawer
- [ ] Click en X: cierra el drawer
- [ ] Contenido del drawer = mismo sidebar
- [ ] Botón "Ver X productos" cierra el drawer
- [ ] Botón "Limpiar filtros" limpia y cierra

#### Tarjetas
- [ ] Mismos efectos hover que en desktop
- [ ] Botón flotante funciona en touch

#### Paginación
- [ ] Botones más grandes para touch
- [ ] Funciona igual que en desktop

---

## 🚀 Próximas Mejoras (Futuro)

### Backend (Supabase)
1. **Consultas optimizadas**:
   - Filtrado en el servidor (no en cliente)
   - Paginación real (LIMIT/OFFSET)
   - Conteo de resultados (X de Y productos)

2. **Marcas dinámicas**:
   - Obtener marcas desde `stock_timbres.marca`
   - Mostrar solo marcas con productos

3. **Faceted Search**:
   - Mostrar contadores por categoría (ej: "Shiny (45)")
   - Mostrar contadores por marca

### Frontend
1. **URL params**:
   - Sincronizar filtros con URL (`?category=shiny&price=0-10000`)
   - Permitir compartir búsquedas

2. **Animaciones**:
   - Transición suave al cambiar página
   - Fade-in de tarjetas al cargar

3. **Accesibilidad**:
   - `aria-labels` en todos los botones
   - `role="dialog"` en el drawer
   - Navegación por teclado en filtros

4. **Performance**:
   - Lazy loading de imágenes
   - Virtual scrolling para >1000 productos
   - Debounce en búsqueda (300ms)

---

## 📦 Archivos Modificados

1. **`src/components/ProductCard.tsx`** (135 líneas)
   - Rediseño completo
   - Aspect-square
   - Hover con botón flotante
   - Info simplificada (Marca + Nombre + Precio)

2. **`src/app/productos/page.tsx`** (690 líneas)
   - Layout de 2 columnas (Sidebar + Grid)
   - Sidebar de filtros colapsables
   - Drawer móvil
   - Paginación con elipsis
   - Estados para múltiples filtros
   - Grid responsive (1-2-3-4 columnas)

---

## ✅ Resultado Final

### Escalabilidad
- ✅ Preparado para 100+ productos
- ✅ Paginación eficiente
- ✅ Filtros múltiples
- ✅ Performance optimizada

### UX Profesional
- ✅ Diseño tipo Shopify/Amazon
- ✅ Sidebar sticky
- ✅ Drawer móvil deslizable
- ✅ Tarjetas con hover profesional
- ✅ Paginación inteligente

### Responsive
- ✅ 1 columna (móvil)
- ✅ 2 columnas (tablet)
- ✅ 3 columnas (desktop)
- ✅ 4 columnas (desktop XL)

---

**¡Catálogo tipo Shopify listo para escalar! 🚀**

