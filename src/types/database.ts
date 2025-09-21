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
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
          total: number
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          currency: string
          payment_method: string
          payment_status: string | null
          payment_id: string | null
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
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
          total: number
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          currency: string
          payment_method: string
          payment_status?: string | null
          payment_id?: string | null
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
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
          total?: number
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          currency?: string
          payment_method?: string
          payment_status?: string | null
          payment_id?: string | null
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
      product_colors: {
        Row: {
          id: string
          product_id: string
          color_slug: string
          color_name: string
          hex: string | null
          image_url: string | null
          stock_quantity: number
          price_diff: number
          is_default: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          color_slug: string
          color_name: string
          hex?: string | null
          image_url?: string | null
          stock_quantity?: number
          price_diff?: number
          is_default?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          color_slug?: string
          color_name?: string
          hex?: string | null
          image_url?: string | null
          stock_quantity?: number
          price_diff?: number
          is_default?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      slider_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string | null
          image: string | null
          button_text: string | null
          button_link: string | null
          background_color: string | null
          text_color: string | null
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          description?: string | null
          image?: string | null
          button_text?: string | null
          button_link?: string | null
          background_color?: string | null
          text_color?: string | null
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          image?: string | null
          button_text?: string | null
          button_link?: string | null
          background_color?: string | null
          text_color?: string | null
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      top_banner_messages: {
        Row: {
          id: string
          message: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          message: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          message?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mail_log: {
        Row: {
          id: string
          to_email: string
          subject: string
          template: string
          payload_json: Json
          status: 'sent' | 'failed' | 'skipped_receive_only'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          to_email: string
          subject: string
          template: string
          payload_json: Json
          status?: 'sent' | 'failed' | 'skipped_receive_only'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          to_email?: string
          subject?: string
          template?: string
          payload_json?: Json
          status?: 'sent' | 'failed' | 'skipped_receive_only'
          error_message?: string | null
          created_at?: string
        }
      }
      wholesale_requests: {
        Row: {
          id: string
          user_id: string
          rut: string
          company: string
          contact_name: string
          email: string
          phone: string
          city: string
          notes: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rut: string
          company: string
          contact_name: string
          email: string
          phone: string
          city: string
          notes?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rut?: string
          company?: string
          contact_name?: string
          email?: string
          phone?: string
          city?: string
          notes?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      art_files: {
        Row: {
          id: string
          user_id: string | null
          request_id: number | null
          filename: string
          storage_key: string
          mime_type: string
          size_bytes: number
          validations: Json | null
          status: string
          upload_user_id: string | null
          original_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          request_id?: number | null
          filename: string
          storage_key: string
          mime_type: string
          size_bytes: number
          validations?: Json | null
          status?: string
          upload_user_id?: string | null
          original_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          request_id?: number | null
          filename?: string
          storage_key?: string
          mime_type?: string
          size_bytes?: number
          validations?: Json | null
          status?: string
          upload_user_id?: string | null
          original_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_jobs: {
        Row: {
          id: string
          user_id: string
          wholesale_account_id: string
          stamp_size: string
          text_content: string
          ink_color: string
          quantity: number
          reference: string | null
          status: string
          job_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wholesale_account_id: string
          stamp_size: string
          text_content: string
          ink_color: string
          quantity: number
          reference?: string | null
          status?: string
          job_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wholesale_account_id?: string
          stamp_size?: string
          text_content?: string
          ink_color?: string
          quantity?: number
          reference?: string | null
          status?: string
          job_id?: string | null
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
