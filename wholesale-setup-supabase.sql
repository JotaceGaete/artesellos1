-- =====================================================
-- SCHEMA EXTENSION PARA SISTEMA MAYORISTA
-- =====================================================

-- Crear tipo ENUM para roles de usuario
CREATE TYPE user_role AS ENUM ('ANON', 'CLIENTE', 'COMERCIO', 'ADMIN');

-- Crear tipo ENUM para estados de cuenta mayorista
CREATE TYPE wholesale_status AS ENUM ('pending', 'approved', 'rejected');

-- Crear tipo ENUM para niveles de precio
CREATE TYPE price_level AS ENUM ('A', 'B', 'C');

-- Crear tipo ENUM para tipos de orden
CREATE TYPE order_type AS ENUM ('RETAIL', 'WHOLESALE');

-- Crear tipo ENUM para estados de archivo
CREATE TYPE file_status AS ENUM ('pending', 'ok', 'corregir');

-- =====================================================
-- EXTENDER TABLA PROFILES CON ROLES
-- =====================================================

-- Agregar columna role a la tabla profiles existente
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'CLIENTE';

-- Crear índice para consultas por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- TABLA WHOLESALE_ACCOUNTS (Cuentas Mayoristas)
-- =====================================================

CREATE TABLE IF NOT EXISTS wholesale_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  nombre_fantasia VARCHAR(255),
  giro VARCHAR(255) NOT NULL,
  contacto_nombre VARCHAR(255) NOT NULL,
  contacto_email VARCHAR(255) NOT NULL,
  contacto_telefono VARCHAR(50),
  ciudad VARCHAR(100) NOT NULL,
  comprobante_url TEXT,
  status wholesale_status DEFAULT 'pending' NOT NULL,
  nivel price_level,
  has_credit BOOLEAN DEFAULT false,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para wholesale_accounts
CREATE INDEX idx_wholesale_accounts_user_id ON wholesale_accounts(user_id);
CREATE INDEX idx_wholesale_accounts_status ON wholesale_accounts(status);
CREATE INDEX idx_wholesale_accounts_rut ON wholesale_accounts(rut);

-- =====================================================
-- TABLA PRODUCT_PRICES (Precios por Producto)
-- =====================================================

CREATE TABLE IF NOT EXISTS product_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL, -- Referencia a products.id (string en tu caso)
  wholesale_price DECIMAL(10,2), -- Precio específico mayorista
  nivel_override price_level, -- Nivel específico para este producto
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint para evitar duplicados
  UNIQUE(product_id)
);

-- Índices para product_prices
CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);

-- =====================================================
-- TABLA CUSTOM_JOBS (Trabajos Personalizados)
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wholesale_account_id UUID REFERENCES wholesale_accounts(id) ON DELETE CASCADE NOT NULL,
  stamp_size VARCHAR(50) NOT NULL,
  text_content TEXT NOT NULL,
  ink_color VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reference VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'approved', 'in_production', 'completed')),
  quoted_price DECIMAL(10,2),
  quoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para custom_jobs
CREATE INDEX idx_custom_jobs_user_id ON custom_jobs(user_id);
CREATE INDEX idx_custom_jobs_wholesale_account_id ON custom_jobs(wholesale_account_id);
CREATE INDEX idx_custom_jobs_status ON custom_jobs(status);

-- =====================================================
-- TABLA ART_FILES (Archivos de Arte)
-- =====================================================

CREATE TABLE IF NOT EXISTS art_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID, -- Referencia a order_items si existe
  job_id UUID REFERENCES custom_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL, -- Path en Supabase Storage
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  validations JSONB NOT NULL, -- Validaciones técnicas del archivo
  status file_status DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  customer_message TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: debe tener job_id O order_item_id
  CHECK ((job_id IS NOT NULL AND order_item_id IS NULL) OR (job_id IS NULL AND order_item_id IS NOT NULL))
);

-- Índices para art_files
CREATE INDEX idx_art_files_user_id ON art_files(user_id);
CREATE INDEX idx_art_files_job_id ON art_files(job_id);
CREATE INDEX idx_art_files_status ON art_files(status);
CREATE INDEX idx_art_files_storage_key ON art_files(storage_key);

-- =====================================================
-- TABLA WHOLESALE_CONFIG (Configuración Global)
-- =====================================================

CREATE TABLE IF NOT EXISTS wholesale_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_discounts JSONB NOT NULL DEFAULT '{"A": 30, "B": 25, "C": 20}', -- Descuentos por nivel
  min_order_quantity INTEGER DEFAULT 1,
  file_validations JSONB NOT NULL DEFAULT '{
    "max_size_mb": 10,
    "max_files_per_item": 3,
    "accepted_mimes": ["application/pdf", "image/svg+xml", "image/png", "image/jpeg"],
    "min_dpi": 600,
    "min_dimensions": {"width": 1200, "height": 1200}
  }',
  payment_methods JSONB NOT NULL DEFAULT '{
    "transfer": true,
    "mercado_pago": true,
    "credit": true
  }',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insertar configuración por defecto
