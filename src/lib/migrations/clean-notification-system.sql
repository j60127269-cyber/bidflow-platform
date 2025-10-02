-- Clean Notification System Migration
-- Removes WhatsApp references and consolidates notification system
-- Run this after the database schema fixes

-- =============================================
-- 1. REMOVE WHATSAPP REFERENCES
-- =============================================

-- Remove WhatsApp columns from user_notification_preferences
ALTER TABLE user_notification_preferences 
DROP COLUMN IF EXISTS whatsapp_enabled;

-- Remove WhatsApp from notifications channel constraint
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_channel_check;

-- Update channel constraint to remove WhatsApp
ALTER TABLE notifications 
ADD CONSTRAINT notifications_channel_check 
CHECK (channel IN ('email', 'in_app'));

-- =============================================
-- 2. ADD ENHANCED NOTIFICATION FEATURES
-- =============================================

-- Add delivery tracking columns to notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS message_id TEXT,
ADD COLUMN IF NOT EXISTS delivery_time INTEGER, -- milliseconds
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add quiet hours to user preferences
ALTER TABLE user_notification_preferences 
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME;

-- =============================================
-- 3. CREATE NOTIFICATION PERFORMANCE VIEWS
-- =============================================

-- View for notification delivery statistics
CREATE OR REPLACE VIEW notification_delivery_stats AS
SELECT 
    DATE(created_at) as date,
    type,
    channel,
    notification_status,
    COUNT(*) as count,
    AVG(delivery_time) as avg_delivery_time,
    AVG(retry_count) as avg_retry_count
FROM notifications
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), type, channel, notification_status
ORDER BY date DESC;

-- View for user notification preferences summary
CREATE OR REPLACE VIEW user_notification_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.company_name,
    unp.new_contract_notifications,
    unp.deadline_reminders,
    unp.email_enabled,
    unp.in_app_enabled,
    unp.quiet_hours_start,
    unp.quiet_hours_end,
    COUNT(n.id) as total_notifications,
    COUNT(n.id) FILTER (WHERE n.notification_status = 'sent') as sent_notifications,
    COUNT(n.id) FILTER (WHERE n.notification_status = 'failed') as failed_notifications,
    COUNT(n.id) FILTER (WHERE n.notification_status = 'pending') as pending_notifications
FROM profiles p
LEFT JOIN user_notification_preferences unp ON p.id = unp.user_id
LEFT JOIN notifications n ON p.id = n.user_id
GROUP BY p.id, p.email, p.company_name, unp.new_contract_notifications, 
         unp.deadline_reminders, unp.email_enabled, unp.in_app_enabled,
         unp.quiet_hours_start, unp.quiet_hours_end;

-- =============================================
-- 4. CREATE NOTIFICATION CLEANUP FUNCTIONS
-- =============================================

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete notifications older than 90 days that are not pending
    DELETE FROM notifications 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
    AND notification_status != 'pending';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed notifications
CREATE OR REPLACE FUNCTION retry_failed_notifications()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Reset failed notifications that are less than 24 hours old
    UPDATE notifications 
    SET notification_status = 'pending',
        retry_count = 0,
        error_message = NULL
    WHERE notification_status = 'failed'
    AND created_at > CURRENT_DATE - INTERVAL '24 hours'
    AND retry_count < 3;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. CREATE NOTIFICATION MONITORING TRIGGERS
-- =============================================

-- Function to log notification status changes
CREATE OR REPLACE FUNCTION log_notification_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log significant status changes
    IF OLD.notification_status != NEW.notification_status THEN
        INSERT INTO notification_logs (
            notification_id,
            old_status,
            new_status,
            changed_at
        ) VALUES (
            NEW.id,
            OLD.notification_status,
            NEW.notification_status,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notification_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for notification status changes
DROP TRIGGER IF EXISTS notification_status_change_trigger ON notifications;
CREATE TRIGGER notification_status_change_trigger
    AFTER UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION log_notification_status_change();

-- =============================================
-- 6. UPDATE EXISTING DATA
-- =============================================

-- Update existing notifications to remove WhatsApp channel
UPDATE notifications 
SET channel = 'email'
WHERE channel = 'whatsapp';

-- Initialize notification preferences for existing users who don't have them
-- Only for users that exist in auth.users table
INSERT INTO user_notification_preferences (user_id, new_contract_notifications, deadline_reminders, email_enabled, in_app_enabled)
SELECT 
    p.id,
    true,
    true,
    true,
    true
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
LEFT JOIN user_notification_preferences unp ON p.id = unp.user_id
WHERE unp.user_id IS NULL;

-- =============================================
-- 7. CREATE PERFORMANCE INDEXES
-- =============================================

-- Index for notification processing
CREATE INDEX IF NOT EXISTS idx_notifications_processing 
ON notifications(notification_status, scheduled_at, created_at);

-- Index for user notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_status 
ON notifications(user_id, notification_status, created_at);

-- Index for delivery tracking
CREATE INDEX IF NOT EXISTS idx_notifications_delivery 
ON notifications(delivery_time, retry_count, notification_status);

-- =============================================
-- 8. CREATE MAINTENANCE PROCEDURES
-- =============================================

-- Procedure to run daily notification maintenance
CREATE OR REPLACE FUNCTION daily_notification_maintenance()
RETURNS TABLE (
    cleaned_notifications INTEGER,
    retried_notifications INTEGER,
    total_pending INTEGER
) AS $$
DECLARE
    cleaned_count INTEGER;
    retried_count INTEGER;
    pending_count INTEGER;
BEGIN
    -- Clean up old notifications
    SELECT cleanup_old_notifications() INTO cleaned_count;
    
    -- Retry failed notifications
    SELECT retry_failed_notifications() INTO retried_count;
    
    -- Count pending notifications
    SELECT COUNT(*) INTO pending_count
    FROM notifications
    WHERE notification_status = 'pending';
    
    RETURN QUERY SELECT cleaned_count, retried_count, pending_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Clean notification system migration completed successfully!';
    RAISE NOTICE 'Removed WhatsApp references and enhanced notification system.';
    RAISE NOTICE 'Added delivery tracking, quiet hours, and performance optimizations.';
    RAISE NOTICE 'Created monitoring triggers and maintenance procedures.';
END $$;
