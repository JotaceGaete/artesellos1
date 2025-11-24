# 🤖 Chatbot Global - Documentación

## ✅ Implementación Completada

El chatbot ahora está disponible en **TODAS las páginas** del sitio web como un widget flotante.

---

## 📍 Ubicación del Código

### Componente Principal
```
src/components/ChatInterface.tsx
```
- Widget del chatbot con interfaz de usuario
- Manejo de mensajes y streaming
- Integración con la API

### Integración Global
```
src/app/layout.tsx
```
- Línea 7: Import del componente
- Línea 54: Renderizado en el layout

### API Backend
```
src/app/api/chat/route.ts
```
- Endpoint que procesa las consultas
- Integración con OpenAI
- Consultas a la base de datos (stock_timbres)

---

## 🎯 Características

### Funcionalidades
- ✅ **Consulta de stock** - Busca productos en `stock_timbres`
- ✅ **Muestra imágenes** - Imágenes reales desde R2 (media.artesellos.cl)
- ✅ **Información de negocio** - Horarios, ubicación, contacto
- ✅ **Información de envíos** - Costos, tiempos, cobertura
- ✅ **Personalización** - Detalles sobre personalización de timbres
- ✅ **Streaming en tiempo real** - Respuestas progresivas
- ✅ **Markdown support** - Formato rico en respuestas

### Diseño
- 💬 **Botón flotante** - Esquina inferior derecha
- 📱 **Responsive** - Se adapta a móviles
- 🎨 **Moderno** - Gradiente indigo/purple
- ✨ **Animaciones** - Transiciones suaves

---

## 🌐 Páginas Donde Está Disponible

El chatbot está presente en:

```
✓ / (Página principal)
✓ /productos (Catálogo)
✓ /productos/[slug] (Detalle de producto)
✓ /contacto (Contacto)
✓ /checkout (Carrito)
✓ /chat (Página dedicada al chat)
✓ Cualquier otra página del sitio
```

**Nota:** El chatbot se carga una sola vez en el layout y persiste al navegar entre páginas gracias al sistema de navegación de Next.js.

---

## 🎨 Personalización

### Cambiar Posición del Botón

**Archivo:** `src/components/ChatInterface.tsx`  
**Línea:** ~173

```tsx
// Posición actual: bottom-4 right-4
<button className="fixed bottom-4 right-4 z-50 ...">

// Opciones:
bottom-4 left-4   // Esquina inferior izquierda
top-4 right-4     // Esquina superior derecha
top-4 left-4      // Esquina superior izquierda
```

### Cambiar Tamaño del Widget

**Línea:** ~187

```tsx
// Tamaño actual: w-96 h-[500px]
<div className="fixed bottom-20 right-4 z-50 w-96 h-[500px] ...">

// Opciones:
w-80 h-[400px]    // Más pequeño
w-96 h-[500px]    // Actual (384px × 500px)
w-[450px] h-[600px]  // Más grande
```

### Cambiar Colores

**Botón flotante (línea ~175):**
```tsx
// Actual: bg-indigo-600 hover:bg-indigo-700
className="... bg-indigo-600 hover:bg-indigo-700 ..."

// Otras opciones:
bg-blue-600 hover:bg-blue-700
bg-purple-600 hover:bg-purple-700
bg-green-600 hover:bg-green-700
```

**Header del widget (línea ~189):**
```tsx
// Actual: from-indigo-600 to-purple-600
className="bg-gradient-to-r from-indigo-600 to-purple-600 ..."

// Otras opciones:
from-blue-600 to-cyan-600
from-purple-600 to-pink-600
from-green-600 to-emerald-600
```

---

## 🔧 Configuración Avanzada

### Mensaje de Bienvenida

Para cambiar el mensaje inicial, edita:

**Archivo:** `src/components/ChatInterface.tsx`  
**Línea:** ~15

```tsx
const [messages, setMessages] = useState<Message[]>([]);

// Para agregar mensaje de bienvenida:
const [messages, setMessages] = useState<Message[]>([
  {
    id: 'welcome',
    role: 'assistant',
    content: '¡Hola! 👋 Soy el asistente de Artesellos. ¿En qué puedo ayudarte?'
  }
]);
```

### Ocultar en Páginas Específicas

Si quieres ocultar el chatbot en ciertas páginas:

**Opción 1: Condicional en el componente**

```tsx
'use client';
import { usePathname } from 'next/navigation';

export default function ChatInterface() {
  const pathname = usePathname();
  
  // Ocultar en estas rutas
  if (pathname === '/admin' || pathname.startsWith('/dashboard')) {
    return null;
  }
  
  // ... resto del código
}
```

**Opción 2: Remover del layout y agregar manualmente**

