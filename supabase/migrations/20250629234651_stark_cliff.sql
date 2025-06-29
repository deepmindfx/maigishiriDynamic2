/*
  # Add site_logo_url to admin_settings

  1. New Settings
    - Add site_logo_url to admin_settings table
    - This will allow admins to change the app logo from the admin panel
  
  2. Default Value
    - Set a default placeholder URL for the logo
*/

-- Add site_logo_url to admin_settings if it doesn't exist
INSERT INTO admin_settings (key, value, description) 
VALUES 
  ('site_logo_url', 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg', 'URL for the site logo image')
ON CONFLICT (key) DO NOTHING;