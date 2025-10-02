-- Security Enhancements Migration - FIXED VERSION
-- Adds comprehensive security features including session management and rate limiting

-- =============================================
-- 1. CREATE SESSION MANAGEMENT TABLES
-- =============================================

-- User sessions table for secure session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Session activity log for security monitoring
CREATE TABLE IF NOT EXISTS session_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'refresh', 'invalidate'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CREATE RATE LIMITING TABLES
-- =============================================

-- Rate limit requests tracking
CREATE TABLE IF NOT EXISTS rate_limit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_limit_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limit rules configuration
CREATE TABLE IF NOT EXISTS rate_limit_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    window_ms INTEGER NOT NULL,
    max_requests INTEGER NOT NULL,
    message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. CREATE SECURITY AUDIT TABLES
-- =============================================

-- Security events log
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'login_failed', 'rate_limit_exceeded', 'suspicious_activity'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_count INTEGER DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 4. CREATE PERFORMANCE INDEXES
-- =============================================

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_activity_log_session_id ON session_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activity_log_user_id ON session_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_session_activity_log_created_at ON session_activity_log(created_at);

-- Rate limiting indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_requests_key ON rate_limit_requests(rate_limit_key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_requests_created_at ON rate_limit_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_rules_endpoint ON rate_limit_rules(endpoint, is_active);

-- Security audit indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_blocked ON failed_login_attempts(is_blocked, blocked_until);

-- =============================================
-- 5. CREATE SECURITY FUNCTIONS
-- =============================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Deactivate expired sessions
    UPDATE user_sessions 
    SET is_active = false
    WHERE expires_at < NOW() 
    AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old session records (older than 30 days)
    DELETE FROM user_sessions 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limit_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete rate limit records older than 24 hours
    DELETE FROM rate_limit_requests 
    WHERE created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check and block suspicious IPs
CREATE OR REPLACE FUNCTION check_suspicious_activity()
RETURNS TABLE (
    ip_address INET,
    failed_attempts BIGINT,
    should_block BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fla.ip_address,
        COUNT(*) as failed_attempts,
        (COUNT(*) >= 10 AND MAX(fla.last_attempt) > NOW() - INTERVAL '1 hour') as should_block
    FROM failed_login_attempts fla
    WHERE fla.last_attempt > NOW() - INTERVAL '24 hours'
    GROUP BY fla.ip_address
    HAVING COUNT(*) >= 5;
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type VARCHAR(100),
    p_severity VARCHAR(20),
    p_description TEXT,
    p_ip_address INET,
    p_user_agent TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_events (
        user_id, event_type, severity, description, 
        ip_address, user_agent, metadata
    ) VALUES (
        p_user_id, p_event_type, p_severity, p_description,
        p_ip_address, p_user_agent, p_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. CREATE SECURITY TRIGGERS
-- =============================================

-- Trigger to log session activity
CREATE OR REPLACE FUNCTION log_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log session creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO session_activity_log (
            session_id, user_id, activity_type, ip_address, user_agent
        ) VALUES (
            NEW.id, NEW.user_id, 'created', NEW.ip_address, NEW.user_agent
        );
    END IF;
    
    -- Log session updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO session_activity_log (
            session_id, user_id, activity_type, ip_address, user_agent
        ) VALUES (
            NEW.id, NEW.user_id, 'updated', NEW.ip_address, NEW.user_agent
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session activity logging
DROP TRIGGER IF EXISTS session_activity_trigger ON user_sessions;
CREATE TRIGGER session_activity_trigger
    AFTER INSERT OR UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION log_session_activity();

-- =============================================
-- 7. CREATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on security tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Session activity log policies
CREATE POLICY "Users can view own session activity" ON session_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all session activity" ON session_activity_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Security events policies
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security events" ON security_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Failed login attempts policies (admin only)
CREATE POLICY "Admins can view failed login attempts" ON failed_login_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- 8. INSERT DEFAULT RATE LIMIT RULES
-- =============================================

-- Insert default rate limiting rules (FIXED - removed ON CONFLICT)
INSERT INTO rate_limit_rules (endpoint, window_ms, max_requests, message) VALUES
('/api/auth/login', 900000, 5, 'Too many login attempts. Please try again later.'),
('/api/auth/register', 3600000, 3, 'Too many registration attempts. Please try again later.'),
('/api/auth/reset-password', 3600000, 3, 'Too many password reset attempts. Please try again later.'),
('/api/contracts', 60000, 100, 'Too many requests. Please slow down.'),
('/api/notifications', 60000, 50, 'Too many notification requests. Please slow down.'),
('/api/admin', 60000, 200, 'Admin rate limit exceeded.'),
('/api', 60000, 1000, 'API rate limit exceeded. Please slow down.');

-- =============================================
-- 9. CREATE SECURITY MONITORING VIEWS
-- =============================================

-- View for active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    us.id,
    us.user_id,
    p.email,
    p.company_name,
    us.ip_address,
    us.user_agent,
    us.last_activity,
    us.created_at,
    EXTRACT(EPOCH FROM (NOW() - us.last_activity)) / 60 as minutes_inactive
FROM user_sessions us
JOIN profiles p ON us.user_id = p.id
WHERE us.is_active = true
AND us.expires_at > NOW()
ORDER BY us.last_activity DESC;

-- View for security events summary
CREATE OR REPLACE VIEW security_events_summary AS
SELECT 
    event_type,
    severity,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence,
    COUNT(DISTINCT user_id) as affected_users
FROM security_events
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY event_type, severity
ORDER BY event_count DESC;

-- View for failed login attempts summary
CREATE OR REPLACE VIEW failed_login_summary AS
SELECT 
    email,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(last_attempt) as last_attempt,
    is_blocked,
    blocked_until
FROM failed_login_attempts
WHERE last_attempt >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY email, ip_address, is_blocked, blocked_until
ORDER BY attempt_count DESC;

-- =============================================
-- 10. CREATE MAINTENANCE PROCEDURES
-- =============================================

-- Procedure for daily security maintenance
CREATE OR REPLACE FUNCTION daily_security_maintenance()
RETURNS TABLE (
    expired_sessions INTEGER,
    rate_limit_cleanup INTEGER,
    security_events_count BIGINT
) AS $$
DECLARE
    sessions_cleaned INTEGER;
    rate_limits_cleaned INTEGER;
    events_count BIGINT;
BEGIN
    -- Clean up expired sessions
    SELECT cleanup_expired_sessions() INTO sessions_cleaned;
    
    -- Clean up old rate limit records
    SELECT cleanup_rate_limit_records() INTO rate_limits_cleaned;
    
    -- Count recent security events
    SELECT COUNT(*) INTO events_count
    FROM security_events
    WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours';
    
    RETURN QUERY SELECT sessions_cleaned, rate_limits_cleaned, events_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Security enhancements migration completed successfully!';
    RAISE NOTICE 'Added session management, rate limiting, and security monitoring.';
    RAISE NOTICE 'Created security functions, triggers, and monitoring views.';
    RAISE NOTICE 'Implemented comprehensive security policies and audit trails.';
END $$;
