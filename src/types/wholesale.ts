import { User } from '@supabase/supabase-js'
import { Database } from './database'

type Order = Database['public']['Tables']['orders']['Row']

export type UserRole = 'ANON' | 'CLIENTE' | 'COMERCIO' | 'ADMIN';

export type WholesaleStatus = 'pending' | 'approved' | 'rejected';

export type PriceLevel = 'A' | 'B' | 'C';

export type OrderType = 'RETAIL' | 'WHOLESALE';

export type FileStatus = 'pending' | 'ok' | 'corregir';

export interface WholesaleAccount {
  id: string;
  user_id: string;
  rut: string;
  razon_social: string;
  nombre_fantasia: string;
  giro: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  ciudad: string;
  comprobante_url?: string;
  status: WholesaleStatus;
  nivel?: PriceLevel;
  has_credit: boolean;
  credit_limit: number;
  rejection_reason?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPrice {
  id: string;
  product_id: string;
  wholesale_price?: number; // Precio específico mayorista
  nivel_override?: PriceLevel; // Nivel específico para este producto
  created_at: string;
  updated_at: string;
}

export interface WholesalePricing {
  retail_price: number;
  wholesale_price?: number;
  discount_percentage?: number;
  level?: PriceLevel;
  final_price: number;
  is_wholesale: boolean;
}

export interface ArtFileValidation {
  dpi?: number;
  is_vector: boolean;
  is_single_color: boolean;
  has_transparency: boolean;
  min_stroke_width?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  size_mb: number;
}

export interface ArtFile {
  id: string;
  order_item_id?: string;
  job_id?: string;
  user_id: string;
  filename: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  validations: ArtFileValidation;
  status: FileStatus;
  admin_notes?: string;
  customer_message?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface CustomJob {
  id: string;
  user_id: string;
  wholesale_account_id: string;
  stamp_size: string;
  text_content: string;
  ink_color: string;
  quantity: number;
  reference: string;
  status: 'draft' | 'quoted' | 'approved' | 'in_production' | 'completed';
  quoted_price?: number;
  quoted_at?: string;
  art_files: ArtFile[];
  created_at: string;
  updated_at: string;
}

export interface WholesaleConfig {
  level_discounts: {
    A: number; // -30%
    B: number; // -25%
    C: number; // -20%
  };
  min_order_quantity: number;
  file_validations: {
    max_size_mb: number;
    max_files_per_item: number;
    accepted_mimes: string[];
    min_dpi: number;
    min_dimensions: {
      width: number;
      height: number;
    };
  };
  payment_methods: {
    transfer: boolean;
    mercado_pago: boolean;
    credit: boolean;
  };
}

export interface WholesaleApplication {
  rut: string;
  razon_social: string;
  nombre_fantasia: string;
  giro: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  ciudad: string;
  comprobante?: File;
}

export interface WholesaleOrder extends Order {
  order_type: 'WHOLESALE';
  wholesale_account_id: string;
  discount_percentage: number;
  margin_percentage: number;
  payment_method: 'transfer' | 'mercado_pago' | 'credit';
  credit_terms?: number; // días
  invoice_data: {
    rut: string;
    razon_social: string;
  };
}

// Extender el tipo User existente
export interface WholesaleUser extends User {
  role: UserRole;
  wholesale_account?: WholesaleAccount;
}
