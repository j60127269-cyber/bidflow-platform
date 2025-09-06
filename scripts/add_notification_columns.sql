-- Add notification preference columns to profiles table
-- Run this script to add notification settings to user profiles

-- Add notification preference columns one by one
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'real-time';

-- Add check constraint for notification frequency (drop first if exists)
DO $$ 
BEGIN
    -- Only add constraint if the column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'notification_frequency'
    ) THEN
        -- Drop constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'check_notification_frequency' 
            AND table_name = 'profiles'
        ) THEN
            ALTER TABLE profiles DROP CONSTRAINT check_notification_frequency;
        END IF;
        
        -- Add the constraint
        ALTER TABLE profiles 
        ADD CONSTRAINT check_notification_frequency 
        CHECK (notification_frequency IN ('real-time', 'daily'));
    END IF;
END $$;

-- Add index for notification preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_notification_prefs'
    ) THEN
        CREATE INDEX idx_profiles_notification_prefs 
        ON profiles(email_notifications, whatsapp_notifications, notification_frequency);
    END IF;
END $$;

-- Update existing profiles with default values
UPDATE profiles 
SET 
  email_notifications = true,
  whatsapp_notifications = false,
  notification_frequency = 'real-time'
WHERE 
  email_notifications IS NULL 
  OR whatsapp_notifications IS NULL 
  OR notification_frequency IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.email_notifications IS 'Whether user wants to receive email notifications';
COMMENT ON COLUMN profiles.whatsapp_notifications IS 'Whether user wants to receive WhatsApp notifications';
COMMENT ON COLUMN profiles.whatsapp_number IS 'User WhatsApp number for notifications';
COMMENT ON COLUMN profiles.notification_frequency IS 'How often user wants notifications: real-time or daily';
