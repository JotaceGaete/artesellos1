import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
// NOTA: NO importar createSupabaseServer aquí para evitar conflictos con Client Components

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug de variables de entorno
console.log('🔧 Supabase URL:', supabaseUrl ? 'Configurada ✅' : 'No configurada ❌');
console.log('🔧 Supabase Key:', supabaseAnonKey ? 'Configurada ✅' : 'No configurada ❌');

// Cliente de Supabase para el cliente (browser)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cliente de Supabase para el servidor (SSR)
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Tipos para las tablas de Supabase
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  on_sale: boolean;
  images: string[];
  categories: string[];
  attributes: ProductAttribute[];
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
  visible: boolean;
  variation: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  currency: string;
  payment_method: string;
  shipping_address: Address;
  billing_address: Address;
  order_items: OrderItem[];
  order_notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  price: number;
  total: number;
  attributes?: Record<string, string>;
}

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface CustomDesign {
  id: string;
  user_id?: string;
  customer_email: string;
  customer_name: string;
  design_data: DesignData;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  price_quote?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DesignData {
  text: string;
  font?: string;
  color: string;
  shape: 'circle' | 'square' | 'rectangle' | 'heart' | 'star';
  size: 'small' | 'medium' | 'large';
  icons?: string[];
  custom_image?: string;
}

export interface QuoteRequest {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  company?: string;
  quantity: number;
  description: string;
  reference_image?: string;
  status: 'pending' | 'responded' | 'accepted' | 'rejected';
  response?: string;
  price_quote?: number;
  created_at: string;
  updated_at: string;
}

export interface WholesaleRegistration {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_type: string;
  tax_id?: string;
  address: Address;
  expected_volume: 'small' | 'medium' | 'large';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  created_at: string;
  updated_at: string;
}

// Funciones de utilidad para Supabase
export const supabaseUtils = {
  // Productos
  // NOTA: getProducts movido a supabaseUtils.ts para Server Components

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // NOTA: getProductBySlug y getCategories movidos a supabaseUtils.ts para Server Components

  // Pedidos
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any)
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getOrdersByEmail(email: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Diseños personalizados
  async createCustomDesign(designData: Omit<CustomDesign, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any)
      .from('custom_designs')
      .insert([designData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Solicitudes de cotización
  async createQuoteRequest(quoteData: Omit<QuoteRequest, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any)
      .from('quote_requests')
      .insert([quoteData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Registro de comercios
  async createWholesaleRegistration(registrationData: Omit<WholesaleRegistration, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any)
      .from('wholesale_registrations')
      .insert([registrationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mensajes de contacto
  async createContactMessage(messageData: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await (supabase as any)
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
