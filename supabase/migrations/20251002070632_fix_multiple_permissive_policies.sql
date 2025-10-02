/*
  # Fix Multiple Permissive Policies

  ## Overview
  Consolidate multiple permissive SELECT policies on users table into a single policy.
  This improves performance and simplifies policy logic.

  ## Changes
  - Drop separate policies for viewing own profile and public vendor/mechanic info
  - Create single consolidated policy that covers both cases
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view basic vendor/mechanic info" ON users;

-- Create single consolidated policy
CREATE POLICY "Users can view profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id OR 
    (role IN ('vendor', 'mechanic') AND is_active = true)
  );