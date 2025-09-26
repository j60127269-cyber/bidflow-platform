-- Notifications System Database Schema
-- This file contains the SQL for creating the notification system tables

-- 1. Notifications table - stores all notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_contract_match', 'deadline_reminder')),
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

-- 2. User notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_contract_notifications BOOLEAN DEFAULT true,
  deadline_reminders BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 4. RLS (Row Level Security) policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own preferences
CREATE POLICY "Users can view own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Functions for notification management
CREATE OR REPLACE FUNCTION get_user_notification_preferences(p_user_id UUID)
RETURNS TABLE (
  new_contract_notifications BOOLEAN,
  deadline_reminders BOOLEAN,
  email_enabled BOOLEAN,
  in_app_enabled BOOLEAN,
  whatsapp_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unp.new_contract_notifications,
    unp.deadline_reminders,
    unp.email_enabled,
    unp.in_app_enabled,
    unp.whatsapp_enabled
  FROM user_notification_preferences unp
  WHERE unp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_channel VARCHAR(20) DEFAULT 'email',
  p_priority VARCHAR(10) DEFAULT 'medium',
  p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, data, channel, priority, scheduled_at
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_data, p_channel, p_priority, p_scheduled_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to get pending notifications
CREATE OR REPLACE FUNCTION get_pending_notifications()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  data JSONB,
  channel VARCHAR(20),
  priority VARCHAR(10),
  scheduled_at TIMESTAMP WITH TIME ZONE
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
    n.priority,
    n.scheduled_at
  FROM notifications n
  WHERE n.notification_status = 'pending' 
    AND n.scheduled_at <= NOW()
  ORDER BY n.priority DESC, n.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
