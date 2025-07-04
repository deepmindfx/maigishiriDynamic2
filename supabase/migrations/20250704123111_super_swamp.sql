/*
  # Add More Button Setting

  1. New Settings
    - Add service_more_status setting to control the visibility of the "More" button
    - Default value is 'active' to maintain current behavior

  2. Security
    - Setting is protected by existing RLS policies
    - Only admins can modify this setting
*/

-- Add service_more_status setting if it doesn't exist
INSERT INTO admin_settings (key, value, description) 
VALUES 
  ('service_more_status', 'active', 'Status for the More button: active, disabled, or coming_soon')
ON CONFLICT (key) DO NOTHING;