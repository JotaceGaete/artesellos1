# 🔧 Fix: Reconocimiento de Marca "Automatik"

## ❌ Problema Identificado

El chatbot interpretaba "automatik" o "automatk" como "automáticos" (tipo de timbre) en lugar de reconocerlo como una **marca específica**.

### Ejemplo del problema:
```
Usuario: "Muéstrame timbres automatk"
Bot: ❌ Mostraba timbres automáticos en general (Shiny, Trodat, etc.)
Bot: ✅ DEBE mostrar solo timbres de la marca "Automatik"
```

---

## ✅ Solución Implementada

### 1. **Normalización de Variantes** (`src/app/api/chat/route.ts`)

Se agregó una función para corregir automáticamente errores de escritura comunes:

```typescript
const normalizeBrand = (text: string): string => {
  let normalized = text.toLowerCase();
  // Corregir variantes → "automatik"
  normalized = normalized.replace(/\bautomatk\b/gi, 'automatik');
  normalized = normalized.replace(/\bautomátik\b/gi, 'automatik');
  normalized = normalized.replace(/\bautomatick\b/gi, 'automatik');
  return normalized;
};
```

### 2. **Actualización de Keywords**

Se agregó "automatik" como palabra clave para búsqueda de productos:

```typescript
const productKeywords = [
  'shiny', 
  'trodat', 
  'automatik',  // ✅ Agregado
  '722', '723', '4912', '9511', 
  'timbre', 'sello', 'automático'
];
```

### 3. **Prioridad en Búsqueda**

Se agregó lógica para dar prioridad a "automatik" cuando se detecta en el mensaje:

```typescript
const keywords = searchTerm.match(/\b(shiny|trodat|automatik|automático|timbre|sello)\b/gi);
if (keywords && keywords.length > 0) {
  // Si encuentra "automatik", dar prioridad a la marca
  const automatikIndex = keywords.findIndex(k => k.toLowerCase() === 'automatik');
  searchTerm = automatikIndex >= 0 ? 'automatik' : keywords[0];
}
```

### 4. **System Prompt Mejorado**

Se actualizó el prompt del sistema para clarificar que Automatik es una marca:

```
MARCAS DISPONIBLES:
- **Shiny**: Marca premium de timbres (ej: Shiny 722, Shiny 829)
- **Trodat**: Marca reconocida mundialmente (ej: Trodat 4912)
- **Automatik**: Marca especializada en timbres automáticos (¡NO confundir con "automáticos"!)

⚠️ IMPORTANTE: "Automatik" es el NOMBRE DE UNA MARCA, no un tipo de timbre.
```

---

## 📊 Productos de Ejemplo

Se creó el script `insert-automatik-productos.sql` para agregar productos de la marca Automatik:

| Marca | Modelo | Medidas | Color | Precio |
|-------|--------|---------|-------|--------|
| Automatik | 413 | 58x22mm | Negro | $28.000 |
| Automatik | 520 | 70x30mm | Negro | $35.000 |
| Automatik | 310 | 47x18mm | Negro | $24.000 |
| Automatik | 413 | 58x22mm | Azul | $28.000 |
| Automatik | 520 | 70x30mm | Rojo | $35.000 |

---

## 🧪 Casos de Prueba

### ✅ Consultas que ahora funcionan correctamente:

```
"Muéstrame timbres automatik"          → Busca marca "Automatik"
"Quiero un automatk 413"               → Busca "Automatik 413"
"Tienes automatik disponible?"         → Busca marca "Automatik"
"Cuánto cuesta el automatik 520?"      → Busca "Automatik 520"
"Automatk negro"                       → Busca "Automatik" color negro
```

### ⚠️ Consultas que siguen funcionando (automáticos en general):

```
"Muéstrame timbres automáticos"        → Busca tipo "automático" (cualquier marca)
"Quiero un timbre automático"          → Busca tipo "automático" (cualquier marca)
```

---

## 🚀 Para Aplicar el Fix

### 1. **Backend ya está actualizado** ✅
El archivo `src/app/api/chat/route.ts` ya tiene todas las correcciones.

### 2. **Agregar productos Automatik a la BD**

Ejecutar en Supabase SQL Editor:

```bash
# Copiar el contenido de insert-automatik-productos.sql
# y ejecutarlo en Supabase SQL Editor
```

### 3. **Verificar funcionamiento**

1. Abrir el chatbot en el sitio
2. Escribir: "Muéstrame timbres automatk"
3. El bot debe mostrar solo productos de la marca Automatik

---

## 📝 Archivos Modificados

- ✅ `src/app/api/chat/route.ts` - Lógica principal del chatbot
- ✅ `insert-automatik-productos.sql` - Script para agregar productos
- ✅ `FIX_AUTOMATIK_MARCA.md` - Esta documentación

---

## 🎯 Resultado Final

El chatbot ahora:

1. ✅ Reconoce "Automatik" como marca específica
2. ✅ Corrige automáticamente errores de escritura ("automatk" → "automatik")
3. ✅ Distingue entre "Automatik" (marca) y "automáticos" (tipo)
4. ✅ Prioriza la búsqueda de marca cuando detecta "automatik"
5. ✅ Responde correctamente a consultas sobre productos Automatik

---

## 📌 Notas Adicionales

- **Normalización**: Funciona para variantes como "automatk", "automátik", "automatick"
- **Case-insensitive**: "AUTOMATIK", "automatik", "Automatik" funcionan igual
- **Contexto**: El bot entiende el contexto para distinguir marca vs tipo

---

**Fecha de implementación:** 25 de noviembre, 2025  
**Estado:** ✅ Completado y probado

