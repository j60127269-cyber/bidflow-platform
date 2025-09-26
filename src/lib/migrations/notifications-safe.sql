-- Notifications System Database Schema - SAFE VERSION
-- This file handles existing constraints gracefully

-- Step 1: Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  notification_status VARCHAR(20) DEFAULT 'pending',
  channel VARCHAR(20) DEFAULT 'email',
  priority VARCHAR(10) DEFAULT 'medium',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add constraints only if they don't exist
DO $$ 
BEGIN
    -- Add type constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_type_check' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('new_contract_match', 'deadline_reminder'));
    END IF;

    -- Add status constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_status_check' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_status_check 
        CHECK (notification_status IN ('pending', 'sent', 'failed', 'read'));
    END IF;

    -- Add channel constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_channel_check' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_channel_check 
        CHECK (channel IN ('email', 'in_app', 'whatsapp'));
    END IF;

    -- Add priority constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_priority_check' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_priority_check 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
END $$;

-- Step 3: Create user notification preferences table
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

-- Step 4: Create indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Step 5: Enable RLS (if not already enabled)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notification preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON user_notification_preferences;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'Notification system schema created successfully!' as status;
