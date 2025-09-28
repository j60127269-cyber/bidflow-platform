-- Remove Daily Digest Functionality
-- This migration removes daily digest features and keeps only immediate notifications and deadline reminders

-- 1. Remove daily_digest from notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('new_contract_match', 'deadline_reminder'));

-- 2. Remove daily_digest_enabled from user_notification_preferences
ALTER TABLE user_notification_preferences DROP COLUMN IF EXISTS daily_digest_enabled;

-- 3. Remove daily_digest_enabled from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS daily_digest_enabled;

-- 4. Update notification frequency to only allow real-time
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_notification_frequency_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_notification_frequency_check 
  CHECK (notification_frequency IN ('real-time'));

-- 5. Update existing users to use real-time notifications
UPDATE profiles SET notification_frequency = 'real-time' WHERE notification_frequency = 'daily';

-- 6. Remove any existing daily digest notifications
DELETE FROM notifications WHERE type = 'daily_digest';

-- 7. Update user preferences to remove daily digest
UPDATE user_notification_preferences SET 
  new_contract_notifications = true,
  deadline_reminders = true,
  email_enabled = true,
  in_app_enabled = true,
  whatsapp_enabled = false;

-- 8. Clean up any orphaned preferences
DELETE FROM user_notification_preferences 
WHERE user_id NOT IN (SELECT id FROM profiles);

SELECT 'Daily digest functionality removed successfully!' as status;
