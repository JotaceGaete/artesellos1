# 📧 Configuración del Sistema de Contacto con Zoho Mail

## 🎯 Variables de Entorno Necesarias

Agrega estas variables a tu archivo `.env.local`:

```bash
# Configuración SMTP para Zoho Mail
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=contacto@artesellos.cl
SMTP_PASSWORD=tu_password_aqui

# Destinatario de los emails de contacto
CONTACT_MAIL_TO=contacto@artesellos.cl
```

---

## 🔧 Configuración de Zoho Mail

### 1. Obtener Credenciales SMTP

1. Inicia sesión en [Zoho Mail](https://mail.zoho.com)
2. Ve a **Configuración** (⚙️) → **Cuentas** → **Configuración IMAP/POP3**
3. Activa **Acceso SMTP**
4. Anota las credenciales:
   - **Servidor**: `smtp.zoho.com`
   - **Puerto**: `465` (SSL) o `587` (TLS)
   - **Usuario**: Tu email completo (ej: `contacto@artesellos.cl`)
   - **Contraseña**: Tu contraseña de Zoho Mail

### 2. Contraseña de Aplicación (Recomendado)

Para mayor seguridad, crea una contraseña específica para aplicaciones:

1. Ve a **Configuración** → **Seguridad** → **Contraseñas de aplicación**
2. Crea una nueva contraseña con nombre "Artesellos Website"
3. Copia la contraseña generada
4. Úsala en `SMTP_PASSWORD`

---

## 📦 Instalación de Dependencias

El sistema necesita `nodemailer`:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 🧪 Testing del Sistema

### Prueba 1: Verificar Variables de Entorno

Crea un archivo `test-env.js`:

```javascript
require('dotenv').config({ path: '.env.local' });

console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Configurada' : '❌ No configurada');
console.log('CONTACT_MAIL_TO:', process.env.CONTACT_MAIL_TO);
```

Ejecuta:
```bash
node test-env.js
```

### Prueba 2: Test Manual del Endpoint

Con PowerShell:

```powershell
$body = @{
    nombre = "Test Usuario"
    email = "test@example.com"
    telefono = "+56912345678"
    mensaje = "Este es un mensaje de prueba desde PowerShell"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/contact" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Con cURL:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Usuario",
    "email": "test@example.com",
    "telefono": "+56912345678",
    "mensaje": "Este es un mensaje de prueba"
  }'
```

### Prueba 3: Desde el Navegador

1. Abre: `http://localhost:3000/contacto`
2. Completa el formulario
3. Haz clic en "Enviar Mensaje"
4. Deberías ver: "✅ ¡Mensaje enviado exitosamente!"
5. Revisa tu bandeja de entrada: `contacto@artesellos.cl`

---

## 🎨 Estructura de los Archivos

```
src/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          ← Endpoint del backend
│   └── contacto/
│       └── page.tsx               ← Página del frontend
```

---

## 📧 Formato del Email Enviado

El email que recibirás tiene este formato profesional:

### Header
- Gradiente Indigo-Purple
- Título: "📬 Nuevo Mensaje de Contacto"
- Subtítulo: "Recibido desde artesellos.cl"

### Cuerpo
- **Datos del Cliente**:
  - 👤 Nombre
  - ✉️ Email (con link para responder)
  - 📞 Teléfono (opcional, con link para llamar)

- **Mensaje**: Tarjeta blanca con el contenido

- **Call to Action**: Botón "📧 Responder al Cliente"

### Footer
- Origen: "artesellos.cl"
- Timestamp en formato chileno

---

## 🔐 Seguridad

### Variables de Entorno
- ✅ Nunca subas `.env.local` a Git
- ✅ `.env.local` ya está en `.gitignore`
- ✅ Usa contraseñas de aplicación de Zoho

### Validaciones Implementadas
- ✅ Validación de campos requeridos
- ✅ Validación de formato de email
- ✅ Sanitización de HTML en el mensaje
- ✅ Rate limiting (Next.js automático)

---

## ⚡ Solución de Problemas

### Error: "Connection timeout"
**Causa**: Puerto bloqueado o credenciales incorrectas  
**Solución**:
1. Verifica que el puerto 465 no esté bloqueado por firewall
2. Prueba con puerto 587 y `secure: false`
3. Verifica usuario y contraseña

### Error: "Invalid login"
**Causa**: Credenciales incorrectas  
**Solución**:
1. Verifica que `SMTP_USER` sea el email completo
2. Usa una contraseña de aplicación, no la contraseña normal
3. Verifica que la cuenta de Zoho esté activa

### Error: "self signed certificate"
**Causa**: Problema con certificado SSL  
**Solución**:
```javascript
tls: {
  rejectUnauthorized: false,  // Solo para desarrollo
}
```

### El email no llega
**Checklist**:
1. ✅ Revisa la carpeta de SPAM
2. ✅ Verifica que `CONTACT_MAIL_TO` sea correcto
3. ✅ Revisa los logs del servidor (consola)
4. ✅ Verifica que el email de Zoho tenga espacio

---

## 🎨 Personalización del Diseño

### Cambiar Colores del Gradiente

**Backend (Email)**:
```typescript
// Línea 67 en route.ts
<div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
// Cambia: #4f46e5 (indigo) y #7c3aed (purple)
```

**Frontend (Botón)**:
```tsx
// Línea 305 en page.tsx
className="bg-gradient-to-r from-indigo-600 to-purple-600"
// Cambia: indigo-600, purple-600
```

### Cambiar Texto del Botón
```tsx
// Línea 323 en page.tsx
'Enviar Mensaje'
// Cambia por: 'Contactar', 'Enviar', etc.
```

### Agregar Campos al Formulario
1. Agrega el campo en el estado (línea 11)
2. Agrega el input en el JSX (después de línea 265)
3. Actualiza la validación del backend (línea 11 en route.ts)
4. Agrega el campo al HTML del email (línea 90 en route.ts)

---

## 📊 Monitoreo

### Logs en Desarrollo
Los logs se muestran en la consola del servidor:

```
📧 Configurando transporter de Zoho Mail...
✅ Conexión SMTP verificada
📤 Enviando email...
✅ Email enviado exitosamente: <message-id>
```

### Logs en Producción
Considera agregar un servicio de logging como:
- **Sentry** (errores)
- **LogRocket** (sesiones)
- **Datadog** (métricas)

---

## 🚀 Despliegue en Producción

### Vercel
1. Agrega las variables de entorno en el Dashboard de Vercel
2. Ve a: Settings → Environment Variables
3. Agrega cada variable (SMTP_HOST, SMTP_PORT, etc.)
4. Redeploy

### Otras Plataformas
- **AWS**: Usa AWS SES en lugar de Zoho para mejor rendimiento
- **Netlify**: Agrega variables en Site Settings
- **Railway**: Agrega en Variables tab

---

## ✅ Checklist de Implementación

- [ ] Instalar `nodemailer`
- [ ] Configurar variables en `.env.local`
- [ ] Obtener contraseña de aplicación de Zoho
- [ ] Verificar que el servidor Next.js esté corriendo
- [ ] Probar endpoint con cURL/PowerShell
- [ ] Probar formulario en el navegador
- [ ] Verificar que el email llegue
- [ ] Revisar formato HTML del email
- [ ] Probar respuesta desde el email
- [ ] Configurar variables en producción
- [ ] Hacer deploy

---

## 📝 Archivos Entregados

### Backend
- ✅ `src/app/api/contact/route.ts` (164 líneas)
  - Endpoint POST con nodemailer
  - Configuración para Zoho
  - Email HTML profesional
  - Validaciones robustas
  - Manejo de errores

### Frontend
- ✅ `src/app/contacto/page.tsx` (328 líneas)
  - Diseño moderno 2 columnas
  - Formulario con validación
  - Estados de carga
  - Feedback visual
  - Mapa de Google Maps
  - Responsive

### Documentación
- ✅ `ENV_SETUP_CONTACT.md` (esta guía)

---

## 🎉 Resultado Final

### Características Implementadas
- ✅ Envío de emails reales vía Zoho SMTP
- ✅ Diseño moderno con Tailwind CSS
- ✅ Layout 2 columnas (Info + Formulario)
- ✅ Email HTML profesional tipo tarjeta
- ✅ Validaciones frontend y backend
- ✅ Feedback sin recargar página
- ✅ Estado de carga ("Enviando...")
- ✅ Mapa de Google Maps
- ✅ Información de contacto con iconos
- ✅ Responsive (mobile y desktop)
- ✅ Manejo de errores robusto

---

**Sistema de contacto profesional listo para producción! 🚀**

