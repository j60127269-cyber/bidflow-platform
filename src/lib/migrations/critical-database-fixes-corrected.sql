-- =============================================
-- CRITICAL DATABASE SCHEMA FIXES (CORRECTED VERSION)
-- =============================================
-- This migration fixes critical database schema inconsistencies
-- with correct column names for the actual database schema
-- Run this AFTER cleanup-orphaned-data.sql

-- =============================================
-- 1. ADD MISSING FOREIGN KEY CONSTRAINTS (SAFE)
-- =============================================

-- Add foreign key for contracts.published_by -> profiles.id (with orphaned data handling)
DO $$ 
BEGIN
    -- First, clean up any orphaned published_by references
    UPDATE contracts 
    SET published_by = NULL 
    WHERE published_by IS NOT NULL 
    AND published_by NOT IN (SELECT id FROM profiles);
    
    -- Then add the constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_contracts_published_by'
    ) THEN
        ALTER TABLE contracts 
        ADD CONSTRAINT fk_contracts_published_by 
        FOREIGN KEY (published_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key for bid_tracking.user_id -> profiles.id (with orphaned data handling)
DO $$ 
BEGIN
    -- First, clean up any orphaned user_id references
    DELETE FROM bid_tracking 
    WHERE user_id NOT IN (SELECT id FROM profiles);
    
    -- Then add the constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bid_tracking_user_id'
    ) THEN
        ALTER TABLE bid_tracking 
        ADD CONSTRAINT fk_bid_tracking_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for bid_tracking.contract_id -> contracts.id (with orphaned data handling)
DO $$ 
BEGIN
    -- First, clean up any orphaned contract_id references
    DELETE FROM bid_tracking 
    WHERE contract_id NOT IN (SELECT id FROM contracts);
    
    -- Then add the constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bid_tracking_contract_id'
    ) THEN
        ALTER TABLE bid_tracking 
        ADD CONSTRAINT fk_bid_tracking_contract_id 
        FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for notifications.user_id -> auth.users.id (with orphaned data handling)
DO $$ 
BEGIN
    -- First, clean up any orphaned user_id references
    DELETE FROM notifications 
    WHERE user_id NOT IN (SELECT id FROM auth.users);
    
    -- Then add the constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_notifications_user_id'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for user_notification_preferences.user_id -> auth.users.id (with orphaned data handling)
DO $$ 
BEGIN
    -- First, clean up any orphaned user_id references
    DELETE FROM user_notification_preferences 
    WHERE user_id NOT IN (SELECT id FROM auth.users);
    
    -- Then add the constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_notification_preferences_user_id'
    ) THEN
        ALTER TABLE user_notification_preferences 
        ADD CONSTRAINT fk_user_notification_preferences_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================
-- 2. ADD CRITICAL DATABASE INDEXES
-- =============================================

-- Indexes for contracts table (using correct column names)
CREATE INDEX IF NOT EXISTS idx_contracts_category ON contracts(category);
CREATE INDEX IF NOT EXISTS idx_contracts_submission_deadline ON contracts(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_contracts_publish_status ON contracts(publish_status);
CREATE INDEX IF NOT EXISTS idx_contracts_published_at ON contracts(published_at);
CREATE INDEX IF NOT EXISTS idx_contracts_procuring_entity ON contracts(procuring_entity);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);

-- Indexes for bid_tracking table
CREATE INDEX IF NOT EXISTS idx_bid_tracking_user_id ON bid_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_tracking_contract_id ON bid_tracking(contract_id);
CREATE INDEX IF NOT EXISTS idx_bid_tracking_tracking_active ON bid_tracking(tracking_active);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =============================================
-- 3. FIX DATA TYPE CONSISTENCIES (USING CORRECT COLUMN NAMES)
-- =============================================

-- Ensure all timestamp columns have proper timezone handling
ALTER TABLE contracts ALTER COLUMN submission_deadline TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE contracts ALTER COLUMN published_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE contracts ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE contracts ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE bid_tracking ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE bid_tracking ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================
-- 4. ADD MISSING COLUMNS WITH DEFAULTS
-- =============================================

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contract_type_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'real-time' CHECK (notification_frequency IN ('real-time', 'daily'));

