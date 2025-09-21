export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          status: 'unread' | 'read' | 'responded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          status?: 'unread' | 'read' | 'responded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          status?: 'unread' | 'read' | 'responded'
          created_at?: string
          updated_at?: string
        }
      }
      custom_designs: {
        Row: {
          id: string
          user_id: string | null
          customer_email: string
          customer_name: string
          design_data: Json
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          price_quote: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_email: string
          customer_name: string
          design_data: Json
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          price_quote?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_email?: string
          customer_name?: string
          design_data?: Json
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          price_quote?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string | null
          quantity: number
          price: number
          total: number
          attributes: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity: number
          price: number
          total: number
          attributes?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          price?: number
          total?: number
          attributes?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          currency: string
          payment_method: string
          shipping_address: Json
          billing_address: Json
          order_notes: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          currency: string
          payment_method: string
          shipping_address: Json
          billing_address: Json
          order_notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          currency?: string
          payment_method?: string
          shipping_address?: Json
          billing_address?: Json
          order_notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          short_description: string
          price: number
          regular_price: number
          sale_price: number | null
          on_sale: boolean
          images: Json
          categories: Json
          attributes: Json
          stock_status: 'instock' | 'outofstock' | 'onbackorder'
          stock_quantity: number
          weight: number | null
          dimensions: Json | null
          tags: Json
          featured: boolean
          stamp_info: Json | null
          customization_options: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          short_description: string
          price: number
          regular_price: number
          sale_price?: number | null
          on_sale?: boolean
          images: Json
          categories: Json
          attributes: Json
          stock_status?: 'instock' | 'outofstock' | 'onbackorder'
          stock_quantity?: number
          weight?: number | null
          dimensions?: Json | null
          tags: Json
          featured?: boolean
          stamp_info?: Json | null
          customization_options?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          short_description?: string
          price?: number
          regular_price?: number
          sale_price?: number | null
          on_sale?: boolean
          images?: Json
          categories?: Json
          attributes?: Json
          stock_status?: 'instock' | 'outofstock' | 'onbackorder'
          stock_quantity?: number
          weight?: number | null
          dimensions?: Json | null
          tags?: Json
          featured?: boolean
          stamp_info?: Json | null
          customization_options?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_requests: {
        Row: {
          id: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          company: string | null
          quantity: number
          description: string
          reference_image: string | null
          status: 'pending' | 'responded' | 'accepted' | 'rejected'
          response: string | null
          price_quote: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          company?: string | null
          quantity: number
          description: string
          reference_image?: string | null
          status?: 'pending' | 'responded' | 'accepted' | 'rejected'
          response?: string | null
          price_quote?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          company?: string | null
          quantity?: number
          description?: string
          reference_image?: string | null
          status?: 'pending' | 'responded' | 'accepted' | 'rejected'
          response?: string | null
          price_quote?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      wholesale_registrations: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          email: string
          phone: string
          business_type: string
          tax_id: string | null
          address: Json
          expected_volume: 'small' | 'medium' | 'large'
          status: 'pending' | 'approved' | 'rejected'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_name: string
          email: string
          phone: string
          business_type: string
          tax_id?: string | null
          address: Json
          expected_volume?: 'small' | 'medium' | 'large'
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_name?: string
          email?: string
          phone?: string
          business_type?: string
          tax_id?: string | null
          address?: Json
          expected_volume?: 'small' | 'medium' | 'large'
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