Quita del `layout.tsx` y agrégalo solo en las páginas donde lo necesites.

---

## 📱 Responsive

El chatbot se adapta automáticamente:

### Desktop (1024px+)
- Widget: 384px × 500px
- Posición: Fixed bottom-right
- Botón: 56px circular

### Tablet (768px - 1023px)
- Widget: 384px × 500px
- Se ajusta si no hay espacio

### Mobile (<768px)
- Widget: Full width - 32px (w-[calc(100vw-2rem)])
- Altura: 500px
- Centrado horizontalmente

---

## 🚀 Funcionalidades del Chat

### Comandos/Consultas Soportadas

1. **Consulta de Stock**
   ```
   "Shiny 722"
   "Tienes el modelo 4912?"
   "Muéstrame timbres automáticos"
   ```

2. **Información de Colores**
   ```
   "Shiny 722 en rojo"
   "Qué colores tiene el Trodat 4912?"
   ```

3. **Información del Negocio**
   ```
   "Horarios de atención"
   "Dónde están ubicados?"
   "Teléfono de contacto"
   ```

4. **Envíos**
   ```
   "Cuánto cuesta el envío?"
   "Envían a regiones?"
   "Tiempo de entrega"
   ```

5. **Personalización**
   ```
   "Puedo personalizar un timbre?"
   "Cómo funciona la personalización?"
   "Qué incluye el diseño?"
   ```

---

## 🔍 Troubleshooting

### El chatbot no aparece
1. Verifica que el servidor esté corriendo
2. Limpia caché del navegador (Ctrl+Shift+R)
3. Revisa la consola del navegador por errores

### Las respuestas no llegan
1. Verifica que la API `/api/chat` esté funcionando
2. Revisa las variables de entorno (OPENAI_API_KEY, SUPABASE_URL, etc.)
3. Chequea los logs del servidor

### El botón está en una posición incorrecta
- Ajusta las clases `bottom-4 right-4` en línea ~173
- Considera el z-index si hay otros elementos flotantes

### El widget se ve cortado en mobile
- El componente ya tiene responsive, pero verifica:
  - Que no haya CSS conflictivo
  - Que el viewport meta tag esté en el HTML

---

## 📊 Métricas

### Rendimiento
- **Tamaño del componente:** ~8 KB
- **Carga inicial:** Lazy (solo se carga cuando se abre)
- **Streaming:** Respuestas progresivas (mejor UX)

### Uso de Recursos
- **API calls:** 1 por mensaje
- **Tokens OpenAI:** Variable según consulta
- **Base de datos:** Consultas optimizadas a stock_timbres

---

## 🎯 Mejoras Futuras (Opcionales)

### Sugerencias de Implementación

1. **Historial persistente**
   ```tsx
   // Guardar mensajes en localStorage
   useEffect(() => {
     localStorage.setItem('chat-history', JSON.stringify(messages));
   }, [messages]);
   ```

2. **Notificaciones**
   ```tsx
   // Mostrar badge cuando hay mensaje nuevo
   const [unreadCount, setUnreadCount] = useState(0);
   ```

3. **Typing indicator**
   ```tsx
   // Mostrar "Escribiendo..." mientras espera
   {isLoading && <TypingIndicator />}
   ```

4. **Quick replies**
   ```tsx
   // Botones de respuesta rápida
   const quickReplies = ['Ver catálogo', 'Horarios', 'Envíos'];
   ```

5. **Sonido de notificación**
   ```tsx
   // Reproducir sonido al recibir mensaje
   const audio = new Audio('/notification.mp3');
   audio.play();
   ```

---

## 📝 Notas Importantes

- El chatbot usa la misma API que la página `/chat`
- Las respuestas son generadas por OpenAI GPT-4
- Los datos de productos vienen de `stock_timbres` en Supabase
- Las imágenes se cargan desde R2 (media.artesellos.cl)
- El componente es client-side (`'use client'`)
- Compatible con Next.js 14+ App Router

---

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa este documento
2. Consulta `src/components/ChatInterface.tsx` (código comentado)
3. Revisa `src/app/api/chat/route.ts` (lógica del backend)

---

## ✅ Checklist de Verificación

- [x] Chatbot visible en todas las páginas
- [x] Botón flotante funcional
- [x] Widget se abre/cierra correctamente
- [x] Respuestas streaming funcionando
- [x] Imágenes de productos se muestran
- [x] Responsive en mobile
- [x] Sin errores en consola
- [x] API funcionando correctamente

---

<div align="center">

**🎉 ¡Chatbot Global Implementado Exitosamente!**

[Ver en acción](http://localhost:3001) | [Código fuente](src/components/ChatInterface.tsx)

</div>

