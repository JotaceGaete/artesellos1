-- Tabla para configuración del panel admin
-- Almacena el hash de la contraseña y otras configuraciones sensibles del lado del servidor

CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- RLS activado: ningún usuario anónimo ni autenticado puede leer esta tabla.
-- Solo el service role (usado en las API routes del servidor) tiene acceso.
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Sin políticas = sin acceso para roles anónimos o authenticated.
-- El service role de Supabase ignora RLS por defecto.

-- Contraseña del admin: NO se guarda en texto plano en el repositorio.
-- 1) Generar el hash en tu computador (no se envía a la red):
--      node scripts/hash-admin-password.mjs
-- 2) Guardar el hash en Supabase SQL editor (reemplazar <HASH>):
--      INSERT INTO admin_settings (key, value) VALUES ('admin_password_hash', '<HASH>')
--      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
-- Si existe 'admin_password_hash', el login lo usa en lugar de 'admin_password'.
-- Migración completa y reversión: ver docs/migracion-hash-admin.md
