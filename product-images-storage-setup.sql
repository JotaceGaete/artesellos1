-- Crear bucket público para imágenes de productos
-- Ejecutar en el SQL Editor de Supabase si el bucket no se creó automáticamente

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política de lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Nota: el service role (SUPABASE_SERVICE_ROLE_KEY) bypassa RLS,
-- por lo que la API route puede subir archivos sin política adicional.
