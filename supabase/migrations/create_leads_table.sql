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

-- Comentarios para documentación
COMMENT ON TABLE public.leads IS 'Tabla para almacenar leads capturados del chatbot';
COMMENT ON COLUMN public.leads.email IS 'Email del lead';
COMMENT ON COLUMN public.leads.created_at IS 'Fecha de captura del lead';

