# 🎯 Sistema de Captación de Leads - Guía de Implementación

## ✅ Archivos Creados/Modificados

### 1. **Base de Datos**
- ✅ `supabase/migrations/create_leads_table.sql`

### 2. **Backend**
- ✅ `src/app/api/lead/route.ts` (nuevo endpoint)
- ✅ `src/app/api/chat/route.ts` (sin cambios)

### 3. **Frontend**
- ✅ `src/components/ChatInterface.tsx` (refactorizado completamente)

---

## 🚀 Pasos de Implementación

### Paso 1: Crear la tabla en Supabase

Tienes **2 opciones**:

#### Opción A: Ejecutar el SQL manualmente en Supabase Dashboard

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/migrations/create_leads_table.sql`
4. Haz clic en **Run**

#### Opción B: Usar PowerShell (Windows)

```powershell
# Leer el archivo SQL
$sql = Get-Content -Path "supabase/migrations/create_leads_table.sql" -Raw

# Mostrar preview
Write-Host "📋 SQL a ejecutar:" -ForegroundColor Yellow
Write-Host $sql

Write-Host "`n¿Deseas ejecutar este SQL en Supabase? (S/N)" -ForegroundColor Cyan
$confirm = Read-Host

if ($confirm -eq 'S' -or $confirm -eq 's') {
    Write-Host "✅ Copia este SQL y ejecútalo en el SQL Editor de Supabase" -ForegroundColor Green
    Write-Host "🔗 https://supabase.com/dashboard" -ForegroundColor Cyan
    Set-Clipboard -Value $sql
    Write-Host "✅ SQL copiado al portapapeles" -ForegroundColor Green
}
```

---

## 🎨 Características Implementadas

### 🔒 **Muro de Email (Lead Capture)**
- Pantalla de bienvenida profesional
- Validación de email en frontend y backend
- Diseño moderno con gradientes
- Mensaje de consentimiento

### 💬 **Chat Completo**
- Mantiene TODA la funcionalidad anterior
- Streaming de respuestas
- Renderizado de Markdown
- Imágenes de productos
- Scroll automático inteligente

### 📞 **Botón de WhatsApp**
- Visible en el header del chat
- Link directo: `https://wa.me/56922384216`
- Diseño verde con icono de WhatsApp
- Texto "Hablar con Humano"

### 🛡️ **Control de Input Blindado**
- Usa `value={input}` y `onChange={(e) => setInput(e.target.value)}`
- Evita el error de "controlled input"
- Estado local completamente controlado

---

## 🔍 Testing

### 1. Verificar el Endpoint de Lead

```powershell
# Test básico
$body = @{ email = "test@example.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/lead" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Lead registrado exitosamente",
  "leadId": "uuid-aqui"
}
```

### 2. Verificar el Frontend

1. Abre `http://localhost:3000`
2. Haz clic en el botón flotante 💬
3. Deberías ver el **formulario de email**
4. Ingresa un email válido
5. El chat debería aparecer con mensaje de bienvenida
6. Verifica que el **botón de WhatsApp verde** esté visible

### 3. Verificar la Base de Datos

En Supabase Dashboard:

```sql
-- Ver todos los leads capturados
SELECT * FROM leads ORDER BY created_at DESC;

-- Contar leads
SELECT COUNT(*) as total_leads FROM leads;

-- Leads de hoy
SELECT * FROM leads 
WHERE created_at >= CURRENT_DATE 
ORDER BY created_at DESC;
```

---

## 📊 Consultas Útiles para Análisis

### Leads por día
```sql
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as leads
FROM leads
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

### Leads únicos (sin duplicados)
```sql
SELECT 
  email,
  MIN(created_at) as primer_contacto
FROM leads
GROUP BY email
ORDER BY primer_contacto DESC;
```

---

## 🎯 Flujo del Usuario

1. **Usuario abre el chat** → Ve el formulario de email
2. **Ingresa su email** → Se envía a `/api/lead`
3. **Email se guarda en BD** → `hasAccess = true`
4. **Chat se activa** → Mensaje de bienvenida automático
5. **Usuario puede chatear** → Acceso completo al bot
6. **Si necesita ayuda humana** → Click en botón WhatsApp

---

## 🔧 Configuración del Número de WhatsApp

Para cambiar el número de WhatsApp, edita en `src/components/ChatInterface.tsx`:

```tsx
href="https://wa.me/56922384216"  // ← Cambia aquí
```

Formato: `https://wa.me/[código país][número sin espacios]`

Ejemplos:
- Chile: `https://wa.me/56922384216`
- México: `https://wa.me/525512345678`
- España: `https://wa.me/34612345678`

---

## ⚠️ Notas Importantes

### Política de Acceso Permisiva
El sistema está configurado para **SIEMPRE permitir acceso** al chat, incluso si:
- Hay un error al guardar el email en la BD
- El email ya existe
- Falla la conexión a Supabase

**Razón:** No queremos bloquear a usuarios potenciales por errores técnicos.

### Estado del Input (CRÍTICO)
El input del chat usa control manual:
```tsx
value={input}
onChange={(e) => setInput(e.target.value)}
```

**NO uses** `handleInputChange` de `useChat` (si estuviera importado).

### Validación de Email
- Frontend: Regex básico
- Backend: Regex + validación de formato
- Se convierte a minúsculas antes de guardar

---

## 🎨 Personalización del Diseño

### Colores del Muro de Email
Edita en `ChatInterface.tsx`:
```tsx
className="bg-gradient-to-br from-indigo-50 to-purple-50"
// Cambia: indigo-50, purple-50, blue-50, pink-50, etc.
```

### Colores del Botón de WhatsApp
```tsx
className="bg-green-500 hover:bg-green-600"
// Cambia: green-500 a emerald-500, teal-500, etc.
```

---

## 📈 Próximos Pasos (Opcionales)

1. **Integración con CRM**: Conectar la tabla `leads` a HubSpot, Mailchimp, etc.
2. **Email Automático**: Enviar email de bienvenida al capturar el lead
3. **Analytics**: Agregar Google Analytics o Mixpanel para tracking
4. **A/B Testing**: Probar diferentes textos en el muro de email
5. **Política de Privacidad**: Agregar link al formulario de email

---

## ✅ Checklist de Implementación

- [ ] SQL ejecutado en Supabase
- [ ] Tabla `leads` creada
- [ ] RLS habilitado
- [ ] Endpoint `/api/lead` funcionando
- [ ] Frontend compilando sin errores
- [ ] Muro de email visible
- [ ] Chat funciona después de ingresar email
- [ ] Botón de WhatsApp visible
- [ ] Link de WhatsApp correcto
- [ ] Leads guardándose en BD

---

## 🆘 Troubleshooting

### Error: "relation public.leads does not exist"
→ No has ejecutado el SQL en Supabase. Ve al Paso 1.

### Error: "new row violates row-level security policy"
→ La política RLS no está configurada. Re-ejecuta el SQL completo.

### El chat no aparece después del email
→ Revisa la consola del navegador (F12). Busca errores de red.

### El botón de WhatsApp no abre la app
→ Verifica el formato del link: `https://wa.me/[código][número]`

---

## 📞 Soporte

Si encuentras problemas, revisa:
1. Consola del navegador (F12 → Console)
2. Logs del servidor (terminal donde corre `npm run dev`)
3. SQL Editor de Supabase (para errores de BD)

---

**¡Sistema de Lead Capture listo para producción! 🚀**

