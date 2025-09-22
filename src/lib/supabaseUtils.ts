// Funciones de utilidad para Supabase (Solo para Server Components y Server Actions)
import { createSupabaseServer } from './supabaseServer';
import type { Product } from './supabase';

export const supabaseServerUtils = {
  // Productos
  async getProducts(filters?: {
    category?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    console.log('🔍 Obteniendo productos con filtros:', filters);
    
    const supabase = await createSupabaseServer();
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.contains('categories', [filters.category]);
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error('❌ Error al obtener productos:', error);
      throw error;
    }
    
    console.log('✅ Productos obtenidos:', data?.length || 0);
    return data || [];
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    console.log('🔍 Buscando producto con slug:', slug);
    
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('❌ Error al buscar producto:', error);
      throw error;
    }
    
    console.log('✅ Producto encontrado:', data ? (data as any).name : 'No encontrado');
    return data;
  },

  async getCategories() {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }
};
