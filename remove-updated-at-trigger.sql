-- ============================================
-- REMOVER TRIGGER QUE CAUSA ERROR CON updated_at
-- ============================================

-- Si existe un trigger que intenta actualizar updated_at, eliminarlo
DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;

-- Si la función del trigger ya no se usa, también se puede eliminar (opcional)
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- Verificar que el trigger fue eliminado
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'knowledge_base';

