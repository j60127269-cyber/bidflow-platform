-- Complete Notification System Migration
-- This migration creates the complete notification system integrated with existing tables

-- 1. First, let's check if we need to create the user_profiles table or if it exists as 'profiles'
-- We'll create user_profiles as an alias to the existing profiles table

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_contract_match', 'deadline_reminder', 'daily_digest')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Contract details, links, etc.
  notification_status VARCHAR(20) DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'failed', 'read')),
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email', 'in_app', 'whatsapp')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_contract_notifications BOOLEAN DEFAULT true,
  deadline_reminders BOOLEAN DEFAULT true,
  daily_digest_enabled BOOLEAN DEFAULT true, -- MANDATORY for all users
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Add notification preferences to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contract_type_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS daily_digest_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('real-time', 'daily'));

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- 6. Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- User notification preferences RLS policies
CREATE POLICY "Users can view their own preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Create database functions for notification management
CREATE OR REPLACE FUNCTION get_user_notification_preferences(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  new_contract_notifications BOOLEAN,
  deadline_reminders BOOLEAN,
  daily_digest_enabled BOOLEAN,
  email_enabled BOOLEAN,
  in_app_enabled BOOLEAN,
  whatsapp_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unp.user_id,
    unp.new_contract_notifications,
    unp.deadline_reminders,
    unp.daily_digest_enabled,
    unp.email_enabled,
    unp.in_app_enabled,
    unp.whatsapp_enabled
  FROM user_notification_preferences unp
  WHERE unp.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_channel VARCHAR(20) DEFAULT 'email',
  p_priority VARCHAR(10) DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, data, channel, priority
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_data, p_channel, p_priority
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_pending_notifications()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  data JSONB,
  channel VARCHAR(20),
  priority VARCHAR(10)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.message,
    n.data,
    n.channel,
    n.priority
  FROM notifications n
  WHERE n.notification_status = 'pending'
  ORDER BY n.priority DESC, n.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to process new contract notifications
CREATE OR REPLACE FUNCTION process_new_contract_notifications(contract_data JSONB)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  contract_id UUID;
  contract_title TEXT;
  contract_industry TEXT;
  contract_location TEXT;
  contract_category TEXT;
BEGIN
  -- Extract contract information
  contract_id := (contract_data->>'id')::UUID;
  contract_title := contract_data->>'title';
  contract_industry := contract_data->>'industry';
  contract_location := contract_data->>'location';
  contract_category := contract_data->>'category';
  
  -- Find users whose preferences match this contract
  FOR user_record IN
    SELECT DISTINCT p.id, p.email, p.industry_preferences, p.location_preferences, p.contract_type_preferences
    FROM profiles p
    WHERE p.email IS NOT NULL
    AND (
      contract_industry = ANY(p.industry_preferences) OR
      contract_location = ANY(p.location_preferences) OR
      contract_category = ANY(p.contract_type_preferences) OR
      array_length(p.industry_preferences, 1) IS NULL OR
      array_length(p.location_preferences, 1) IS NULL OR
      array_length(p.contract_type_preferences, 1) IS NULL
    )
  LOOP
    -- Create notification for matching user
    PERFORM create_notification(
      user_record.id,
      'new_contract_match',
      'New Contract Match: ' || contract_title,
      'A new contract matching your preferences has been published.',
      contract_data,
      'email',
      'high'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to process deadline reminders
CREATE OR REPLACE FUNCTION process_deadline_reminders()
RETURNS VOID AS $$
DECLARE
  contract_record RECORD;
  user_record RECORD;
BEGIN
  -- Find contracts with deadlines in the next 7 days
  FOR contract_record IN
    SELECT c.id, c.title, c.submission_deadline, c.procuring_entity
    FROM contracts c
    WHERE c.submission_deadline IS NOT NULL
    AND c.submission_deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND c.publish_status = 'published'
  LOOP
    -- Find users tracking this contract
    FOR user_record IN
      SELECT bt.user_id, p.email
      FROM bid_tracking bt
      JOIN profiles p ON p.id = bt.user_id
      WHERE bt.contract_id = contract_record.id
      AND bt.tracking_active = true
      AND bt.email_alerts = true
    LOOP
      -- Create deadline reminder notification
      PERFORM create_notification(
        user_record.user_id,
        'deadline_reminder',
        'Deadline Reminder: ' || contract_record.title,
        'Contract deadline is approaching: ' || contract_record.submission_deadline,
        jsonb_build_object(
          'contract_id', contract_record.id,
          'contract_title', contract_record.title,
          'deadline', contract_record.submission_deadline,
          'procuring_entity', contract_record.procuring_entity
        ),
        'email',
        'high'
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Initialize notification preferences for existing users
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

-- 11. Update existing profiles to have default notification preferences
UPDATE profiles 
SET 
  industry_preferences = COALESCE(industry_preferences, '{}'),
  location_preferences = COALESCE(location_preferences, '{}'),
  contract_type_preferences = COALESCE(contract_type_preferences, '{}'),
  daily_digest_enabled = COALESCE(daily_digest_enabled, true),
  email_notifications = COALESCE(email_notifications, true),
  whatsapp_notifications = COALESCE(whatsapp_notifications, false),
  notification_frequency = COALESCE(notification_frequency, 'daily')
WHERE industry_preferences IS NULL 
   OR location_preferences IS NULL 
   OR contract_type_preferences IS NULL 
   OR daily_digest_enabled IS NULL 
   OR email_notifications IS NULL 
   OR whatsapp_notifications IS NULL 
   OR notification_frequency IS NULL;
