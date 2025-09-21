-- Script para actualizar la tabla products con campos de personalización
-- Ejecutar ANTES del script de datos (seed-supabase.sql)

-- =====================================================
-- ACTUALIZAR TABLA PRODUCTS
-- =====================================================

-- Agregar columnas faltantes a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stamp_info JSONB,
ADD COLUMN IF NOT EXISTS customization_options JSONB;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stamp_info', 'customization_options')
ORDER BY column_name;

-- Mensaje de confirmación
SELECT 'Columnas agregadas exitosamente a la tabla products' as mensaje;
