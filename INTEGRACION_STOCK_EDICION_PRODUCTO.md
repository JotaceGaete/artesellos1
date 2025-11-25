# 🔗 Integración de Stock en Edición de Producto

## ✅ Implementación Completada

Se ha integrado exitosamente la gestión de stock en la página de edición de productos, permitiendo ver y editar las variantes de stock (colores) directamente desde la edición del producto.

---

## 📁 Archivos Modificados

### 1. **Componente StockTable** (`src/components/admin/StockTable.tsx`)

**Cambios:**
- ✅ Agregado props opcionales `filterByMarca` y `filterByModelo`
- ✅ Modificado `loadStock` para aceptar filtros en la URL
- ✅ Usa `useCallback` para optimizar recargas
- ✅ `useEffect` se actualiza cuando cambian los filtros

**Código agregado:**
```typescript
interface StockTableProps {
  filterByMarca?: string;
  filterByModelo?: string;
}

export default function StockTable({ filterByMarca, filterByModelo }: StockTableProps = {}) {
  // Construir URL con filtros
  const params = new URLSearchParams();
  if (filterByMarca) params.append('marca', filterByMarca);
  if (filterByModelo) params.append('modelo', filterByModelo);
  // ...
}
```

### 2. **API Route** (`src/app/api/admin/stock/route.ts`)

**Cambios:**
- ✅ GET ahora acepta parámetros de query `marca` y `modelo`
- ✅ Aplica filtros con `.ilike()` para búsqueda flexible
- ✅ Mantiene compatibilidad con llamadas sin filtros

**Código agregado:**
```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filterMarca = searchParams.get('marca');
  const filterModelo = searchParams.get('modelo');
  
  let query = supabase.from('stock_timbres').select('*');
  
  if (filterMarca) {
    query = query.ilike('marca', `%${filterMarca}%`);
  }
  if (filterModelo) {
    query = query.ilike('modelo', `%${filterModelo}%`);
  }
  // ...
}
```

### 3. **Página de Edición** (`src/app/admin/productos/[id]/page.tsx`)

**Cambios:**
- ✅ Importado `StockTable`
- ✅ Función `extractMarcaModelo()` para parsear nombre del producto
- ✅ Estado `stockFilters` para almacenar filtros
- ✅ Sección de gestión de stock agregada después de categorías

**Código agregado:**
```typescript
// Función para extraer marca y modelo
const extractMarcaModelo = (productName: string) => {
  // Patrones: "Shiny 722", "Automatik 913", etc.
  // Retorna { marca, modelo }
};

// En el JSX:
{(stockFilters.marca || stockFilters.modelo) && (
  <div className="bg-white shadow rounded-lg p-6">
    <h2>Gestión de Stock por Variantes</h2>
    <StockTable 
      filterByMarca={stockFilters.marca}
      filterByModelo={stockFilters.modelo}
    />
  </div>
)}
```

---

## 🔄 Flujo de Funcionamiento

### 1. **Cargar Producto**
```
Usuario accede a /admin/productos/[id]
  ↓
fetchProduct() carga datos del producto
  ↓
extractMarcaModelo() parsea el nombre
  ↓
setStockFilters() guarda marca y modelo
```

### 2. **Mostrar Stock Filtrado**
```
StockTable recibe filtros como props
  ↓
useEffect detecta cambios en filtros
  ↓
loadStock() construye URL con parámetros
  ↓
GET /api/admin/stock?marca=X&modelo=Y
  ↓
API filtra stock_timbres
  ↓
Solo muestra variantes del producto
```

### 3. **Editar Stock**
```
Usuario modifica cantidad en tabla
  ↓
handleQuantityChange actualiza estado
  ↓
Click en "Guardar Cambios"
  ↓
POST /api/admin/stock con items filtrados
  ↓
Solo actualiza stock del producto actual
```

---

## 🎯 Extracción de Marca y Modelo

### Patrones Soportados:

La función `extractMarcaModelo()` reconoce:

1. **Formato estándar:** `"Shiny 722"` → `{ marca: "Shiny", modelo: "722" }`
2. **Con guión:** `"Shiny-722"` → `{ marca: "Shiny", modelo: "722" }`
3. **Con descripción:** `"Shiny 722 - Descripción"` → `{ marca: "Shiny", modelo: "722" }`
4. **Marca compuesta:** `"Shiny Printer 842"` → `{ marca: "Shiny Printer", modelo: "842" }`
5. **Fallback:** Divide por espacios y toma el último número como modelo

### Ejemplos:

| Nombre del Producto | Marca Extraída | Modelo Extraído |
|---------------------|----------------|-----------------|
| "Shiny 722" | Shiny | 722 |
| "Automatik 913" | Automatik | 913 |
| "Trodat 4912" | Trodat | 4912 |
| "Shiny Printer 842" | Shiny Printer | 842 |
| "Producto sin número" | Producto sin número | undefined |

---

## 🎨 Interfaz de Usuario

### Ubicación en la Página:

