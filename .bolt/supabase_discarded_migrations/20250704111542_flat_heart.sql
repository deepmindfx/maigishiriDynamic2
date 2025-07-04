/*
  # Add More Service Status Setting

  1. New Settings
    - `service_more_status` - Controls visibility of the "More" button on user dashboard
  
  2. Security
    - Setting is protected by existing RLS policies
    - Only admins can modify this setting
*/

-- Add service_more_status setting if it doesn't exist
INSERT INTO admin_settings (key, value, description) 
VALUES 
  ('service_more_status', 'active', 'Status for more service: active, disabled, or coming_soon')
ON CONFLICT (key) DO NOTHING;