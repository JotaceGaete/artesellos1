-- =====================================================
-- DATOS DE PRUEBA PARA SISTEMA MAYORISTA
-- =====================================================

-- Crear usuarios de prueba (ejecutar después de registrar usuarios en Auth)
-- Este script asume que ya tienes usuarios registrados en auth.users

-- =====================================================
-- USUARIOS Y PERFILES DE PRUEBA
-- =====================================================

-- Actualizar perfil de admin (reemplazar con UUID real)
-- UPDATE profiles SET role = 'ADMIN' WHERE id = 'TU_UUID_ADMIN_AQUI';

-- Actualizar perfil de cliente normal (reemplazar con UUID real)
-- UPDATE profiles SET role = 'CLIENTE' WHERE id = 'TU_UUID_CLIENTE_AQUI';

-- =====================================================
-- CUENTAS MAYORISTAS DE PRUEBA
-- =====================================================

-- Cuenta mayorista aprobada nivel A
INSERT INTO wholesale_accounts (
  user_id,
  rut,
  razon_social,
  nombre_fantasia,
  giro,
  contacto_nombre,
  contacto_email,
  contacto_telefono,
  ciudad,
  status,
  nivel,
  has_credit,
  credit_limit,
  approved_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Reemplazar con UUID real
  '12.345.678-9',
  'Comercial Papelería Ltda.',
  'Papelería Central',
  'Venta de artículos de oficina y papelería',
  'Juan Pérez',
  'juan@papeleriacentral.cl',
  '+56 9 1234 5678',
  'Santiago',
  'approved',
  'A',
  true,
  500000,
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Cuenta mayorista aprobada nivel B
INSERT INTO wholesale_accounts (
  user_id,
  rut,
  razon_social,
  nombre_fantasia,
  giro,
  contacto_nombre,
  contacto_email,
  contacto_telefono,
  ciudad,
  status,
  nivel,
  has_credit,
  credit_limit,
  approved_at
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Reemplazar con UUID real
  '98.765.432-1',
  'Distribuidora Oficina S.A.',
  'Oficina Total',
  'Distribución de insumos de oficina',
  'María González',
  'maria@oficinatotal.cl',
  '+56 9 8765 4321',
  'Valparaíso',
  'approved',
  'B',
  true,
  300000,
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Cuenta mayorista pendiente
INSERT INTO wholesale_accounts (
  user_id,
  rut,
  razon_social,
  nombre_fantasia,
  giro,
  contacto_nombre,
  contacto_email,
  contacto_telefono,
  ciudad,
  status,
  nivel,
  has_credit,
  credit_limit
) VALUES (
  '00000000-0000-0000-0000-000000000003', -- Reemplazar con UUID real
  '11.222.333-4',
  'Librería Universidad Ltda.',
  'Librería Campus',
  'Venta de libros y artículos universitarios',
  'Carlos Rodríguez',
  'carlos@libreriacampus.cl',
  '+56 9 1122 3344',
  'Concepción',
  'pending',
  NULL,
  false,
  0
) ON CONFLICT (user_id) DO NOTHING;

-- Cuenta mayorista rechazada
INSERT INTO wholesale_accounts (
  user_id,
  rut,
  razon_social,
  nombre_fantasia,
  giro,
  contacto_nombre,
  contacto_email,
  contacto_telefono,
  ciudad,
  status,
  nivel,
  has_credit,
  credit_limit,
  rejection_reason
) VALUES (
  '00000000-0000-0000-0000-000000000004', -- Reemplazar con UUID real
  '44.555.666-7',
  'Comercial Dudosa EIRL',
  'Negocio Raro',
  'Actividad no especificada',
  'Pedro Sospechoso',
  'pedro@negocioraro.cl',
  NULL,
  'Lugar Desconocido',
  'rejected',
  NULL,
  false,
  0,
  'RUT no válido y actividad comercial no verificable. Por favor, proporciona documentación que acredite tu actividad comercial legal.'
) ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- PRECIOS MAYORISTAS DE PRODUCTOS
-- =====================================================

-- Precios específicos para algunos productos
INSERT INTO product_prices (product_id, wholesale_price) VALUES
  ('1', 18000),  -- Timbre Amor Eterno: retail $25.000 -> wholesale $18.000
  ('2', 20000),  -- Timbre Navidad: retail $26.000 -> wholesale $20.000  
  ('3', 15000)   -- Timbre Cumpleaños: retail $22.000 -> wholesale $15.000
ON CONFLICT (product_id) DO UPDATE SET
  wholesale_price = EXCLUDED.wholesale_price,
  updated_at = NOW();

-- Productos con nivel override (usan descuento específico en lugar del nivel del usuario)
INSERT INTO product_prices (product_id, nivel_override) VALUES
  ('4', 'C'),  -- Este producto siempre usa descuento nivel C (20%), independiente del nivel del usuario
  ('5', 'B')   -- Este producto siempre usa descuento nivel B (25%)
ON CONFLICT (product_id) DO UPDATE SET
  nivel_override = EXCLUDED.nivel_override,
  updated_at = NOW();

-- =====================================================
-- TRABAJOS PERSONALIZADOS DE PRUEBA
-- =====================================================

-- Trabajo personalizado en borrador
INSERT INTO custom_jobs (
  user_id,
  wholesale_account_id,
  stamp_size,
  text_content,
  ink_color,
  quantity,
  reference,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Usuario mayorista nivel A
  (SELECT id FROM wholesale_accounts WHERE rut = '12.345.678-9'),
  '40mm x 20mm',
  'PAPELERÍA CENTRAL\nJuan Pérez - Gerente\nTeléfono: +56 9 1234 5678',
  'Azul',
  50,
  'PC-001',
  'draft'
) ON CONFLICT DO NOTHING;

-- Trabajo personalizado cotizado
INSERT INTO custom_jobs (
  user_id,
  wholesale_account_id,
  stamp_size,
  text_content,
  ink_color,
  quantity,
  reference,
  status,
  quoted_price,
  quoted_at
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Usuario mayorista nivel B
  (SELECT id FROM wholesale_accounts WHERE rut = '98.765.432-1'),
  '35mm x 15mm',
  'OFICINA TOTAL\nwww.oficinatotal.cl',
  'Negro',
  25,
  'OT-002',
  'quoted',
  125000,
  NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- ARCHIVOS DE ARTE DE PRUEBA
-- =====================================================

-- Archivo aprobado
INSERT INTO art_files (
  job_id,
  user_id,
  filename,
  storage_key,
  mime_type,
  size_bytes,
  validations,
  status,
  admin_notes,
  reviewed_at
) VALUES (
  (SELECT id FROM custom_jobs WHERE reference = 'PC-001'),
  '00000000-0000-0000-0000-000000000001',
  'logo-papeleria-central.pdf',
  '00000000-0000-0000-0000-000000000001/1234567890.pdf',
  'application/pdf',
  245760, -- ~240KB
  '{
    "dpi": 600,
    "is_vector": true,
    "is_single_color": true,
    "has_transparency": false,
    "size_mb": 0.24
  }',
  'ok',
  'Archivo perfecto. Cumple con todos los requisitos técnicos.',
  NOW()
) ON CONFLICT DO NOTHING;

-- Archivo que necesita corrección
INSERT INTO art_files (
  job_id,
  user_id,
  filename,
  storage_key,
  mime_type,
  size_bytes,
  validations,
  status,
  admin_notes,
  customer_message,
  reviewed_at
) VALUES (
  (SELECT id FROM custom_jobs WHERE reference = 'OT-002'),
  '00000000-0000-0000-0000-000000000002',
  'logo-oficina-total.png',
  '00000000-0000-0000-0000-000000000002/1234567891.png',
  'image/png',
  1048576, -- 1MB
  '{
    "dpi": 300,
    "is_vector": false,
    "is_single_color": false,
    "has_transparency": true,
    "dimensions": {"width": 800, "height": 600},
    "size_mb": 1.0
  }',
  'corregir',
  'Archivo necesita ajustes: baja resolución (300 DPI, necesita 600+), múltiples colores (debe ser 1 color), tiene transparencias (debe ser opaco).',
  'Hola! Tu archivo necesita algunos ajustes técnicos. Por favor, sube una nueva versión con: 1) Resolución mínima 600 DPI, 2) Un solo color (negro), 3) Sin transparencias. Si tienes dudas, contáctanos.',
  NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================
-- ÓRDENES MAYORISTAS DE PRUEBA
-- =====================================================

-- Orden mayorista completada
INSERT INTO orders (
  user_id,
  customer_email,
  customer_name,
  status,
  total,
  subtotal,
  tax_amount,
  shipping_amount,
  discount_amount,
  currency,
  payment_method,
  order_type,
  wholesale_account_id,
  discount_percentage,
  margin_percentage,
  invoice_rut,
  invoice_razon_social
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'juan@papeleriacentral.cl',
  'Juan Pérez',
  'delivered',
  108000,   -- Total con descuento
  90000,    -- Subtotal (retail: $150.000, con 30% desc: $105.000, + shipping: $15.000)
  17100,    -- IVA 19%
  15000,    -- Envío
  45000,    -- Descuento aplicado (30% de $150.000)
  'CLP',
  'transfer',
  'WHOLESALE',
  (SELECT id FROM wholesale_accounts WHERE rut = '12.345.678-9'),
  30.00,    -- 30% descuento nivel A
  42860,    -- Margen sobre precio mayorista
  '12.345.678-9',
  'Comercial Papelería Ltda.'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- CONFIGURACIÓN MAYORISTA
-- =====================================================

-- Actualizar configuración por defecto
UPDATE wholesale_config SET
  level_discounts = '{
    "A": 30,
    "B": 25, 
    "C": 20
  }'::jsonb,
  min_order_quantity = 5,
  file_validations = '{
    "max_size_mb": 10,
    "max_files_per_item": 3,
    "accepted_mimes": ["application/pdf", "image/svg+xml", "image/png", "image/jpeg"],
    "min_dpi": 600,
    "min_dimensions": {"width": 1200, "height": 1200}
  }'::jsonb,
  payment_methods = '{
    "transfer": true,
    "mercado_pago": true,
    "credit": true
  }'::jsonb,
  updated_at = NOW();

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT 'Datos de prueba del sistema mayorista cargados exitosamente.' as mensaje;