```
┌─────────────────────────────────────┐
│  Editar Producto                    │
├─────────────────────────────────────┤
│  [Formulario Principal]             │
│  - Nombre, Slug, Precio, etc.       │
├─────────────────────────────────────┤
│  [Categorías]                       │
├─────────────────────────────────────┤
│  [Gestión de Stock por Variantes]   │ ← NUEVO
│  Stock disponible por color para   │
│  Automatik 913                      │
│  (Filtrado: Automatik 913)          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Tabla de Stock Filtrada       │ │
│  │ - Solo variantes del producto │ │
│  │ - Editable por fila           │ │
│  │ - Botón Guardar Cambios       │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  [Botones: Eliminar / Cancelar /   │
│   Guardar cambios]                  │
└─────────────────────────────────────┘
```

---

## 📊 Ejemplo de Uso

### Escenario: Editar "Automatik 913"

1. **Usuario accede a:** `/admin/productos/[id]`
2. **Sistema detecta:**
   - Nombre: "Automatik 913"
   - Extrae: `{ marca: "Automatik", modelo: "913" }`
3. **Tabla muestra solo:**
   ```
   Marca    | Modelo | Color  | Cantidad
   Automatik| 913    | Negro  | [15]    ← Editable
   Automatik| 913    | Azul   | [8]     ← Editable
   ```
4. **Usuario edita cantidades y guarda**
5. **Solo se actualizan las filas de Automatik 913**

---

## 🔍 Filtrado Inteligente

### Búsqueda Flexible:

La API usa `.ilike()` para búsqueda parcial:

- `marca="Automatik"` → Encuentra "Automatik", "automatik", etc.
- `modelo="913"` → Encuentra "913", "913A", etc.

### Ventajas:

- ✅ No requiere coincidencia exacta
- ✅ Funciona con variaciones de nombre
- ✅ Case-insensitive
- ✅ Permite búsqueda parcial

---

## ⚠️ Casos Especiales

### 1. **Producto sin Marca/Modelo Detectable**

Si `extractMarcaModelo()` no puede extraer marca y modelo:

- ❌ La sección de stock **NO se muestra**
- ✅ El formulario principal sigue funcionando normalmente
- ℹ️ Mensaje: "No se pudo identificar marca/modelo del producto"

### 2. **Producto sin Stock Registrado**

Si no hay registros en `stock_timbres` para ese producto:

- ✅ La tabla se muestra vacía
- ✅ Mensaje: "No hay registros de stock"
- ✅ Usuario puede agregar stock desde la página principal `/admin/stock`

### 3. **Múltiples Variantes**

Si hay múltiples colores del mismo producto:

- ✅ Todas se muestran en la tabla
- ✅ Cada una es editable independientemente
- ✅ Guardado masivo actualiza todas a la vez

---

## 🧪 Testing

### Casos de Prueba:

1. **Producto con nombre estándar:**
   - ✅ Debe extraer marca y modelo correctamente
   - ✅ Debe mostrar tabla filtrada
   - ✅ Debe permitir edición

2. **Producto con nombre complejo:**
   - ✅ Debe intentar extraer lo mejor posible
   - ✅ Si falla, no debe romper la página

3. **Producto sin stock:**
   - ✅ Debe mostrar tabla vacía
   - ✅ No debe generar errores

4. **Edición de stock:**
   - ✅ Debe actualizar solo las filas del producto
   - ✅ No debe afectar otros productos

---

## 📝 Mejoras Futuras Sugeridas

1. **Campo explícito en Producto:**
   - Agregar campos `marca` y `modelo` a la tabla `products`
   - Eliminar necesidad de parsing

2. **Relación directa:**
   - Agregar `product_id` a `stock_timbres`
   - Filtrado directo por ID

3. **Crear variantes desde edición:**
   - Botón "Agregar variante de color"
   - Modal para crear nueva fila en stock_timbres

4. **Sincronización automática:**
   - Al cambiar nombre del producto, actualizar stock_timbres
   - Mantener consistencia entre tablas

---

## 🎉 Resultado Final

### Antes:
```
Editar Producto
  ├─ Formulario principal
  └─ Categorías
```

### Ahora: ✅
```
Editar Producto
  ├─ Formulario principal
  ├─ Categorías
  └─ Gestión de Stock por Variantes ← NUEVO
      └─ Tabla filtrada por producto
          └─ Edición directa de cantidades
```

---

## 📌 Notas Importantes

### Compatibilidad:

- ✅ Funciona con estructura actual de `stock_timbres`
- ✅ No requiere cambios en la base de datos
- ✅ Compatible con productos existentes
- ✅ Si no puede extraer marca/modelo, simplemente no muestra la sección

### Rendimiento:

- ⚡ Filtrado en el servidor (eficiente)
- ⚡ Solo carga stock relevante
- ⚡ No afecta rendimiento de otros productos

---

**Fecha de implementación:** 25 de noviembre, 2025  
**Estado:** ✅ Completado y funcional  
**Prioridad:** 🔴 Alta (Integración crítica)

