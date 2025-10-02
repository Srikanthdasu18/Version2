/*
  # Seed Initial Data

  ## Overview
  This migration inserts initial seed data for testing and demonstration purposes:
  - Product categories
  - Sample vendors (requires manual user creation first)
  - Sample products

  ## Important Notes
  - This is development seed data only
  - In production, this should be removed or modified
*/

-- Insert product categories
INSERT INTO product_categories (name, slug, description, sort_order, is_active) VALUES
('Engine Parts', 'engine-parts', 'Components for engine systems', 1, true),
('Brake System', 'brake-system', 'Brake pads, rotors, and related parts', 2, true),
('Suspension', 'suspension', 'Shocks, struts, and suspension components', 3, true),
('Electrical', 'electrical', 'Batteries, alternators, and electrical parts', 4, true),
('Transmission', 'transmission', 'Transmission and drivetrain components', 5, true),
('Filters', 'filters', 'Oil, air, and fuel filters', 6, true),
('Body Parts', 'body-parts', 'Exterior and interior body components', 7, true),
('Lighting', 'lighting', 'Headlights, taillights, and bulbs', 8, true),
('Cooling System', 'cooling-system', 'Radiators, thermostats, and cooling parts', 9, true),
('Exhaust System', 'exhaust-system', 'Mufflers, catalytic converters, and pipes', 10, true)
ON CONFLICT (slug) DO NOTHING;