# 💳 Página de Checkout Simplificado - `/pagar`

## ✅ Implementación Completa

### Ruta
```
src/app/pagar/page.tsx
```

### URL de Ejemplo
```
http://localhost:3000/pagar?monto=75000&detalle=5x%20Shiny%20722
```

---

## 🎯 Funcionalidades

### 1. **Parámetros de URL**
```typescript
const monto = searchParams.get('monto') || '0';
const detalle = searchParams.get('detalle') || 'Productos varios';
```

**Ejemplo de uso desde el chatbot**:
```
/pagar?monto=75000&detalle=5x Shiny 722 Azul
```

### 2. **Formato de Moneda Chilena**
```typescript
const formatCLP = (amount: string) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(parseFloat(amount));
};
```

**Resultado**: `$75.000` (con punto separador de miles)

---

## 🎨 Diseño

### 1. **Header con Ícono**
```tsx
<div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full">
  <CreditCard />
</div>
<h1>Completa tu Compra</h1>
```

### 2. **Tarjeta Principal (Tipo Ticket)**

#### Resumen del Pedido (Top - Degradado)
```tsx
<div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
  <h2>Resumen de tu Pedido</h2>
  <div>Detalle: {detalle}</div>
  <div>Total: {formatCLP(monto)}</div>
</div>
```

**Características**:
- Fondo degradado Indigo → Purple
- Texto blanco
- Total en tamaño grande (text-3xl)

#### Opciones de Pago (Tabs)
```tsx
<div className="flex gap-2">
  <button>Transferencia</button>
  <button>Tarjeta / Webpay</button>
</div>
```

**Estados**:
- **Activo**: `bg-indigo-600 text-white shadow-md`
- **Inactivo**: `bg-gray-100 text-gray-600 hover:bg-gray-200`

---

## 💰 Opción A: Transferencia Bancaria

### Datos Bancarios
```typescript
const datosBancarios = {
  banco: 'Banco Estado',
  tipoCuenta: 'Cuenta Corriente',
  numeroCuenta: '123456789',
  rut: '12.345.678-9',
  titular: 'Artesellos SpA',
  email: 'pagos@artesellos.cl'
};
```

**IMPORTANTE**: ⚠️ Actualiza estos datos con los reales de Artesellos.

### Tarjeta de Datos
```tsx
<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
  {/* Filas de datos */}
  <div className="flex justify-between">
    <span className="text-sm text-gray-600">Banco:</span>
    <span className="text-sm font-semibold">Banco Estado</span>
  </div>
  {/* ... más filas ... */}
</div>
```

### Botón Copiar Datos
```tsx
<button onClick={copiarDatos}>
  {copied ? (
    <><Check /> ¡Copiado!</>
  ) : (
    <><Copy /> Copiar Datos Bancarios</>
  )}
</button>
```

**Funcionalidad**:
1. Click → Copia todo al portapapeles
2. Muestra checkmark por 2 segundos
3. Incluye monto en el texto copiado

**Texto copiado**:
```
Banco: Banco Estado
Tipo: Cuenta Corriente
N° Cuenta: 123456789
RUT: 12.345.678-9
Titular: Artesellos SpA
Email: pagos@artesellos.cl
Monto: $75.000
```

### Nota Importante
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p>📌 Importante:</p>
  <p>Después de realizar la transferencia, envíanos el comprobante por WhatsApp...</p>
</div>
```

---

## 💳 Opción B: Tarjeta / Webpay (Tuu.cl)

### Tarjeta de Pago
```tsx
<div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
  <CreditCard className="w-12 h-12 mx-auto text-indigo-600" />
  <p>Serás redirigido a Tuu.cl...</p>
  
  {/* Botón Principal */}
  <a href="https://www.tuu.cl/arteselloschile" target="_blank">
    Ir a Pagar en Tuu.cl →
  </a>
</div>
```

### Botón Principal
```tsx
className="
  block w-full py-4 px-6 
  bg-gradient-to-r from-indigo-600 to-purple-600 
  text-white text-center rounded-lg 
  font-bold text-lg 
  hover:from-indigo-700 hover:to-purple-700 
  shadow-lg hover:shadow-xl 
  transform hover:scale-[1.02]
