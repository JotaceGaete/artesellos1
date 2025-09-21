-- =====================================================
-- EMAIL SYSTEM SETUP - RECEIVE_ONLY MODE
-- =====================================================
-- Script para crear las tablas del sistema de email
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- TABLA: contact_messages
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- RLS para contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver todos los mensajes
CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Todos pueden insertar mensajes de contacto
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- TABLA: mail_log
-- =====================================================
CREATE TABLE IF NOT EXISTS mail_log (
  id BIGSERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  payload_json JSONB,
  status TEXT NOT NULL DEFAULT 'skipped_receive_only',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mail_log
CREATE INDEX IF NOT EXISTS idx_mail_log_created_at ON mail_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_log_status ON mail_log(status);
CREATE INDEX IF NOT EXISTS idx_mail_log_to_email ON mail_log(to_email);

-- RLS para mail_log
ALTER TABLE mail_log ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver logs de email
CREATE POLICY "Admins can view mail logs" ON mail_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Solo el sistema puede insertar logs
CREATE POLICY "System can insert mail logs" ON mail_log
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- EXTENDER TABLA: wholesale_requests (si no existe)
-- =====================================================
-- Verificar si ya existe la tabla wholesale_requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wholesale_requests') THEN
        CREATE TABLE wholesale_requests (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          company TEXT NOT NULL,
          rut TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          city TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Índices para wholesale_requests
        CREATE INDEX idx_wholesale_requests_user_id ON wholesale_requests(user_id);
        CREATE INDEX idx_wholesale_requests_status ON wholesale_requests(status);
        CREATE INDEX idx_wholesale_requests_created_at ON wholesale_requests(created_at DESC);
        
        -- RLS para wholesale_requests
        ALTER TABLE wholesale_requests ENABLE ROW LEVEL SECURITY;
        
        -- Los usuarios pueden ver sus propias solicitudes
        CREATE POLICY "Users can view their own wholesale requests" ON wholesale_requests
          FOR SELECT USING (auth.uid() = user_id);
        
        -- Los admins pueden ver todas las solicitudes
        CREATE POLICY "Admins can view all wholesale requests" ON wholesale_requests
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'ADMIN'
            )
          );
        
        -- Los usuarios autenticados pueden crear solicitudes
        CREATE POLICY "Authenticated users can create wholesale requests" ON wholesale_requests
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Solo admins pueden actualizar solicitudes
        CREATE POLICY "Admins can update wholesale requests" ON wholesale_requests
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- =====================================================
-- TABLA: art_files
-- =====================================================
CREATE TABLE IF NOT EXISTS art_files (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT REFERENCES wholesale_requests(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL, -- Key en Supabase Storage
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  checks_json JSONB, -- Validaciones de archivo (DPI, dimensiones, etc.)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ok', 'corregir')),
  upload_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para art_files
CREATE INDEX IF NOT EXISTS idx_art_files_request_id ON art_files(request_id);
CREATE INDEX IF NOT EXISTS idx_art_files_status ON art_files(status);
CREATE INDEX IF NOT EXISTS idx_art_files_upload_user_id ON art_files(upload_user_id);
CREATE INDEX IF NOT EXISTS idx_art_files_created_at ON art_files(created_at DESC);

-- RLS para art_files
ALTER TABLE art_files ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver archivos de sus propias solicitudes
CREATE POLICY "Users can view their own art files" ON art_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wholesale_requests 
      WHERE wholesale_requests.id = art_files.request_id 
      AND wholesale_requests.user_id = auth.uid()
    )
  );

-- Los admins pueden ver todos los archivos
CREATE POLICY "Admins can view all art files" ON art_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Los usuarios pueden subir archivos a sus propias solicitudes
CREATE POLICY "Users can upload to their own requests" ON art_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wholesale_requests 
      WHERE wholesale_requests.id = art_files.request_id 
      AND wholesale_requests.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para wholesale_requests
DROP TRIGGER IF EXISTS update_wholesale_requests_updated_at ON wholesale_requests;
CREATE TRIGGER update_wholesale_requests_updated_at
    BEFORE UPDATE ON wholesale_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para art_files
DROP TRIGGER IF EXISTS update_art_files_updated_at ON art_files;
CREATE TRIGGER update_art_files_updated_at
    BEFORE UPDATE ON art_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONFIGURACIÓN DE STORAGE
-- =====================================================
-- Crear bucket para archivos (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'art-files',
  'art-files',
  false, -- bucket privado
  10485760, -- 10 MB límite
  ARRAY['application/pdf', 'image/svg+xml', 'application/postscript', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para art-files
CREATE POLICY "Users can upload art files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'art-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own art files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'art-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all art files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'art-files' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('contact_messages', 'mail_log', 'wholesale_requests', 'art_files')
ORDER BY table_name, ordinal_position;

-- Mensaje de confirmación
SELECT 'Sistema de email configurado exitosamente en modo receive_only' as mensaje;
