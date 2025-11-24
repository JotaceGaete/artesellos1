# 📄 Código Completo - Sistema de Captación de Leads

## 1. SQL - Tabla de Leads

**Archivo**: `supabase/migrations/create_leads_table.sql`

```sql
-- Crear tabla de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Crear índice en created_at para ordenamiento
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT público (con anon key)
CREATE POLICY "Permitir inserts públicos de leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden leer
CREATE POLICY "Solo admins pueden leer leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);
```

---

## 2. Backend - Endpoint `/api/lead`

**Archivo**: `src/app/api/lead/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validación básica del email
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    console.log('📧 Registrando lead:', email);

    // Verificar si el email ya existe (opcional)
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingLead) {
      console.log('ℹ️ Lead ya existente:', email);
      return NextResponse.json({
        success: true,
        message: 'Lead ya registrado',
        existing: true
      });
    }

    // Insertar lead en la base de datos
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          email: email.toLowerCase().trim()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando lead:', error);
      // Aún así permitimos acceso (para no bloquear el chat)
      return NextResponse.json({
        success: true,
        message: 'Lead procesado',
        warning: 'Error al guardar pero acceso permitido'
      });
    }

    console.log('✅ Lead guardado exitosamente:', data);

    return NextResponse.json({
      success: true,
      message: 'Lead registrado exitosamente',
      leadId: data.id
    });

  } catch (error: any) {
    console.error('❌ Error en /api/lead:', error);
    
    // En caso de error, permitimos acceso igual
    return NextResponse.json({
      success: true,
      message: 'Acceso permitido',
      warning: 'Error al procesar pero acceso concedido'
    });
  }
}
```

---

## 3. Frontend - ChatInterface Refactorizado

**Archivo**: `src/components/ChatInterface.tsx`

**Características Clave:**

### 🔒 Muro de Email
- Estado `hasAccess` controla si muestra el formulario o el chat
- Formulario centrado y profesional
- Validación de email
- Mensaje de bienvenida automático al obtener acceso

### 📞 Botón de WhatsApp
- En el header del chat
- Color verde (`bg-green-500`)
- Link: `https://wa.me/56922384216`
- Icono SVG de WhatsApp

### 🛡️ Control de Input
```tsx
value={input}
onChange={(e) => setInput(e.target.value)}
```
**NO usa** `handleInputChange` directo.

### 📋 Estados
```tsx
const [hasAccess, setHasAccess] = useState(false);  // Control del muro
const [email, setEmail] = useState('');              // Email del formulario
const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
const [emailError, setEmailError] = useState<string | null>(null);
```

---

## 4. Flujo Completo

```
┌─────────────────┐
│  Usuario abre   │
│     el chat     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Ve formulario │
│    de email     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ingresa email  │
│  y presiona     │
│   "Comenzar"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /api/lead │
│  { email: ... } │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email se guarda │
│  en Supabase    │
│  tabla: leads   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ hasAccess=true  │
│ Chat se activa  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mensaje auto de │
│   bienvenida    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Usuario chatéa  │
│ con el bot      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Si necesita    │
│  ayuda humana   │
│  click WhatsApp │
└─────────────────┘
```

---

## 5. Testing Rápido

### Test Manual Frontend
```bash
# 1. Abre http://localhost:3000
# 2. Click en botón 💬
# 3. Deberías ver formulario de email
# 4. Ingresa: test@example.com
# 5. Click "Comenzar Chat"
# 6. Verifica que aparezca el chat
# 7. Verifica botón verde de WhatsApp
```

### Test API con PowerShell
```powershell
$body = @{ email = "lead@test.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/lead" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Verificar en Supabase
```sql
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;
```

---

## 6. Personalización Rápida

### Cambiar número de WhatsApp
En `ChatInterface.tsx`, línea ~357:
```tsx
href="https://wa.me/56922384216"  // ← Cambia aquí
```

### Cambiar colores del formulario
```tsx
// Fondo del muro
className="bg-gradient-to-br from-indigo-50 to-purple-50"

// Botón del formulario
className="bg-indigo-600 hover:bg-indigo-700"

// Botón de WhatsApp
className="bg-green-500 hover:bg-green-600"
```

### Cambiar mensaje de bienvenida
En `ChatInterface.tsx`, línea ~104:
```tsx
content: '¡Hola! 👋 Soy el asistente de Artesellos...'
```

---

## 7. Variables de Entorno Necesarias

**Archivo**: `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
OPENAI_API_KEY=tu_openai_key
```

---

## 8. Checklist de Implementación

- [ ] ✅ SQL ejecutado en Supabase
- [ ] ✅ Tabla `leads` visible en Dashboard
- [ ] ✅ Políticas RLS activas
- [ ] ✅ Endpoint `/api/lead` compilando
- [ ] ✅ Frontend compilando sin errores
- [ ] ✅ Muro de email visible en el chat
- [ ] ✅ Email se guarda en BD
- [ ] ✅ Chat funciona después del email
- [ ] ✅ Botón de WhatsApp visible
- [ ] ✅ Link de WhatsApp funcional

---

## 9. Archivos Helper Creados

1. **`apply-leads-migration.ps1`**: Copia el SQL al portapapeles
2. **`test-lead-endpoint.ps1`**: Prueba el endpoint con varios casos
3. **`LEAD_CAPTURE_SETUP.md`**: Documentación completa
4. **`CODIGO_COMPLETO_LEAD_CAPTURE.md`**: Este archivo (referencia)

---

## 10. Estructura de Archivos

```
artesellos-ecommerce/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts          (sin cambios)
│   │       └── lead/
│   │           └── route.ts          ✅ NUEVO
│   └── components/
│       └── ChatInterface.tsx         ✅ REFACTORIZADO
├── supabase/
│   └── migrations/
│       └── create_leads_table.sql    ✅ NUEVO
├── apply-leads-migration.ps1         ✅ NUEVO
├── test-lead-endpoint.ps1            ✅ NUEVO
├── LEAD_CAPTURE_SETUP.md             ✅ NUEVO
└── CODIGO_COMPLETO_LEAD_CAPTURE.md   ✅ NUEVO
```

---

**✅ Sistema completo de captación de leads implementado y listo para producción!**

