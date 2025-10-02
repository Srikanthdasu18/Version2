export type UserRole = 'customer' | 'vendor' | 'mechanic' | 'admin';

export type ServiceRequestStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'parts_recommended'
  | 'completed'
  | 'cancelled';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  emergency_contact: string | null;
  emergency_phone: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  shop_name: string;
  business_license: string | null;
  shop_description: string | null;
  logo_url: string | null;
  rating: number;
  total_orders: number;
  total_revenue: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Mechanic {
  id: string;
  user_id: string;
  expertise: string[];
  experience_years: number;
  certification_urls: string[];
  service_radius_km: number;
  hourly_rate: number;
  rating: number;
  total_services: number;
  is_available: boolean;
  is_approved: boolean;
  specialization: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  image_urls: string[];
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  category?: ProductCategory;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  mechanic_id: string | null;
  vehicle_type: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  issue_description: string;
  status: ServiceRequestStatus;
  latitude: number;
  longitude: number;
  address: string;
  image_urls: string[];
  scheduled_date: string | null;
  completed_date: string | null;
  estimated_cost: number | null;
  final_cost: number | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  mechanic?: Mechanic;
  service_parts?: ServicePart[];
}

export interface ServicePart {
  id: string;
  service_request_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_intent_id: string | null;
  shipping_address: string;
  shipping_city: string | null;
  shipping_pincode: string | null;
  shipping_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_image: string | null;
  created_at: string;
  product?: Product;
  vendor?: Vendor;
}

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string | null;
  mechanic_id: string | null;
  order_id: string | null;
  service_request_id: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  pincode?: string;
}
