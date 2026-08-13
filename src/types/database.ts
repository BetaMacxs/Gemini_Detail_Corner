export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  active: boolean;
  featured: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  size: string | null;
  scent: string | null;
  price: number;
  stock_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  // Computed property for image display resolved via storage_path
  url?: string;
  is_primary?: boolean;
}

export interface ProductWithDetails extends Product {
  category?: Category | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  product_id: string;
  profile_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  email: string;
  customer_name: string;
  phone: string | null;
  billing_information: any;
  shipping_information: any;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  currency: string;
  status: 'PENDING_PAYMENT' | 'PAYMENT_FAILED' | 'PAID' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  sku_snapshot: string;
  variant_snapshot: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}
