/*
  # Create admin_settings table

  1. New Tables
    - `admin_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key identifier
      - `value` (text) - Setting value
      - `description` (text, optional) - Description of the setting
      - `updated_by` (uuid, optional) - Reference to admin who last updated
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on `admin_settings` table
    - Add policy for admins to manage all settings
    - Add trigger for automatic updated_at timestamp

  3. Indexes
    - Unique index on key field
    - Index on key field for fast lookups

  4. Initial Data
    - Insert default application settings
*/

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage settings
CREATE POLICY "Admins can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS admin_settings_key_idx ON admin_settings(key);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('site_name', 'Haaman Network', 'Name of the application/site'),
  ('site_logo_url', 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg', 'URL for the site logo'),
  ('app_base_url', 'https://haamannetwork.com', 'Base URL for the application'),
  ('hero_banner_image', 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg', 'Hero section banner image URL'),
  ('hero_banner_image_alt', 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg', 'Alternative hero banner image URL'),
  ('steps_banner_image', 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg', 'Steps section banner image URL'),
  ('hero_title', 'The Ultimate Digital Services & E-commerce Platform.', 'Main hero section title'),
  ('hero_subtitle', 'Pay bills, shop online, and manage your digital life all in one secure platform.', 'Hero section subtitle'),
  ('steps_title', '3 Simple Steps to Enjoy Haaman Network.', 'Steps section title'),
  ('download_app_url', 'https://play.google.com/store/apps', 'URL for app download'),
  ('download_app_enabled', 'true', 'Whether app download button is enabled'),
  ('footer_phone', '+234 907 599 2464', 'Footer contact phone number'),
  ('footer_email', 'support@example.com', 'Footer contact email'),
  ('footer_address', 'Lagos, Nigeria', 'Footer contact address'),
  ('footer_company_name', 'Haaman Network', 'Company name for footer'),
  ('service_airtime_status', 'active', 'Status for airtime service: active, disabled, or coming_soon'),
  ('service_data_status', 'active', 'Status for data service: active, disabled, or coming_soon'),
  ('service_electricity_status', 'active', 'Status for electricity service: active, disabled, or coming_soon'),
  ('service_tv_status', 'active', 'Status for TV service: active, disabled, or coming_soon'),
  ('service_waec_status', 'active', 'Status for WAEC service: active, disabled, or coming_soon'),
  ('service_store_status', 'active', 'Status for store service: active, disabled, or coming_soon'),
  ('service_support_status', 'active', 'Status for support service: active, disabled, or coming_soon'),
  ('service_refer_status', 'active', 'Status for referral service: active, disabled, or coming_soon')
ON CONFLICT (key) DO NOTHING;