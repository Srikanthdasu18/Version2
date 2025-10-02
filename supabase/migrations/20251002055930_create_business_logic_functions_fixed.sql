/*
  # Business Logic Functions

  ## Overview
  This migration creates database functions for business logic automation including:
  1. Automatic mechanic assignment based on proximity and availability
  2. Order number generation
  3. Distance calculation using Haversine formula
  4. Vendor proximity ranking

  ## Functions Created

  ### 1. calculate_distance
  - Calculates distance between two GPS coordinates using Haversine formula
  - Returns distance in kilometers

  ### 2. find_nearest_mechanic
  - Finds available mechanic nearest to service request location
  - Considers service radius and availability status
  - Returns mechanic ID or NULL if none available

  ### 3. assign_mechanic_to_service
  - Automatically assigns nearest available mechanic to service request
  - Triggered on service request creation

  ### 4. generate_order_number
  - Generates unique order number with format: ORD-YYYYMMDD-XXXXX
  - Ensures uniqueness

  ### 5. update_product_rating
  - Updates product rating when new review is added
  - Calculates average rating from all reviews

  ### 6. update_mechanic_rating
  - Updates mechanic rating when new review is added
  - Calculates average rating from all reviews
*/

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  r numeric := 6371;
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find nearest available mechanic
CREATE OR REPLACE FUNCTION find_nearest_mechanic(
  request_lat numeric,
  request_lon numeric
)
RETURNS uuid AS $$
DECLARE
  nearest_mechanic_id uuid;
BEGIN
  SELECT m.id INTO nearest_mechanic_id
  FROM mechanics m
  JOIN users u ON u.id = m.user_id
  WHERE m.is_available = true
    AND m.is_approved = true
    AND u.is_active = true
    AND u.latitude IS NOT NULL
    AND u.longitude IS NOT NULL
    AND calculate_distance(
      u.latitude,
      u.longitude,
      request_lat,
      request_lon
    ) <= m.service_radius_km
  ORDER BY calculate_distance(
    u.latitude,
    u.longitude,
    request_lat,
    request_lon
  ) ASC
  LIMIT 1;
  
  RETURN nearest_mechanic_id;
END;
$$ LANGUAGE plpgsql;

-- Function to assign mechanic to service request
CREATE OR REPLACE FUNCTION assign_mechanic_to_service()
RETURNS TRIGGER AS $$
DECLARE
  assigned_mechanic_id uuid;
  mechanic_user_id uuid;
BEGIN
  IF NEW.status = 'pending' AND NEW.mechanic_id IS NULL THEN
    assigned_mechanic_id := find_nearest_mechanic(NEW.latitude, NEW.longitude);
    
    IF assigned_mechanic_id IS NOT NULL THEN
      NEW.mechanic_id := assigned_mechanic_id;
      NEW.status := 'assigned';
      
      SELECT user_id INTO mechanic_user_id
      FROM mechanics
      WHERE id = assigned_mechanic_id;
      
      INSERT INTO notifications (user_id, type, title, message, action_url)
      VALUES (
        mechanic_user_id,
        'service_assigned',
        'New Service Request',
        'You have been assigned a new service request',
        '/mechanic/services/' || NEW.id
      );
      
      INSERT INTO notifications (user_id, type, title, message, action_url)
      VALUES (
        NEW.customer_id,
        'mechanic_assigned',
        'Mechanic Assigned',
        'A mechanic has been assigned to your service request',
        '/customer/services/' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign mechanic on service request creation
CREATE TRIGGER auto_assign_mechanic
  BEFORE INSERT ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_mechanic_to_service();

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  date_part text;
  sequence_part text;
  exists_check boolean;
BEGIN
  date_part := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  LOOP
    sequence_part := LPAD(floor(random() * 99999)::text, 5, '0');
    new_number := 'ORD-' || date_part || '-' || sequence_part;
    
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to set order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  IF target_product_id IS NOT NULL THEN
    UPDATE products
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE product_id = target_product_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE product_id = target_product_id
      )
    WHERE id = target_product_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating on review changes
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to update mechanic rating
CREATE OR REPLACE FUNCTION update_mechanic_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_mechanic_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_mechanic_id := OLD.mechanic_id;
  ELSE
    target_mechanic_id := NEW.mechanic_id;
  END IF;

  IF target_mechanic_id IS NOT NULL THEN
    UPDATE mechanics
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE mechanic_id = target_mechanic_id
    )
    WHERE id = target_mechanic_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mechanic rating on review changes
CREATE TRIGGER update_mechanic_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_mechanic_rating();

-- Function to update vendor statistics
CREATE OR REPLACE FUNCTION update_vendor_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors
  SET 
    total_orders = total_orders + 1,
    total_revenue = total_revenue + NEW.total_price
  WHERE id = NEW.vendor_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor stats when order items are created
CREATE TRIGGER update_vendor_stats_trigger
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_stats();

-- Function to update mechanic service count
CREATE OR REPLACE FUNCTION update_mechanic_service_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE mechanics
    SET total_services = total_services + 1
    WHERE id = NEW.mechanic_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mechanic service count on completion
CREATE TRIGGER update_mechanic_service_count_trigger
  AFTER UPDATE ON service_requests
  FOR EACH ROW
  WHEN (NEW.mechanic_id IS NOT NULL)
  EXECUTE FUNCTION update_mechanic_service_count();

-- Function to notify on parts recommendation
CREATE OR REPLACE FUNCTION notify_parts_recommendation()
RETURNS TRIGGER AS $$
DECLARE
  customer_user_id uuid;
BEGIN
  SELECT customer_id INTO customer_user_id
  FROM service_requests
  WHERE id = NEW.service_request_id;
  
  UPDATE service_requests
  SET status = 'parts_recommended'
  WHERE id = NEW.service_request_id
    AND status = 'in_progress';
  
  INSERT INTO notifications (user_id, type, title, message, action_url)
  VALUES (
    customer_user_id,
    'parts_recommended',
    'Parts Recommended',
    'Your mechanic has recommended parts for your service request',
    '/customer/services/' || NEW.service_request_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify customer when parts are recommended
CREATE TRIGGER notify_parts_recommendation_trigger
  AFTER INSERT ON service_parts
  FOR EACH ROW
  EXECUTE FUNCTION notify_parts_recommendation();