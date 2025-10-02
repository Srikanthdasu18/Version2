/*
  # Core E-Commerce Platform Database Schema

  ## Overview
  This migration creates the foundational schema for a multi-role e-commerce platform
  with integrated service marketplace connecting Customers, Vendors, and Mechanics.

  ## New Tables Created

  ### 1. users (extends Supabase auth.users)
  - `id` (uuid, PK) - References auth.users
  - `role` (enum) - customer, vendor, mechanic, admin
  - `name` (text) - Full name
  - `phone` (text) - Contact number
  - `avatar_url` (text) - Profile picture URL
  - `city` (text) - City name
  - `pincode` (text) - Postal code
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `address` (text) - Full address
  - `is_active` (boolean) - Account status
  - `is_verified` (boolean) - Email/phone verified
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. user_profiles
  - Additional profile information
  - Emergency contacts
  - Preferences stored as JSON

  ### 3. vendors
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → users.id)
  - `shop_name` (text)
  - `business_license` (text)
  - `shop_description` (text)
  - `logo_url` (text)
  - `rating` (numeric)
  - `total_orders` (integer)
  - `is_approved` (boolean)

  ### 4. mechanics
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → users.id)
  - `expertise` (text[]) - Array of skills
  - `experience_years` (integer)
  - `certification_urls` (text[])
  - `service_radius_km` (numeric)
  - `hourly_rate` (numeric)
  - `rating` (numeric)
  - `total_services` (integer)
  - `is_available` (boolean)
  - `is_approved` (boolean)

  ### 5. product_categories
  - Hierarchical category structure
  - Supports nested subcategories

  ### 6. products
  - Complete product information
  - Stock tracking
  - Vendor association
  - Multiple images support

  ### 7. service_requests
  - Customer service request tracking
  - Mechanic assignment
  - Status workflow
  - Location data

  ### 8. orders & order_items
  - Order management
  - Payment tracking
  - Status progression

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Role-based access policies
  - Users can only access their own data
  - Vendors see their products and orders
  - Mechanics see assigned service requests

  ## Indexes
  - Location fields for proximity queries
  - Foreign keys for join performance
  - Status fields for filtering
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'mechanic', 'admin');
CREATE TYPE service_request_status AS ENUM ('pending', 'assigned', 'in_progress', 'parts_recommended', 'completed', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  name text NOT NULL,
  phone text,
  avatar_url text,
  city text,
  pincode text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  address text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles for additional information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  emergency_contact text,
  emergency_phone text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  shop_name text NOT NULL,
  business_license text,
  shop_description text,
  logo_url text,
  rating numeric(3, 2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_revenue numeric(12, 2) DEFAULT 0,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mechanics table
CREATE TABLE IF NOT EXISTS mechanics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  expertise text[] DEFAULT ARRAY[]::text[],
  experience_years integer DEFAULT 0,
  certification_urls text[] DEFAULT ARRAY[]::text[],
  service_radius_km numeric(6, 2) DEFAULT 10,
  hourly_rate numeric(8, 2) DEFAULT 0,
  rating numeric(3, 2) DEFAULT 0,
  total_services integer DEFAULT 0,
  is_available boolean DEFAULT true,
  is_approved boolean DEFAULT false,
  specialization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES product_categories(id) ON DELETE CASCADE,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  compare_at_price numeric(10, 2),
  cost_price numeric(10, 2),
  stock_quantity integer DEFAULT 0,
  sku text,
  barcode text,
  weight numeric(8, 2),
  image_urls text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  rating numeric(3, 2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, slug)
);

-- Service requests
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mechanic_id uuid REFERENCES mechanics(id) ON DELETE SET NULL,
  vehicle_type text NOT NULL,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  issue_description text NOT NULL,
  status service_request_status DEFAULT 'pending',
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  address text NOT NULL,
  image_urls text[] DEFAULT ARRAY[]::text[],
  scheduled_date timestamptz,
  completed_date timestamptz,
  estimated_cost numeric(10, 2),
  final_cost numeric(10, 2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service parts (parts recommended by mechanic)
CREATE TABLE IF NOT EXISTS service_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_number text UNIQUE NOT NULL,
  total_amount numeric(12, 2) NOT NULL,
  subtotal numeric(12, 2) NOT NULL,
  tax_amount numeric(10, 2) DEFAULT 0,
  shipping_amount numeric(10, 2) DEFAULT 0,
  discount_amount numeric(10, 2) DEFAULT 0,
  status order_status DEFAULT 'pending',
  payment_method text,
  payment_intent_id text,
  shipping_address text NOT NULL,
  shipping_city text,
  shipping_pincode text,
  shipping_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  product_name text NOT NULL,
  product_image text,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  amount numeric(12, 2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  mechanic_id uuid REFERENCES mechanics(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  service_request_id uuid REFERENCES service_requests(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (
    (product_id IS NOT NULL AND mechanic_id IS NULL) OR
    (product_id IS NULL AND mechanic_id IS NOT NULL)
  )
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_approved ON vendors(is_approved);
CREATE INDEX IF NOT EXISTS idx_mechanics_user_id ON mechanics(user_id);
CREATE INDEX IF NOT EXISTS idx_mechanics_available ON mechanics(is_available, is_approved);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_mechanic ON service_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_location ON service_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mechanic ON reviews(mechanic_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view basic vendor info"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'vendor' AND is_active = true);

CREATE POLICY "Anyone can view basic mechanic info"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'mechanic' AND is_active = true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vendors
CREATE POLICY "Vendors can view own data"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Vendors can update own data"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own data"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mechanics
CREATE POLICY "Mechanics can view own data"
  ON mechanics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved mechanics"
  ON mechanics FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Mechanics can update own data"
  ON mechanics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mechanics can insert own data"
  ON mechanics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for product_categories
CREATE POLICY "Anyone can view active categories"
  ON product_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Vendors can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for service_requests
CREATE POLICY "Customers can view own service requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Mechanics can view assigned service requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (
    mechanic_id IN (
      SELECT id FROM mechanics WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own service requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Mechanics can update assigned service requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (
    mechanic_id IN (
      SELECT id FROM mechanics WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    mechanic_id IN (
      SELECT id FROM mechanics WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for service_parts
CREATE POLICY "Customers can view parts for own service requests"
  ON service_parts FOR SELECT
  TO authenticated
  USING (
    service_request_id IN (
      SELECT id FROM service_requests WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Mechanics can view parts for assigned service requests"
  ON service_parts FOR SELECT
  TO authenticated
  USING (
    service_request_id IN (
      SELECT id FROM service_requests 
      WHERE mechanic_id IN (
        SELECT id FROM mechanics WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Mechanics can insert parts for assigned service requests"
  ON service_parts FOR INSERT
  TO authenticated
  WITH CHECK (
    service_request_id IN (
      SELECT id FROM service_requests 
      WHERE mechanic_id IN (
        SELECT id FROM mechanics WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for order_items
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for own orders/services"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for cart
CREATE POLICY "Users can view own cart"
  ON cart FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own cart"
  ON cart FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart"
  ON cart FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete from own cart"
  ON cart FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON mechanics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();