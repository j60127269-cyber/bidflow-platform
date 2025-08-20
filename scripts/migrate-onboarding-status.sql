-- Migration script to add onboarding_completed column and set it for existing users

-- Add the onboarding_completed column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to mark onboarding as completed if they have the required fields
UPDATE profiles 
SET onboarding_completed = TRUE 
WHERE preferred_categories IS NOT NULL 
  AND array_length(preferred_categories, 1) > 0
  AND business_type IS NOT NULL 
  AND business_type != ''
  AND min_contract_value IS NOT NULL;

-- Add an index for better performance when checking onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Add an index for user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
