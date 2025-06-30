/*
  # Add app_base_url setting for dynamic referral links

  1. New Settings
    - `app_base_url` - Base URL for the application, used for referral links
  
  2. Purpose
    - Allow admins to change the domain for referral links when the site domain changes
    - Centralize URL management for consistent branding across the application
*/

-- Add app_base_url setting if it doesn't exist
INSERT INTO admin_settings (key, value, description) 
VALUES 
  ('app_base_url', 'https://haamannetwork.com', 'Base URL for the application (used for referral links and other external URLs)')
ON CONFLICT (key) DO NOTHING;