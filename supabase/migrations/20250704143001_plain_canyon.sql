/*
  # Add More Button Setting

  1. New Settings
    - Add a new setting for controlling the "More" button visibility
    
  2. Default Configuration
    - Set the default value to 'active' to maintain current behavior
*/

-- Check if the setting already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_settings 
    WHERE key = 'service_more_status'
  ) THEN
    -- Insert the new setting
    INSERT INTO admin_settings (key, value, description)
    VALUES (
      'service_more_status',
      'active',
      'Controls visibility of the More button in the dashboard. Values: active, disabled, coming_soon'
    );
  END IF;
END $$;