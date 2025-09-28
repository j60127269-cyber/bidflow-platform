-- Simple Notification System Setup
-- This migration works with your existing database structure

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_contract_match', 'deadline_reminder', 'daily_digest')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  notification_status VARCHAR(20) DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'failed', 'read')),
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email', 'in_app', 'whatsapp')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_contract_notifications BOOLEAN DEFAULT true,
  deadline_reminders BOOLEAN DEFAULT true,
  daily_digest_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Add notification preferences to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contract_type_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS daily_digest_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('real-time', 'daily'));

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- 5. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Initialize preferences for existing users
INSERT INTO user_notification_preferences (user_id, new_contract_notifications, deadline_reminders, daily_digest_enabled, email_enabled, in_app_enabled, whatsapp_enabled)
SELECT 
  p.id,
  COALESCE(p.email_notifications, true),
  true,
  COALESCE(p.daily_digest_enabled, true),
  COALESCE(p.email_notifications, true),
  true,
  COALESCE(p.whatsapp_notifications, false)
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_notification_preferences unp 
  WHERE unp.user_id = p.id
);
