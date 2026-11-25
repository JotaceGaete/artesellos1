-- Tabla para configuración del panel admin
-- Almacena la contraseña y otras configuraciones sensibles del lado del servidor

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

-- Contraseña inicial del admin (cambiar por SQL en Supabase cuando sea necesario)
INSERT INTO admin_settings (key, value)
VALUES ('admin_password', 'artesellos2024')
ON CONFLICT (key) DO NOTHING;

-- Para cambiar la contraseña, ejecutar en Supabase SQL editor:
-- UPDATE admin_settings SET value = 'nueva_contraseña', updated_at = now() WHERE key = 'admin_password';
