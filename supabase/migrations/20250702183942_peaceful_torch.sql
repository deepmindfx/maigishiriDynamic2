/*
  # Add referral reward type settings

  1. New Settings
    - `referral_reward_type` - Type of reward for referrals
    - `referral_reward_airtime_amount` - Amount of airtime to reward
    - `referral_reward_cash_amount` - Amount of cash to reward
  
  2. Changes
    - Add constraint to referral_rewards table to validate reward_type
*/

-- Add new settings for referral rewards if they don't exist
DO $$
BEGIN
  -- Check and add referral_reward_type setting
  IF NOT EXISTS (SELECT 1 FROM admin_settings WHERE key = 'referral_reward_type') THEN
    INSERT INTO admin_settings (key, value, description)
    VALUES ('referral_reward_type', 'data_bundle', 'Type of reward for referrals (data_bundle, airtime, wallet_credit)');
  END IF;

  -- Check and add referral_reward_airtime_amount setting
  IF NOT EXISTS (SELECT 1 FROM admin_settings WHERE key = 'referral_reward_airtime_amount') THEN
    INSERT INTO admin_settings (key, value, description)
    VALUES ('referral_reward_airtime_amount', '1000', 'Amount of airtime to reward (in local currency)');
  END IF;

  -- Check and add referral_reward_cash_amount setting
  IF NOT EXISTS (SELECT 1 FROM admin_settings WHERE key = 'referral_reward_cash_amount') THEN
    INSERT INTO admin_settings (key, value, description)
    VALUES ('referral_reward_cash_amount', '1000', 'Amount of cash to reward (in local currency)');
  END IF;
END $$;

-- Add constraint to referral_rewards table to validate reward_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'referral_rewards_reward_type_check' 
    AND conrelid = 'referral_rewards'::regclass
  ) THEN
    ALTER TABLE referral_rewards
    ADD CONSTRAINT referral_rewards_reward_type_check
    CHECK (reward_type IN ('data_bundle', 'airtime', 'wallet_credit'));
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, constraint will be added in another migration
    NULL;
END $$;