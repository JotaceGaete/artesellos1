export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  images: ProductImage[];
  categories: ProductCategory[];
  attributes: ProductAttribute[];
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  tags: ProductTag[];
  featured: boolean;
  date_created: string;
  date_modified: string;
  // Nuevos campos para personalización de timbres
  stamp_info?: StampInfo;
  customization_options?: CustomizationOptions;
}

export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  color?: string; // Color asociado a esta imagen (hex code)
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  options: string[];
  visible: boolean;
  variation: boolean;
}

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variation_id?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
}

// Nuevas interfaces para personalización de timbres
export interface StampInfo {
  type: 'automatic' | 'manual' | 'self-inking' | 'pre-inked';
  default_dimensions: {
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'inches';
  };
  material: string;
  max_text_lines: number;
  recommended_uses: string[];
}

export interface CustomizationOptions {
  allow_custom_dimensions: boolean;
  dimension_limits: {
    min_width: number;
    max_width: number;
    min_height: number;
    max_height: number;
    unit: 'mm' | 'cm' | 'inches';
  };
  text_customization: {
    max_lines: number;
    max_chars_per_line: number;
    supported_fonts: string[];
    allow_multiline: boolean;
  };
  color_options: {
    available_colors: string[];
    default_color: string;
  };
  price_multipliers: {
    dimension_multiplier: number; // Multiplicador por cm² adicional
    color_multiplier: number; // Multiplicador por color personalizado
    text_multiplier: number; // Multiplicador por línea de texto adicional
  };
}

export interface CustomizedProduct {
  base_product: Product;
  customizations: {
    dimensions: {
      width: number;
      height: number;
      unit: 'mm' | 'cm' | 'inches';
    };
    text_lines: string[];
    selected_color: string;
    font?: string;
  };
  calculated_price: number;
  customization_fee: number;
}
