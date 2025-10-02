/*
  # Fix Security Issues - Indexes and RLS Optimization

  ## Overview
  This migration addresses critical security and performance issues:
  1. Adds missing indexes for all foreign keys
  2. Optimizes RLS policies to use (select auth.uid()) pattern
  3. Fixes function search paths
  4. Consolidates multiple permissive policies

  ## Changes
  - Add indexes for unindexed foreign keys
  - Update all RLS policies to use optimized auth pattern
  - Set proper search_path for all functions
*/

-- ============================================================================
-- PART 1: Add Missing Indexes for Foreign Keys
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_request_id ON reviews(service_request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_service_parts_product_id ON service_parts(product_id);
CREATE INDEX IF NOT EXISTS idx_service_parts_service_request_id ON service_parts(service_request_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- ============================================================================
-- PART 2: Drop and Recreate RLS Policies with Optimized Pattern
-- ============================================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view basic vendor info" ON users;
DROP POLICY IF EXISTS "Anyone can view basic mechanic info" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Anyone can view basic vendor/mechanic info"
  ON users FOR SELECT
  TO authenticated
  USING (role IN ('vendor', 'mechanic') AND is_active = true);

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Vendors policies
DROP POLICY IF EXISTS "Vendors can view own data" ON vendors;
DROP POLICY IF EXISTS "Anyone can view approved vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can update own data" ON vendors;
DROP POLICY IF EXISTS "Vendors can insert own data" ON vendors;

CREATE POLICY "Vendors can view all data"
  ON vendors FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR is_approved = true
  );

CREATE POLICY "Vendors can update own data"
  ON vendors FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Vendors can insert own data"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Mechanics policies
DROP POLICY IF EXISTS "Mechanics can view own data" ON mechanics;
DROP POLICY IF EXISTS "Anyone can view approved mechanics" ON mechanics;
DROP POLICY IF EXISTS "Mechanics can update own data" ON mechanics;
DROP POLICY IF EXISTS "Mechanics can insert own data" ON mechanics;

CREATE POLICY "Mechanics can view all data"
  ON mechanics FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR is_approved = true
  );

CREATE POLICY "Mechanics can update own data"
  ON mechanics FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Mechanics can insert own data"
  ON mechanics FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Products policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Vendors can view own products" ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;

CREATE POLICY "View all active and own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    is_active = true OR 
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

-- Service requests policies
DROP POLICY IF EXISTS "Customers can view own service requests" ON service_requests;
DROP POLICY IF EXISTS "Mechanics can view assigned service requests" ON service_requests;
DROP POLICY IF EXISTS "Customers can create service requests" ON service_requests;
DROP POLICY IF EXISTS "Customers can update own service requests" ON service_requests;
DROP POLICY IF EXISTS "Mechanics can update assigned service requests" ON service_requests;

CREATE POLICY "View own or assigned service requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (
    customer_id = (select auth.uid()) OR
    mechanic_id IN (
      SELECT id FROM mechanics WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Customers can create service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (select auth.uid()));

CREATE POLICY "Update own or assigned service requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (
    customer_id = (select auth.uid()) OR
    mechanic_id IN (
      SELECT id FROM mechanics WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    customer_id = (select auth.uid()) OR
    mechanic_id IN (
      SELECT id FROM mechanics WHERE user_id = (select auth.uid())
    )
  );

-- Service parts policies
DROP POLICY IF EXISTS "Customers can view parts for own service requests" ON service_parts;
DROP POLICY IF EXISTS "Mechanics can view parts for assigned service requests" ON service_parts;
DROP POLICY IF EXISTS "Mechanics can insert parts for assigned service requests" ON service_parts;

CREATE POLICY "View parts for own or assigned requests"
  ON service_parts FOR SELECT
  TO authenticated
  USING (
    service_request_id IN (
      SELECT id FROM service_requests 
      WHERE customer_id = (select auth.uid()) OR
      mechanic_id IN (
        SELECT id FROM mechanics WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Mechanics can insert parts for assigned requests"
  ON service_parts FOR INSERT
  TO authenticated
  WITH CHECK (
    service_request_id IN (
      SELECT id FROM service_requests 
      WHERE mechanic_id IN (
        SELECT id FROM mechanics WHERE user_id = (select auth.uid())
      )
    )
  );

-- Orders policies
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Customers can update own pending orders" ON orders;

CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = (select auth.uid()));

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (select auth.uid()));

CREATE POLICY "Customers can update own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (customer_id = (select auth.uid()) AND status = 'pending')
  WITH CHECK (customer_id = (select auth.uid()));

-- Order items policies
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
DROP POLICY IF EXISTS "Vendors can view their order items" ON order_items;
DROP POLICY IF EXISTS "Customers can insert own order items" ON order_items;

CREATE POLICY "View own or vendor order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = (select auth.uid())
    ) OR
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Customers can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = (select auth.uid())
    )
  );

-- Payments policies
DROP POLICY IF EXISTS "Customers can view own payments" ON payments;

CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = (select auth.uid())
    )
  );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Reviews policies
DROP POLICY IF EXISTS "Users can create reviews for own orders/services" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

CREATE POLICY "Users can create reviews for own orders/services"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Wishlist policies
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can delete from own wishlist" ON wishlist;

CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can manage own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Cart policies
DROP POLICY IF EXISTS "Users can view own cart" ON cart;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart;
DROP POLICY IF EXISTS "Users can update own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart;

CREATE POLICY "Users can view own cart"
  ON cart FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can manage own cart"
  ON cart FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own cart"
  ON cart FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete from own cart"
  ON cart FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 3: Fix Function Search Paths
-- ============================================================================

ALTER FUNCTION calculate_distance(numeric, numeric, numeric, numeric) 
  SET search_path = public, pg_temp;

ALTER FUNCTION find_nearest_mechanic(numeric, numeric) 
  SET search_path = public, pg_temp;

ALTER FUNCTION assign_mechanic_to_service() 
  SET search_path = public, pg_temp;

ALTER FUNCTION generate_order_number() 
  SET search_path = public, pg_temp;

ALTER FUNCTION set_order_number() 
  SET search_path = public, pg_temp;

ALTER FUNCTION update_product_rating() 
  SET search_path = public, pg_temp;

ALTER FUNCTION update_mechanic_rating() 
  SET search_path = public, pg_temp;

ALTER FUNCTION update_vendor_stats() 
  SET search_path = public, pg_temp;

ALTER FUNCTION update_mechanic_service_count() 
  SET search_path = public, pg_temp;

ALTER FUNCTION notify_parts_recommendation() 
  SET search_path = public, pg_temp;

ALTER FUNCTION update_updated_at_column() 
  SET search_path = public, pg_temp;