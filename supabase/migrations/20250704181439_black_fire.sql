/*
  # Fix Admin Settings RLS Policies

  1. Changes
    - Drop existing policy that restricts all operations to admins
    - Create a new policy that allows all authenticated users to read settings
    - Create a policy that allows only admins to modify settings
    
  2. Purpose
    - Allow normal users to read funding charge settings
    - Maintain security by restricting modifications to admin users only
*/

-- Drop the existing policy that restricts all operations to admins
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;

-- Create a new policy that allows all authenticated users to read settings
CREATE POLICY "Anyone can read settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows only admins to modify settings
-- Note: We need to create separate policies for each operation
CREATE POLICY "Admins can insert settings"
  ON admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY "Admins can update settings"
  ON admin_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Admins can delete settings"
  ON admin_settings
  FOR DELETE
  TO authenticated
  USING (is_admin_user());