export type CustomerStatus = 'pending' | 'approved' | 'rejected';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';
/** Stock of one colour of a product (products.color_stock). */
export interface ColorStock {
  name: string;
  status: StockStatus;
  qty: number | null;
}

export type EnquiryStatus = 'new' | 'in_progress' | 'responded' | 'closed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  whatsapp: string;
  country: string;
  city: string;
  address: string;
  business_type: string;
  gst_number: string | null;
  website: string | null;
  additional_info: string | null;
  status: CustomerStatus;
  role: 'customer' | 'admin';
  admin_note?: string | null;
  status_changed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  /** 'type' = Necklace Sets, Earrings…  'style' = American Diamond, Victorian… */
  category_group?: 'type' | 'style';
  /** Display photo (own image or a product photo); filled in the root layout. */
  photo?: string | null;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  mobile_image_url: string | null;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
  storage_path?: string | null;
  mobile_storage_path?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  storage_path?: string | null;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  stock_status: StockStatus;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string | null;
  moq: number;
  stock_status: StockStatus;
  stock_quantity: number | null;
  is_published: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  created_at: string;
  collections?: string[];
  colors?: string[];
  sizes?: string[];
  material?: string | null;
  finish?: string | null;
  stone?: string | null;
  weight?: string | null;
  set_includes?: string | null;
  dimensions?: string | null;
  video_url?: string | null;
  color_stock?: ColorStock[];
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Price {
  product_id: string;
  variant_id: string | null;
  price: number;
  currency: string;
  price_note: string | null;
}

export interface SiteSettings {
  whatsapp_number: string;
  whatsapp_message: string;
  video_call_number: string;
  video_call_message: string;
  video_call_enabled: boolean;
  contact_phone: string;
  contact_email: string | null;
  address: string;
  business_hours: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  logo_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
}

export interface Enquiry {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  whatsapp: string;
  country: string;
  categories: string[];
  estimated_quantity: string | null;
  message: string;
  product_id: string | null;
  status: EnquiryStatus;
  admin_notes: string | null;
  created_at: string;
  product?: { name: string; sku: string; slug: string } | null;
}
