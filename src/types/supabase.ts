export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      art_files: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          customer_message: string | null
          filename: string
          id: string
          job_id: string | null
          mime_type: string
          order_item_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          size_bytes: number
          status: Database["public"]["Enums"]["file_status"]
          storage_key: string
          user_id: string
          validations: Json
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          customer_message?: string | null
          filename: string
          id?: string
          job_id?: string | null
          mime_type: string
          order_item_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes: number
          status?: Database["public"]["Enums"]["file_status"]
          storage_key: string
          user_id: string
          validations: Json
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          customer_message?: string | null
          filename?: string
          id?: string
          job_id?: string | null
          mime_type?: string
          order_item_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number
          status?: Database["public"]["Enums"]["file_status"]
          storage_key?: string
          user_id?: string
          validations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "art_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "custom_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_designs: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          design_data: Json
          id: string
          notes: string | null
          price_quote: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          design_data: Json
          id?: string
          notes?: string | null
          price_quote?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          design_data?: Json
          id?: string
          notes?: string | null
          price_quote?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_jobs: {
        Row: {
          created_at: string | null
          id: string
          ink_color: string
          quantity: number
          quoted_at: string | null
          quoted_price: number | null
          reference: string
          stamp_size: string
          status: string | null
          text_content: string
          updated_at: string | null
          user_id: string
          wholesale_account_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ink_color: string
          quantity: number
          quoted_at?: string | null
          quoted_price?: number | null
          reference: string
          stamp_size: string
          status?: string | null
          text_content: string
          updated_at?: string | null
          user_id: string
          wholesale_account_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ink_color?: string
          quantity?: number
          quoted_at?: string | null
          quoted_price?: number | null
          reference?: string
          stamp_size?: string
          status?: string | null
          text_content?: string
          updated_at?: string | null
          user_id?: string
          wholesale_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_jobs_wholesale_account_id_fkey"
            columns: ["wholesale_account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          attributes: Json | null
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          product_sku: string | null
          quantity: number
          total: number
          updated_at: string | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity: number
          total: number
          updated_at?: string | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          invoice_razon_social: string | null
          invoice_rut: string | null
          margin_percentage: number | null
          order_notes: string | null
          order_type: Database["public"]["Enums"]["order_type"] | null
          payment_method: string
          shipping_address: Json
          shipping_amount: number | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
          wholesale_account_id: string | null
        }
        Insert: {
          billing_address: Json
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          invoice_razon_social?: string | null
          invoice_rut?: string | null
          margin_percentage?: number | null
          order_notes?: string | null
          order_type?: Database["public"]["Enums"]["order_type"] | null
          payment_method: string
          shipping_address: Json
          shipping_amount?: number | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          wholesale_account_id?: string | null
        }
        Update: {
          billing_address?: Json
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          invoice_razon_social?: string | null
          invoice_rut?: string | null
          margin_percentage?: number | null
          order_notes?: string | null
          order_type?: Database["public"]["Enums"]["order_type"] | null
          payment_method?: string
          shipping_address?: Json
          shipping_amount?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          wholesale_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_wholesale_account_id_fkey"
            columns: ["wholesale_account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          active: boolean
          color_name: string
          color_slug: string
          created_at: string | null
          hex: string | null
          id: string
          image_url: string | null
          is_default: boolean
          price_diff: number
          product_id: string
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          color_name: string
          color_slug: string
          created_at?: string | null
          hex?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          price_diff?: number
          product_id: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          color_name?: string
          color_slug?: string
          created_at?: string | null
          hex?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          price_diff?: number
          product_id?: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          created_at: string | null
          id: string
          nivel_override: Database["public"]["Enums"]["price_level"] | null
          product_id: string
          updated_at: string | null
          wholesale_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nivel_override?: Database["public"]["Enums"]["price_level"] | null
          product_id: string
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nivel_override?: Database["public"]["Enums"]["price_level"] | null
          product_id?: string
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          attributes: Json | null
          categories: Json | null
          created_at: string | null
          customization_options: Json | null
          description: string
          dimensions: Json | null
          featured: boolean | null
          id: string
          images: string | null
          name: string
          on_sale: boolean | null
          price: number
          regular_price: number
          sale_price: number | null
          short_description: string
          slug: string
          stamp_info: Json | null
          stock_quantity: number | null
          stock_status: string | null
          tags: Json | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          attributes?: Json | null
          categories?: Json | null
          created_at?: string | null
          customization_options?: Json | null
          description: string
          dimensions?: Json | null
          featured?: boolean | null
          id?: string
          images?: string | null
          name: string
          on_sale?: boolean | null
          price: number
          regular_price: number
          sale_price?: number | null
          short_description: string
          slug: string
          stamp_info?: Json | null
          stock_quantity?: number | null
          stock_status?: string | null
          tags?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          attributes?: Json | null
          categories?: Json | null
          created_at?: string | null
          customization_options?: Json | null
          description?: string
          dimensions?: Json | null
          featured?: boolean | null
          id?: string
          images?: string | null
          name?: string
          on_sale?: boolean | null
          price?: number
          regular_price?: number
          sale_price?: number | null
          short_description?: string
          slug?: string
          stamp_info?: Json | null
          stock_quantity?: number | null
          stock_status?: string | null
          tags?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          company: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          description: string
          id: string
          price_quote: number | null
          quantity: number
          reference_image: string | null
          response: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          description: string
          id?: string
          price_quote?: number | null
          quantity: number
          reference_image?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          description?: string
          id?: string
          price_quote?: number | null
          quantity?: number
          reference_image?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slider_slides: {
        Row: {
          active: boolean
          background_color: string | null
          button_link: string | null
          button_text: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          slide_order: number
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          background_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          slide_order?: number
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          background_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          slide_order?: number
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      top_banner_messages: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          order_index: number
          text: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          order_index?: number
          text: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          order_index?: number
          text?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      wholesale_accounts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          ciudad: string
          comprobante_url: string | null
          contacto_email: string
          contacto_nombre: string
          contacto_telefono: string | null
          created_at: string | null
          credit_limit: number | null
          giro: string
          has_credit: boolean | null
          id: string
          nivel: Database["public"]["Enums"]["price_level"] | null
          nombre_fantasia: string | null
          razon_social: string
          rejection_reason: string | null
          rut: string
          status: Database["public"]["Enums"]["wholesale_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          ciudad: string
          comprobante_url?: string | null
          contacto_email: string
          contacto_nombre: string
          contacto_telefono?: string | null
          created_at?: string | null
          credit_limit?: number | null
          giro: string
          has_credit?: boolean | null
          id?: string
          nivel?: Database["public"]["Enums"]["price_level"] | null
          nombre_fantasia?: string | null
          razon_social: string
          rejection_reason?: string | null
          rut: string
          status?: Database["public"]["Enums"]["wholesale_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          ciudad?: string
          comprobante_url?: string | null
          contacto_email?: string
          contacto_nombre?: string
          contacto_telefono?: string | null
          created_at?: string | null
          credit_limit?: number | null
          giro?: string
          has_credit?: boolean | null
          id?: string
          nivel?: Database["public"]["Enums"]["price_level"] | null
          nombre_fantasia?: string | null
          razon_social?: string
          rejection_reason?: string | null
          rut?: string
          status?: Database["public"]["Enums"]["wholesale_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wholesale_config: {
        Row: {
          file_validations: Json
          id: string
          level_discounts: Json
          min_order_quantity: number | null
          payment_methods: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          file_validations?: Json
          id?: string
          level_discounts?: Json
          min_order_quantity?: number | null
          payment_methods?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          file_validations?: Json
          id?: string
          level_discounts?: Json
          min_order_quantity?: number | null
          payment_methods?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      wholesale_registrations: {
        Row: {
          address: Json
          business_type: string
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          expected_volume: string | null
          id: string
          notes: string | null
          phone: string
          status: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address: Json
          business_type: string
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          expected_volume?: string | null
          id?: string
          notes?: string | null
          phone: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json
          business_type?: string
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          expected_volume?: string | null
          id?: string
          notes?: string | null
          phone?: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_product_price: {
        Args: { product_id_param: string; user_id_param?: string }
        Returns: Json
      }
    }
    Enums: {
      file_status: "pending" | "ok" | "corregir"
      order_type: "RETAIL" | "WHOLESALE"
      price_level: "A" | "B" | "C"
      user_role: "ANON" | "CLIENTE" | "COMERCIO" | "ADMIN"
      wholesale_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      file_status: ["pending", "ok", "corregir"],
      order_type: ["RETAIL", "WHOLESALE"],
      price_level: ["A", "B", "C"],
      user_role: ["ANON", "CLIENTE", "COMERCIO", "ADMIN"],
      wholesale_status: ["pending", "approved", "rejected"],
    },
  },
} as const
