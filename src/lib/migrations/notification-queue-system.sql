-- Enhanced Notification Queue System
-- This migration creates a comprehensive notification system with queue management

-- 1. Create notification queue table with status tracking
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  contract_version INTEGER NOT NULL DEFAULT 1,
  type VARCHAR(50) NOT NULL DEFAULT 'contract_match',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 1 CHECK (priority IN (1, 2, 3)), -- 1=normal, 2=high, 3=urgent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 2,
  error_message TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_message_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create contract versions tracking table
CREATE TABLE IF NOT EXISTS contract_versions (
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changes_summary TEXT,
  PRIMARY KEY (contract_id, version)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_contract ON notification_queue(contract_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created ON notification_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority, scheduled_at) WHERE status = 'pending';

-- 4. Create unique constraint to prevent duplicates for same contract version
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_queue_unique 
ON notification_queue(user_id, contract_id, contract_version, type) 
WHERE status != 'cancelled';

-- 5. Create function to get queue statistics
CREATE OR REPLACE FUNCTION get_notification_queue_stats()
RETURNS TABLE (
  total_notifications BIGINT,
  pending_count BIGINT,
  processing_count BIGINT,
  sent_count BIGINT,
  failed_count BIGINT,
  cancelled_count BIGINT,
  success_rate NUMERIC,
  avg_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_count,
    COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as success_rate,
    AVG(processed_at - created_at) FILTER (WHERE processed_at IS NOT NULL) as avg_processing_time
  FROM notification_queue;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete notifications older than 30 days that are sent or failed
  DELETE FROM notification_queue 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND status IN ('sent', 'failed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to increment contract version
CREATE OR REPLACE FUNCTION increment_contract_version(contract_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_version INTEGER;
BEGIN
  -- Get current version
  SELECT COALESCE(MAX(version), 0) + 1 INTO new_version
  FROM contract_versions 
  WHERE contract_id = contract_uuid;
  
  -- Insert new version
  INSERT INTO contract_versions (contract_id, version, updated_at)
  VALUES (contract_uuid, new_version, NOW());
  
  RETURN new_version;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically increment version on contract updates
CREATE OR REPLACE FUNCTION trigger_increment_contract_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if status changed to published
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    PERFORM increment_contract_version(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contract_version_increment
  AFTER UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_increment_contract_version();

-- 9. Create RLS policies for notification queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own notifications
CREATE POLICY "Users can view own notifications" ON notification_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for admins to manage all notifications
CREATE POLICY "Admins can manage all notifications" ON notification_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 10. Create view for queue management dashboard
CREATE OR REPLACE VIEW notification_queue_dashboard AS
SELECT 
  nq.id,
  nq.user_id,
  p.email as user_email,
  CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) as user_name,
  nq.contract_id,
  c.title as contract_title,
  c.procuring_entity,
  nq.contract_version,
  nq.type,
  nq.status,
  nq.priority,
  nq.created_at,
  nq.scheduled_at,
  nq.processed_at,
  nq.retry_count,
  nq.max_retries,
  nq.error_message,
  nq.email_sent,
  nq.email_sent_at,
  CASE 
    WHEN nq.status = 'processing' THEN 'In Progress'
    WHEN nq.status = 'pending' THEN 'Waiting'
    WHEN nq.status = 'sent' THEN 'Delivered'
    WHEN nq.status = 'failed' THEN 'Failed'
    WHEN nq.status = 'cancelled' THEN 'Cancelled'
    ELSE 'Unknown'
  END as status_display,
  CASE 
    WHEN nq.priority = 1 THEN 'Normal'
    WHEN nq.priority = 2 THEN 'High'
    WHEN nq.priority = 3 THEN 'Urgent'
    ELSE 'Unknown'
  END as priority_display
FROM notification_queue nq
LEFT JOIN profiles p ON nq.user_id = p.id
LEFT JOIN contracts c ON nq.contract_id = c.id;

-- 11. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_queue TO authenticated;
GRANT SELECT ON notification_queue_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_queue_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_contract_version(UUID) TO authenticated;

-- 12. Insert initial data for existing contracts
INSERT INTO contract_versions (contract_id, version, updated_at)
SELECT 
  id as contract_id,
  1 as version,
  created_at as updated_at
FROM contracts 
WHERE status = 'published'
ON CONFLICT (contract_id, version) DO NOTHING;

-- 13. Create notification queue processing function
CREATE OR REPLACE FUNCTION process_notification_queue(batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
  processed_count INTEGER,
  success_count INTEGER,
  failure_count INTEGER
) AS $$
DECLARE
  notification_record RECORD;
  success_count INTEGER := 0;
  failure_count INTEGER := 0;
  processed_count INTEGER := 0;
BEGIN
  -- Process pending notifications in priority order
  FOR notification_record IN
    SELECT * FROM notification_queue 
    WHERE status = 'pending' 
    AND scheduled_at <= NOW()
    ORDER BY priority DESC, created_at ASC
    LIMIT batch_size
  LOOP
    -- Mark as processing
    UPDATE notification_queue 
    SET status = 'processing', processed_at = NOW()
    WHERE id = notification_record.id;
    
    processed_count := processed_count + 1;
    
    -- Here you would call the actual email sending logic
    -- For now, we'll simulate success/failure
    IF random() > 0.1 THEN -- 90% success rate for simulation
      UPDATE notification_queue 
      SET status = 'sent', email_sent = TRUE, email_sent_at = NOW()
      WHERE id = notification_record.id;
      success_count := success_count + 1;
    ELSE
      -- Simulate failure and retry logic
      IF notification_record.retry_count >= notification_record.max_retries THEN
        UPDATE notification_queue 
        SET status = 'failed', error_message = 'Max retries exceeded'
        WHERE id = notification_record.id;
        failure_count := failure_count + 1;
      ELSE
        UPDATE notification_queue 
        SET 
          status = 'pending',
          retry_count = notification_record.retry_count + 1,
          scheduled_at = NOW() + (INTERVAL '1 minute' * POWER(2, notification_record.retry_count))
        WHERE id = notification_record.id;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT processed_count, success_count, failure_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Create cleanup job (run daily)
-- This would typically be set up as a cron job
-- SELECT cleanup_old_notifications();

COMMENT ON TABLE notification_queue IS 'Queue system for managing email notifications with retry logic and status tracking';
COMMENT ON TABLE contract_versions IS 'Tracks contract version changes to enable re-notifications for updates';
COMMENT ON FUNCTION get_notification_queue_stats() IS 'Returns comprehensive statistics about the notification queue';
COMMENT ON FUNCTION process_notification_queue(INTEGER) IS 'Processes pending notifications in batches with retry logic';
