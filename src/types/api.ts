// Interfaces para API responses y requests

export interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export interface WholesaleApplication {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_type: string;
  tax_id?: string;
  address: {
    street: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  };
  expected_volume: 'small' | 'medium' | 'large';
  notes?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ProductUpdatePayload {
  name: string;
  slug: string;
  price: number;
  description: string;
  short_description: string;
  images: unknown; // Json type from database
  stock_quantity: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  updated_at: string;
}

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
}

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductSearchParams extends PaginationParams {
  featured?: boolean;
  on_sale?: boolean;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
}
