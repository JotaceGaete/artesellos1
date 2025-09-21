import { Product } from '@/types/product';
import { supabase } from './supabase';
import { adaptSupabaseProducts } from './productAdapter';

// Simulación de la API de WooCommerce
// En producción, estas funciones harán llamadas reales a /wp-json/wc/v3/

export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export class WooCommerceAPI {
  private config: WooCommerceConfig;

  constructor(config: WooCommerceConfig) {
    this.config = config;
  }

  // Simula llamada a /wp-json/wc/v3/products (ahora lee de Supabase en cliente)
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    category?: number;
    featured?: boolean;
    search?: string;
  }): Promise<{ products: Product[]; total: number; totalPages: number }> {
    // Leer desde Supabase (cliente) con conteo y paginación
    const perPage = params?.per_page || 12;
    const page = params?.page || 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (params?.featured !== undefined) {
      query = query.eq('featured', params.featured);
    }

    if (params?.search) {
      const q = params.search;
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    let adapted = adaptSupabaseProducts(data || []);

    if (params?.category) {
      const categoryId = params.category;
      const cat = FIXED_CATEGORIES.find(c => c.id === categoryId);
      if (cat) {
        const catName = cat.name.toLowerCase();
        const catSlug = cat.slug;
        adapted = adapted.filter(p => (p.categories || []).some((c: any) => {
          if (typeof c === 'string') return c.toLowerCase() === catName;
          if (c?.name && typeof c.name === 'string') return c.name.toLowerCase() === catName;
          if (c?.slug && typeof c.slug === 'string') return c.slug === catSlug;
          if (typeof c?.id === 'number') return c.id === categoryId;
          return false;
        }));
      }
    }

    return {
      products: adapted,
      total: count || adapted.length,
      totalPages: Math.ceil((count || adapted.length) / perPage)
    };
  }

  // Simula llamada a /wp-json/wc/v3/products/{id} (desde Supabase cliente)
  async getProduct(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const all = adaptSupabaseProducts(data || []);
    const product = all.find(p => p.id === id);
    return product || null;
  }

  // Simula llamada a /wp-json/wc/v3/products por slug (desde Supabase cliente)
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    const adapted = data ? adaptSupabaseProducts([data])[0] : null;
    return adapted || null;
  }

  // Simula llamada a /wp-json/wc/v3/products/categories (derivado desde productos en Supabase)
  async getCategories(): Promise<any[]> {
    // Devolvemos set fijo solicitado
    return FIXED_CATEGORIES;
  }

  // Simula búsqueda de productos
  async searchProducts(query: string, params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ products: Product[]; total: number; totalPages: number }> {
    return this.getProducts({
      ...params,
      search: query
    });
  }

  // Simula obtener productos destacados
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const result = await this.getProducts({
      featured: true,
      per_page: limit
    });
    return result.products;
  }

  // Simula obtener productos por categoría
  async getProductsByCategory(categoryId: number, params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ products: Product[]; total: number; totalPages: number }> {
    return this.getProducts({
      ...params,
      category: categoryId
    });
  }
}

// Categorías fijas solicitadas
export const FIXED_CATEGORIES: { id: number; name: string; slug: string }[] = [
  { id: 1, name: 'Bolsillo', slug: 'bolsillo' },
  { id: 2, name: 'Automáticos', slug: 'automaticos' },
  { id: 3, name: 'Manuales', slug: 'manuales' },
  { id: 4, name: 'Accesorios', slug: 'accesorios' },
];

// Instancia por defecto para desarrollo (usando datos mockeados)
export const wooCommerceAPI = new WooCommerceAPI({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'https://tu-sitio-wordpress.com',
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_mock_key',
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_mock_secret'
});

// Funciones de utilidad para usar en componentes
export const getProducts = (params?: Parameters<WooCommerceAPI['getProducts']>[0]) =>
  wooCommerceAPI.getProducts(params);

export const getProduct = (id: number) =>
  wooCommerceAPI.getProduct(id);

export const getProductBySlug = (slug: string) =>
  wooCommerceAPI.getProductBySlug(slug);

export const getCategories = () =>
  wooCommerceAPI.getCategories();

export const searchProducts = (query: string, params?: Parameters<WooCommerceAPI['searchProducts']>[1]) =>
  wooCommerceAPI.searchProducts(query, params);

export const getFeaturedProducts = (limit?: number) =>
  wooCommerceAPI.getFeaturedProducts(limit);

export const getProductsByCategory = (categoryId: number, params?: Parameters<WooCommerceAPI['getProductsByCategory']>[1]) =>
  wooCommerceAPI.getProductsByCategory(categoryId, params);
