-- Notification System Functions
-- Run this AFTER the tables are created successfully

-- 1. Function to get user notification preferences
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

-- 2. Function to create notification
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

-- 3. Function to get pending notifications
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

-- 4. Function to process new contract notifications
CREATE OR REPLACE FUNCTION process_new_contract_notifications(contract_id UUID)
RETURNS VOID AS $$
DECLARE
  contract_record RECORD;
  user_profile RECORD;
  notification_id UUID;
BEGIN
  -- Get the contract details
  SELECT * INTO contract_record 
  FROM contracts 
  WHERE id = contract_id AND publish_status = 'published';
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Find users whose preferences match this contract's category
  FOR user_profile IN 
    SELECT p.id, p.preferred_categories, unp.new_contract_notifications, unp.email_enabled, unp.in_app_enabled
    FROM profiles p
    LEFT JOIN user_notification_preferences unp ON p.id = unp.user_id
    WHERE p.preferred_categories IS NOT NULL 
      AND contract_record.category = ANY(p.preferred_categories)
      AND (unp.new_contract_notifications IS NULL OR unp.new_contract_notifications = true)
  LOOP
    -- Create notification for each matching user
    SELECT create_notification(
      user_profile.id,
      'new_contract_match',
      'New Contract Match: ' || contract_record.title,
      'A new contract matching your preferences has been published: ' || contract_record.title || 
      ' by ' || contract_record.procuring_entity || 
      '. Deadline: ' || COALESCE(contract_record.submission_deadline::text, 'Not specified'),
      jsonb_build_object(
        'contract_id', contract_record.id,
        'contract_title', contract_record.title,
        'procuring_entity', contract_record.procuring_entity,
        'category', contract_record.category,
        'submission_deadline', contract_record.submission_deadline
      ),
      CASE 
        WHEN user_profile.email_enabled AND user_profile.in_app_enabled THEN 'email'
        WHEN user_profile.in_app_enabled THEN 'in_app'
        ELSE 'email'
      END,
      'medium'
    ) INTO notification_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to process deadline reminders
CREATE OR REPLACE FUNCTION process_deadline_reminders()
RETURNS VOID AS $$
DECLARE
  tracking_record RECORD;
  contract_record RECORD;
  notification_id UUID;
  two_days_from_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate 2 days from now
  two_days_from_now := NOW() + INTERVAL '2 days';
  
  -- Find tracked contracts due in 2 days
  FOR tracking_record IN
    SELECT bt.user_id, bt.contract_id, bt.email_alerts, bt.whatsapp_alerts
    FROM bid_tracking bt
    JOIN contracts c ON bt.contract_id = c.id
    WHERE c.submission_deadline::date = two_days_from_now::date
      AND c.publish_status = 'published'
      AND bt.tracking_active = true
  LOOP
    -- Get contract details
    SELECT * INTO contract_record FROM contracts WHERE id = tracking_record.contract_id;
    
    -- Check user preferences
    IF EXISTS (
      SELECT 1 FROM user_notification_preferences 
      WHERE user_id = tracking_record.user_id 
        AND deadline_reminders = true
    ) THEN
      -- Create deadline reminder notification
      SELECT create_notification(
        tracking_record.user_id,
        'deadline_reminder',
        'Deadline Reminder: ' || contract_record.title || ' - 2 Days Left',
        'The contract you''re tracking is due soon: ' || contract_record.title || 
        ' by ' || contract_record.procuring_entity || 
        '. Deadline: ' || contract_record.submission_deadline::text,
        jsonb_build_object(
          'contract_id', contract_record.id,
          'contract_title', contract_record.title,
          'procuring_entity', contract_record.procuring_entity,
          'submission_deadline', contract_record.submission_deadline,
          'days_remaining', 2
        ),
        CASE 
          WHEN tracking_record.email_alerts THEN 'email'
          ELSE 'in_app'
        END,
        'high'
      ) INTO notification_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Notification functions created successfully!' as status;
