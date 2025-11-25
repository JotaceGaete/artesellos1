-- ============================================
-- FIX: Agregar columnas faltantes a knowledge_base
-- ============================================

-- Si la tabla existe pero le faltan las columnas created_at y updated_at,
-- ejecuta estos comandos:

-- Agregar columna created_at si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE knowledge_base 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Agregar columna updated_at si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE knowledge_base 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Actualizar registros existentes que tengan NULL en estas columnas
UPDATE knowledge_base 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE knowledge_base 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'knowledge_base'
ORDER BY ordinal_position;