INSERT INTO wholesale_config (level_discounts, min_order_quantity, file_validations, payment_methods)
VALUES (
  '{"A": 30, "B": 25, "C": 20}',
  1,
  '{
    "max_size_mb": 10,
    "max_files_per_item": 3,
    "accepted_mimes": ["application/pdf", "image/svg+xml", "image/png", "image/jpeg"],
    "min_dpi": 600,
    "min_dimensions": {"width": 1200, "height": 1200}
  }',
  '{"transfer": true, "mercado_pago": true, "credit": true}'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- EXTENDER TABLA ORDERS (si existe)
-- =====================================================

-- Si la tabla orders ya existe, agregar columnas para mayoristas
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_type order_type DEFAULT 'RETAIL',
ADD COLUMN IF NOT EXISTS wholesale_account_id UUID REFERENCES wholesale_accounts(id),
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS invoice_rut VARCHAR(20),
ADD COLUMN IF NOT EXISTS invoice_razon_social VARCHAR(255);

-- Índices para orders extendidas
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_wholesale_account_id ON orders(wholesale_account_id);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE wholesale_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_config ENABLE ROW LEVEL SECURITY;

-- Políticas para wholesale_accounts
CREATE POLICY "Users can view their own wholesale account" ON wholesale_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wholesale account" ON wholesale_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wholesale account" ON wholesale_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wholesale accounts" ON wholesale_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Políticas para product_prices (público para lectura)
CREATE POLICY "Product prices are readable by everyone" ON product_prices
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify product prices" ON product_prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Políticas para custom_jobs
CREATE POLICY "Users can view their own custom jobs" ON custom_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom jobs" ON custom_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom jobs" ON custom_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all custom jobs" ON custom_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Políticas para art_files
CREATE POLICY "Users can view their own art files" ON art_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own art files" ON art_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all art files" ON art_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Políticas para wholesale_config (solo lectura para todos, escritura para admin)
CREATE POLICY "Wholesale config is readable by everyone" ON wholesale_config
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify wholesale config" ON wholesale_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener el precio de un producto según el usuario
CREATE OR REPLACE FUNCTION get_product_price(
  product_id_param TEXT,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  user_role_val user_role;
  wholesale_account_record wholesale_accounts%ROWTYPE;
  product_price_record product_prices%ROWTYPE;
  retail_price DECIMAL(10,2);
  config_discounts JSONB;
  result JSONB;
BEGIN
  -- Obtener role del usuario
  SELECT role INTO user_role_val 
  FROM profiles 
  WHERE id = user_id_param;
  
  -- Si no es comercio, devolver precio retail
  IF user_role_val != 'COMERCIO' THEN
    -- Aquí tendrías que obtener el precio retail del producto
    -- Por ahora devolvemos un placeholder
    RETURN jsonb_build_object(
      'is_wholesale', false,
      'final_price', 0,
      'retail_price', 0
    );
  END IF;
  
  -- Obtener cuenta mayorista
  SELECT * INTO wholesale_account_record
  FROM wholesale_accounts 
  WHERE user_id = user_id_param AND status = 'approved';
  
  -- Si no tiene cuenta aprobada, devolver precio retail
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'is_wholesale', false,
      'final_price', 0,
      'retail_price', 0
    );
  END IF;
  
  -- Obtener configuración de precios del producto
  SELECT * INTO product_price_record
  FROM product_prices 
  WHERE product_id = product_id_param;
  
  -- Obtener descuentos por nivel
  SELECT level_discounts INTO config_discounts
  FROM wholesale_config 
  LIMIT 1;
  
  -- TODO: Implementar lógica de cálculo de precios
  -- Por ahora devolvemos estructura básica
  
  RETURN jsonb_build_object(
    'is_wholesale', true,
    'level', wholesale_account_record.nivel,
    'wholesale_price', product_price_record.wholesale_price,
    'final_price', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_wholesale_accounts_updated_at 
  BEFORE UPDATE ON wholesale_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_prices_updated_at 
  BEFORE UPDATE ON product_prices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_jobs_updated_at 
  BEFORE UPDATE ON custom_jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wholesale_config_updated_at 
  BEFORE UPDATE ON wholesale_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CREAR STORAGE BUCKET PARA ARCHIVOS DE ARTE
-- =====================================================

-- Crear bucket para archivos de arte (ejecutar en Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('art-files', 'art-files', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para art-files
CREATE POLICY "Users can upload their own art files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'art-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own art files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'art-files' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
  );

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT 'Sistema mayorista configurado exitosamente. Tablas, políticas RLS y funciones creadas.' as mensaje;
