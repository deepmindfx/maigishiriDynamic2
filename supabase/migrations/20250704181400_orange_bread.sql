/*
  # Update admin_settings RLS policies to allow read access for all users

  1. Changes
    - Drop existing policy that restricts all operations to admins only
    - Create a new policy that allows all authenticated users to read settings
    - Create a separate policy that allows only admins to modify settings

  2. Purpose
    - Allow normal users to read settings like funding charges
    - Maintain security by restricting write access to admins only
    - Fix issue where funding charges were only visible to admin users
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
CREATE POLICY "Admins can modify settings"
  ON admin_settings
  FOR INSERT UPDATE DELETE
  TO authenticated
  USING (is_admin_user());