-- =====================================================
-- TABLA PARA MENSAJES DE CONTACTO
-- =====================================================
-- Ejecutar en Supabase SQL Editor

-- Crear tabla contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  mensaje TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'responded', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT a todos (para el formulario público)
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden ver mensajes
CREATE POLICY "Authenticated users can view contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo usuarios autenticados pueden actualizar mensajes
CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_contact_messages_updated_at_trigger ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at_trigger
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Verificar que se creó correctamente
SELECT 'Tabla contact_messages creada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_mensajes FROM contact_messages;

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los mensajes pendientes
-- SELECT * FROM contact_messages WHERE status = 'pending' ORDER BY created_at DESC;

-- Ver todos los mensajes
-- SELECT * FROM contact_messages ORDER BY created_at DESC;

-- Marcar mensaje como leído
-- UPDATE contact_messages SET status = 'read' WHERE id = 1;

-- Marcar mensaje como respondido
-- UPDATE contact_messages SET status = 'responded' WHERE id = 1;

-- Archivar mensaje
-- UPDATE contact_messages SET status = 'archived' WHERE id = 1;

-- Eliminar mensajes antiguos (más de 1 año)
-- DELETE FROM contact_messages WHERE created_at < NOW() - INTERVAL '1 year' AND status = 'archived';