-- =====================================================
-- INSTRUCCIONES PARA USAR LOS DATOS DE PRUEBA
-- =====================================================

/*
PASOS PARA ACTIVAR LOS DATOS DE PRUEBA:

1. Registra usuarios reales en tu aplicación
2. Copia los UUIDs de los usuarios desde auth.users
3. Reemplaza los UUIDs de prueba (00000000-0000-0000-0000-000000000001, etc.) con los UUIDs reales
4. Ejecuta este script en Supabase SQL Editor

CUENTAS DE PRUEBA CREADAS:
- Mayorista Nivel A (30% desc): Papelería Central (RUT: 12.345.678-9)
- Mayorista Nivel B (25% desc): Oficina Total (RUT: 98.765.432-1)  
- Mayorista Pendiente: Librería Campus (RUT: 11.222.333-4)
- Mayorista Rechazado: Negocio Raro (RUT: 44.555.666-7)

PRODUCTOS CON PRECIOS MAYORISTAS:
- Producto ID 1: Precio retail variable → Precio mayorista $18
- Producto ID 2: Precio retail variable → Precio mayorista $20
- Producto ID 3: Precio retail variable → Precio mayorista $15
- Producto ID 4: Siempre descuento nivel C (20%) independiente del usuario
- Producto ID 5: Siempre descuento nivel B (25%) independiente del usuario

TRABAJOS PERSONALIZADOS:
- PC-001: Borrador para Papelería Central
- OT-002: Cotizado para Oficina Total

ARCHIVOS DE ARTE:
- logo-papeleria-central.pdf: Aprobado ✅
- logo-oficina-total.png: Necesita corrección ❌
*/