"
```

**Efectos**:
- Degradado animado en hover
- Sombra que se intensifica
- Escala ligeramente (1.02x)

### Instrucciones
```tsx
<div className="bg-white rounded-lg p-4 border border-indigo-200">
  <p>⚠️ Al ingresar a Tuu.cl:</p>
  <ol>
    <li>Digita el monto exacto: {formatCLP(monto)}</li>
    <li>Completa el formulario de pago</li>
    <li>Confirma tu compra</li>
  </ol>
</div>
```

### Nota de Seguridad
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <p>🔒 Pago Seguro</p>
  <p>Tuu.cl es una plataforma certificada por Webpay...</p>
</div>
```

---

## 📱 Botón WhatsApp

### Link Pre-llenado
```typescript
const whatsappLink = `https://wa.me/56922384216?text=${encodeURIComponent(
  `¡Hola! Ya realicé el pago de ${formatCLP(monto)} por: ${detalle}. Adjunto comprobante.`
)}`;
```

**Mensaje que se enviará**:
```
¡Hola! Ya realicé el pago de $75.000 por: 5x Shiny 722 Azul. Adjunto comprobante.
```

### Tarjeta WhatsApp
```tsx
<div className="bg-white rounded-xl shadow-lg p-6 text-center">
  <h3>¿Ya realizaste el pago?</h3>
  <a href={whatsappLink} target="_blank">
    <Send /> Enviar Comprobante por WhatsApp
  </a>
  <p className="text-xs text-gray-500">
    Te contactaremos para confirmar tu pedido
  </p>
</div>
```

**Botón**:
- Fondo verde (`bg-green-500`)
- Icono de envío (Send)
- Sombra que crece en hover

---

## 🎨 Paleta de Colores

### Gradientes
```css
/* Header */
from-indigo-600 to-purple-600

/* Resumen del Pedido */
from-indigo-600 to-purple-600

/* Tarjeta Tuu.cl */
from-purple-50 to-indigo-50

/* Botón Tuu.cl */
from-indigo-600 to-purple-600
hover:from-indigo-700 hover:to-purple-700
```

### Fondos de Notas
```css
bg-blue-50 border-blue-200    /* Nota Transferencia */
bg-green-50 border-green-200  /* Nota Seguridad */
bg-gray-50 border-gray-200    /* Datos Bancarios */
```

### Estados
```css
/* Tab Activo */
bg-indigo-600 text-white shadow-md

/* Tab Inactivo */
bg-gray-100 text-gray-600 hover:bg-gray-200

/* Botón Copiado */
bg-indigo-50 text-indigo-600
```

---

## 🔧 Funcionalidades Técnicas

### 1. **Suspense para useSearchParams**
```tsx
export default function PagarPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}
```

**Por qué**: `useSearchParams` debe estar dentro de un componente con `Suspense` para evitar errores de hidratación.

### 2. **Copiar al Portapapeles**
```typescript
const copiarDatos = () => {
  const texto = `...`;
  navigator.clipboard.writeText(texto);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

### 3. **Tabs con Estado**
```typescript
const [activeTab, setActiveTab] = useState<'transferencia' | 'tarjeta'>('transferencia');
```

### 4. **Animaciones de Entrada**
```tsx
className="animate-in fade-in slide-in-from-bottom-4 duration-300"
```

---

## 📊 Estructura Visual

```
┌─────────────────────────────────────────┐
│         [🔵 Icono]                      │
│      Completa tu Compra                 │
│   Elige tu método de pago preferido     │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 🟣 Resumen de tu Pedido           │  │
│  │ Detalle: 5x Shiny 722 Azul        │  │
│  │ Total: $75.000                    │  │
│  ├───────────────────────────────────┤  │
│  │ [Transferencia] [Tarjeta]         │  │
│  │                                   │  │
│  │ {Contenido del tab activo}        │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ ¿Ya realizaste el pago?           │  │
│  │ [💚 Enviar Comprobante WhatsApp]  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing

### URLs de Prueba

1. **Caso básico**:
```
/pagar?monto=50000&detalle=Timbre Shiny 722
```

2. **Con múltiples productos**:
```
/pagar?monto=150000&detalle=5x Shiny 722 + 3x Trodat 4912
```

3. **Sin parámetros** (valores por defecto):
```
/pagar
```
**Resultado**: 
- Monto: $0
- Detalle: "Productos varios"

### Checklist

