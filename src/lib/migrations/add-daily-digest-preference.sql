-- Add daily_digest_enabled field to user_notification_preferences table
-- This field is MANDATORY for all users - controls daily digest emails

-- Add the column if it doesn't exist (mandatory field)
ALTER TABLE user_notification_preferences 
ADD COLUMN IF NOT EXISTS daily_digest_enabled BOOLEAN NOT NULL DEFAULT true;

-- Update existing users to have daily digest enabled (mandatory for all)
UPDATE user_notification_preferences 
SET daily_digest_enabled = true 
WHERE daily_digest_enabled IS NULL OR daily_digest_enabled = false;

-- Ensure all users have daily digest enabled (mandatory)
UPDATE user_notification_preferences 
SET daily_digest_enabled = true;

-- Add comment to the column
COMMENT ON COLUMN user_notification_preferences.daily_digest_enabled IS 'MANDATORY: Controls whether user receives daily digest emails with matched opportunities. All users must have this enabled.';

-- Add constraint to ensure it's always true
ALTER TABLE user_notification_preferences 
ADD CONSTRAINT daily_digest_mandatory 
CHECK (daily_digest_enabled = true);