-- Add missing columns to contracts table (only if they don't exist)
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS estimated_value_min BIGINT,
ADD COLUMN IF NOT EXISTS estimated_value_max BIGINT,
ADD COLUMN IF NOT EXISTS procurement_method TEXT,
ADD COLUMN IF NOT EXISTS bid_security TEXT,
ADD COLUMN IF NOT EXISTS bid_fee NUMERIC;

-- =============================================
-- 5. ENHANCE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view published contracts" ON contracts;
DROP POLICY IF EXISTS "Users can view own bid tracking" ON bid_tracking;
DROP POLICY IF EXISTS "Users can manage own bid tracking" ON bid_tracking;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON user_notification_preferences;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view published contracts" ON contracts
    FOR SELECT USING (publish_status = 'published');

CREATE POLICY "Admins can manage all contracts" ON contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view own bid tracking" ON bid_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bid tracking" ON bid_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification preferences" ON user_notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 6. ADD DATA VALIDATION CONSTRAINTS
-- =============================================

-- Add check constraints for data validation
ALTER TABLE contracts 
ADD CONSTRAINT chk_contracts_estimated_value 
CHECK (estimated_value_min IS NULL OR estimated_value_max IS NULL OR estimated_value_min <= estimated_value_max);

-- Note: Removed the future deadline constraint as it conflicts with historical data
-- Historical contracts may have past deadlines which is valid for the system

ALTER TABLE profiles 
ADD CONSTRAINT chk_profiles_experience_years 
CHECK (experience_years IS NULL OR experience_years >= 0);

ALTER TABLE profiles 
ADD CONSTRAINT chk_profiles_team_size 
CHECK (team_size IS NULL OR team_size >= 0);

-- =============================================
-- 7. CREATE AUDIT TRIGGERS
-- =============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bid_tracking_updated_at ON bid_tracking;
CREATE TRIGGER update_bid_tracking_updated_at
    BEFORE UPDATE ON bid_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. CREATE USEFUL DATABASE FUNCTIONS (CORRECTED)
-- =============================================

-- Function to get user's contract matches (using correct column names)
CREATE OR REPLACE FUNCTION get_user_contract_matches(user_uuid UUID)
RETURNS TABLE (
    contract_id UUID,
    title TEXT,
    category TEXT,
    submission_deadline TIMESTAMP WITH TIME ZONE,
    estimated_value_min BIGINT,
    estimated_value_max BIGINT,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.category,
        c.submission_deadline,
        c.estimated_value_min,
        c.estimated_value_max,
        CASE 
            WHEN c.category = ANY(p.preferred_categories) THEN 100
            WHEN c.category = ANY(p.industry_preferences) THEN 80
            WHEN c.category = ANY(p.contract_type_preferences) THEN 60
            ELSE 40
        END as match_score
    FROM contracts c
    CROSS JOIN profiles p
    WHERE p.id = user_uuid
    AND c.publish_status = 'published'
    AND c.submission_deadline > NOW()
    ORDER BY match_score DESC, c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(user_uuid UUID)
RETURNS TABLE (
    total_notifications BIGINT,
    unread_notifications BIGINT,
    pending_notifications BIGINT,
    failed_notifications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_notifications,
        COUNT(*) FILTER (WHERE notification_status = 'sent' AND read_at IS NULL) as unread_notifications,
        COUNT(*) FILTER (WHERE notification_status = 'pending') as pending_notifications,
        COUNT(*) FILTER (WHERE notification_status = 'failed') as failed_notifications
    FROM notifications
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. CREATE VIEWS FOR COMMON QUERIES (CORRECTED)
-- =============================================

-- View for active contracts with user tracking info (using correct column names)
CREATE OR REPLACE VIEW active_contracts_with_tracking AS
SELECT 
    c.*,
    bt.user_id as tracked_by_user,
    bt.tracking_active,
    bt.email_alerts,
    bt.whatsapp_alerts
FROM contracts c
LEFT JOIN bid_tracking bt ON c.id = bt.contract_id
WHERE c.publish_status = 'published'
AND c.submission_deadline > NOW();

-- View for user dashboard data
CREATE OR REPLACE VIEW user_dashboard_data AS
SELECT 
    p.id,
    p.email,
    p.company_name,
    p.business_type,
    p.subscription_status,
    COUNT(DISTINCT bt.contract_id) as tracked_contracts,
    COUNT(DISTINCT n.id) as total_notifications,
    COUNT(DISTINCT n.id) FILTER (WHERE n.notification_status = 'sent' AND n.read_at IS NULL) as unread_notifications
FROM profiles p
LEFT JOIN bid_tracking bt ON p.id = bt.user_id AND bt.tracking_active = true
LEFT JOIN notifications n ON p.id = n.user_id
GROUP BY p.id, p.email, p.company_name, p.business_type, p.subscription_status;

-- =============================================
-- 10. PERFORMANCE OPTIMIZATION
-- =============================================

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE contracts;
ANALYZE bid_tracking;
ANALYZE notifications;
ANALYZE user_notification_preferences;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Critical database schema fixes completed successfully!';
    RAISE NOTICE 'Added foreign key constraints, indexes, RLS policies, and audit triggers.';
    RAISE NOTICE 'Created useful functions and views for better performance.';
    RAISE NOTICE 'All orphaned data has been cleaned up safely.';
    RAISE NOTICE 'Used correct column names: submission_deadline instead of deadline.';
END $$;
