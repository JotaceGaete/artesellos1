# 📝 Procedimiento para Agregar un Nuevo Fragmento a la Base de Conocimiento RAG

## 🎯 Objetivo
Agregar información nueva a la base de conocimiento para que el chatbot pueda responder preguntas sobre ese tema.

---

## ✅ Procedimiento Paso a Paso

### **Paso 1: Ir al Panel de Administración**
1. Navega a: `/admin/knowledge-base`
2. Verás la lista de fragmentos existentes

### **Paso 2: Agregar Nuevo Fragmento**
1. Haz clic en el botón **"Nuevo Fragmento"** (botón negro con ícono +)
2. Se abrirá un formulario con un área de texto

### **Paso 3: Escribir el Contenido**
1. Escribe el contenido del fragmento en el área de texto
2. **Ejemplo:** "Los timbres pueden personalizarse con diseños custom, incluyendo texto, logos y diferentes colores de tinta (negro, rojo, azul, verde, morado)."
3. Asegúrate de que el texto sea claro y completo

### **Paso 4: Guardar el Fragmento**
1. Haz clic en el botón **"Agregar"** (botón morado)
2. El sistema automáticamente:
   - ✅ Genera el embedding usando OpenAI
   - ✅ Guarda el fragmento en Supabase
   - ✅ Asocia el embedding con el fragmento

### **Paso 5: Verificar que se Guardó**
1. El fragmento debería aparecer en la lista
2. Verás un mensaje de éxito: "Fragmento agregado exitosamente"

---

## 🔄 ¿Qué Sucede Automáticamente?

Cuando agregas un nuevo fragmento, el sistema:

1. **Genera el Embedding:**
   - Llama a la API de OpenAI (`text-embedding-3-small`)
   - Convierte el texto en un vector de 1536 dimensiones
   - Esto permite la búsqueda semántica

2. **Guarda en Supabase:**
   - Inserta el fragmento en la tabla `knowledge_base`
   - Guarda tanto el `content` como el `embedding`
   - Asigna un ID único

3. **Está Listo para Usar:**
   - El chatbot puede encontrarlo inmediatamente
   - Funciona con búsqueda vectorial (si tiene embedding)
   - Funciona con búsqueda por palabras clave (siempre)

---

## 🧪 Cómo Verificar que Funciona

### **Opción 1: Probar en el Chatbot**
1. Ve al chatbot en tu sitio web
2. Haz una pregunta relacionada con el fragmento que agregaste
3. El chatbot debería encontrar y usar la información

### **Opción 2: Usar la Ruta de Diagnóstico**
Abre en tu navegador:
```
http://localhost:3000/api/admin/knowledge-base/debug-rag?query=tu pregunta aquí
```

Esto mostrará:
- Si el fragmento tiene embedding
- Si la búsqueda lo encuentra
- Qué fragmentos son relevantes

---

## ⚠️ Notas Importantes

### **Embeddings Automáticos**
- ✅ Los **nuevos fragmentos** se crean con embedding automáticamente
- ❌ Los **fragmentos antiguos** pueden no tener embedding
- 💡 Usa el botón **"Regenerar Embeddings"** para los fragmentos antiguos

### **Búsqueda Dual**
El chatbot usa dos métodos de búsqueda:
1. **Búsqueda Vectorial** (requiere embeddings) - Más precisa
2. **Búsqueda por Palabras Clave** (siempre funciona) - Fallback

### **Tiempo de Procesamiento**
- Generar un embedding toma ~1-2 segundos
- El fragmento está disponible inmediatamente después de guardarse

---

## 🎯 Ejemplo Práctico

**Pregunta del usuario:** "que colores de tinta tienen"

**Fragmento en la base:**
```
Los timbres pueden personalizarse con diseños custom, incluyendo texto, logos y diferentes colores de tinta (negro, rojo, azul, verde, morado).
```

**Proceso:**
1. Usuario pregunta: "que colores de tinta tienen"
2. Sistema busca fragmentos con palabras: "colores", "tinta"
3. Encuentra el fragmento relevante
4. Inyecta el contexto en el System Prompt
5. El modelo responde: "Los timbres pueden personalizarse con diferentes colores de tinta: negro, rojo, azul, verde y morado."

---

## 🔧 Solución de Problemas

### **El fragmento no aparece en la lista**
- Recarga la página
- Verifica que no haya errores en la consola

### **El chatbot no encuentra el fragmento**
- Verifica que el fragmento tenga embedding (usa la ruta de diagnóstico)
- Si no tiene embedding, usa "Regenerar Embeddings"
- Prueba con diferentes palabras clave en tu pregunta

### **Error al agregar fragmento**
- Verifica que tengas `OPENAI_API_KEY` configurada
- Revisa los logs del servidor para ver el error específico

---

## 📊 Resumen del Flujo

```
Usuario escribe fragmento
    ↓
Clic en "Agregar"
    ↓
Sistema genera embedding (OpenAI)
    ↓
Sistema guarda en Supabase (content + embedding)
    ↓
Fragmento disponible inmediatamente
    ↓
Chatbot puede encontrarlo en la próxima búsqueda
```

---

## ✅ Checklist para Agregar un Fragmento

- [ ] Ir a `/admin/knowledge-base`
- [ ] Clic en "Nuevo Fragmento"
- [ ] Escribir contenido claro y completo
- [ ] Clic en "Agregar"
- [ ] Ver mensaje de éxito
- [ ] Verificar que aparece en la lista
- [ ] Probar en el chatbot con una pregunta relacionada

---

¡Listo! Con este procedimiento, tus fragmentos estarán disponibles para el chatbot inmediatamente.