#### Desktop
- [ ] Header centrado con icono
- [ ] Tarjeta tipo ticket visible
- [ ] Resumen con degradado morado
- [ ] Tabs de pago funcionan
- [ ] Tab "Transferencia" por defecto
- [ ] Datos bancarios visibles
- [ ] Botón "Copiar" funciona
- [ ] Checkmark aparece 2 segundos
- [ ] Tab "Tarjeta" muestra Tuu.cl
- [ ] Botón "Ir a Tuu.cl" abre en nueva pestaña
- [ ] Monto se muestra en instrucciones
- [ ] Botón WhatsApp funciona
- [ ] Mensaje pre-llenado correcto
- [ ] Link "Volver al inicio" funciona

#### Móvil
- [ ] Layout responsivo (padding correcto)
- [ ] Tarjeta no se sale del viewport
- [ ] Tabs en 2 columnas
- [ ] Botones suficientemente grandes
- [ ] Texto legible
- [ ] WhatsApp abre app nativa

#### Funcionalidades
- [ ] Parámetros `monto` y `detalle` se leen correctamente
- [ ] Formato CLP correcto ($75.000)
- [ ] Copiar al portapapeles funciona
- [ ] Link de WhatsApp correcto
- [ ] Animaciones suaves
- [ ] Sin errores de consola

---

## 🔒 Consideraciones de Seguridad

### 1. **Datos Bancarios**
⚠️ **Actualizar antes de producción**:
```typescript
// En línea 15-21 de src/app/pagar/page.tsx
const datosBancarios = {
  banco: 'Banco Estado',           // ← Cambiar
  tipoCuenta: 'Cuenta Corriente',  // ← Cambiar
  numeroCuenta: '123456789',       // ← Cambiar
  rut: '12.345.678-9',             // ← Cambiar
  titular: 'Artesellos SpA',       // ← Cambiar
  email: 'pagos@artesellos.cl'    // ← Cambiar
};
```

### 2. **Número de WhatsApp**
```typescript
// Línea 90 aproximadamente
const whatsappLink = `https://wa.me/56922384216?text=...`;
//                                   ^^^^^^^^^^^
//                                   ← Verificar número
```

### 3. **Link de Tuu.cl**
```typescript
// Línea 170 aproximadamente
href="https://www.tuu.cl/arteselloschile"
//                       ^^^^^^^^^^^^^^^^
//                       ← Verificar slug de cuenta
```

---

## 🚀 Integración con Chatbot

### Desde el Chatbot (API Route)
```typescript
// En src/app/api/chat/route.ts
const checkoutUrl = `/pagar?monto=${precioTotal}&detalle=${encodeURIComponent(descripcionProductos)}`;

respuesta += `\n\n[Ver opciones de pago](${checkoutUrl})`;
```

### Markdown Link
```markdown
Para completar tu compra de **$75.000** por 5x Shiny 722 Azul:

👉 [Ir a Pagar](/pagar?monto=75000&detalle=5x%20Shiny%20722%20Azul)
```

---

## 📝 Personalización Rápida

### Cambiar Colores
```tsx
// De Indigo/Purple a Blue/Cyan
from-indigo-600 to-purple-600  →  from-blue-600 to-cyan-600
```

### Cambiar Banco Por Defecto
```typescript
const [activeTab, setActiveTab] = useState<'transferencia' | 'tarjeta'>('tarjeta');
//                                                                        ^^^^^^^^
//                                                                        ← 'tarjeta' para Tuu.cl por defecto
```

### Agregar Más Métodos de Pago
```tsx
<button onClick={() => setActiveTab('mercadopago')}>
  MercadoPago
</button>

{activeTab === 'mercadopago' && (
  <div>{/* Contenido de MercadoPago */}</div>
)}
```

---

## ✅ Resultado Final

### Características Implementadas
- ✅ Diseño tipo "Ticket de Compra" elegante
- ✅ Lectura de parámetros de URL (`monto`, `detalle`)
- ✅ Formato de moneda chilena automático
- ✅ Tabs para 2 métodos de pago
- ✅ **Transferencia**: Datos bancarios + botón copiar
- ✅ **Tarjeta/Webpay**: Botón a Tuu.cl + instrucciones
- ✅ Botón WhatsApp con mensaje pre-llenado
- ✅ Animaciones suaves
- ✅ Responsive (móvil y desktop)
- ✅ Suspense para evitar errores
- ✅ Sin errores de linting

---

**¡Página de checkout lista para recibir pagos! 💳✨**

