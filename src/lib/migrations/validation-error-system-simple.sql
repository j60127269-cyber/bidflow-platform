-- Validation and Error Logging System Migration - SIMPLE VERSION
-- Adds comprehensive validation and error logging capabilities

-- =============================================
-- 1. CREATE ERROR LOGGING TABLES
-- =============================================

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_code VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('validation', 'authentication', 'database', 'external_service', 'business_logic', 'system')),
    metadata JSONB,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error alerts table
CREATE TABLE IF NOT EXISTS error_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL,
    error_id UUID REFERENCES error_logs(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    context JSONB,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation logs table
CREATE TABLE IF NOT EXISTS validation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    validation_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    errors JSONB,
    success BOOLEAN NOT NULL,
    processing_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CREATE PERFORMANCE INDEXES
-- =============================================

-- Error logs indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
-- SIMPLE: Use regular B-tree index instead of GIN
CREATE INDEX IF NOT EXISTS idx_error_logs_context_endpoint ON error_logs((context->>'endpoint'));

-- Error alerts indexes
CREATE INDEX IF NOT EXISTS idx_error_alerts_alert_type ON error_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_error_alerts_severity ON error_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_error_alerts_acknowledged ON error_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_error_alerts_created_at ON error_alerts(created_at);

-- Validation logs indexes
CREATE INDEX IF NOT EXISTS idx_validation_logs_user_id ON validation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_validation_type ON validation_logs(validation_type);
CREATE INDEX IF NOT EXISTS idx_validation_logs_success ON validation_logs(success);
CREATE INDEX IF NOT EXISTS idx_validation_logs_created_at ON validation_logs(created_at);

-- =============================================
-- 3. CREATE ERROR ANALYSIS FUNCTIONS
-- =============================================

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_errors BIGINT,
    errors_by_severity JSONB,
    errors_by_category JSONB,
    top_error_codes JSONB
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    start_time := NOW() - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    WITH error_stats AS (
        SELECT 
            COUNT(*) as total_errors,
            jsonb_object_agg(severity, severity_count) as errors_by_severity,
            jsonb_object_agg(category, category_count) as errors_by_category,
            jsonb_object_agg(error_code, code_count) as top_error_codes
        FROM (
            SELECT 
                severity,
                category,
                error_code,
                COUNT(*) as severity_count,
                COUNT(*) as category_count,
                COUNT(*) as code_count
            FROM error_logs
            WHERE created_at >= start_time
            GROUP BY severity, category, error_code
        ) grouped
    )
    SELECT 
        es.total_errors,
        es.errors_by_severity,
        es.errors_by_category,
        es.top_error_codes
    FROM error_stats es;
END;
$$ LANGUAGE plpgsql;

-- Function to create error alert
CREATE OR REPLACE FUNCTION create_error_alert(
    p_alert_type VARCHAR(100),
    p_error_id UUID,
    p_message TEXT,
    p_severity VARCHAR(20),
    p_context JSONB
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO error_alerts (
        alert_type, error_id, message, severity, context
    ) VALUES (
        p_alert_type, p_error_id, p_message, p_severity, p_context
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to acknowledge error alert
CREATE OR REPLACE FUNCTION acknowledge_error_alert(
    p_alert_id UUID,
    p_acknowledged_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE error_alerts 
    SET 
        acknowledged = true,
        acknowledged_by = p_acknowledged_by,
        acknowledged_at = NOW()
    WHERE id = p_alert_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to detect error patterns
CREATE OR REPLACE FUNCTION detect_error_patterns(
    time_range_hours INTEGER DEFAULT 1
)
RETURNS TABLE (
    pattern_type VARCHAR(100),
    pattern_count BIGINT,
    severity VARCHAR(20),
    message TEXT
) AS $$
BEGIN
    -- Check for repeated errors in last hour
    RETURN QUERY
    SELECT 
        'repeated_errors' as pattern_type,
        COUNT(*) as pattern_count,
        el.severity,
        el.message
    FROM error_logs el
    WHERE el.created_at >= NOW() - INTERVAL '1 hour' * time_range_hours
    GROUP BY el.error_code, el.severity, el.message
    HAVING COUNT(*) >= 5
    ORDER BY pattern_count DESC;
    
    -- Check for error spikes
    RETURN QUERY
    SELECT 
        'error_spike' as pattern_type,
        COUNT(*) as pattern_count,
        'high' as severity,
        'Error spike detected' as message
    FROM error_logs el
    WHERE el.created_at >= NOW() - INTERVAL '15 minutes'
    GROUP BY el.error_code
    HAVING COUNT(*) >= 10;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. CREATE VALIDATION FUNCTIONS
-- =============================================

-- Function to log validation attempt
CREATE OR REPLACE FUNCTION log_validation_attempt(
    p_user_id UUID,
    p_validation_type VARCHAR(100),
    p_data JSONB,
    p_errors JSONB,
    p_success BOOLEAN,
    p_processing_time INTEGER
)
RETURNS UUID AS $$
DECLARE
    validation_id UUID;
BEGIN
    INSERT INTO validation_logs (
        user_id,
        validation_type,
        data,
        errors,
        success,
        processing_time
    ) VALUES (
        p_user_id,
        p_validation_type,
        p_data,
        p_errors,
        p_success,
        p_processing_time
    ) RETURNING id INTO validation_id;
    
    RETURN validation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get validation statistics
CREATE OR REPLACE FUNCTION get_validation_statistics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_validations BIGINT,
    successful_validations BIGINT,
    failed_validations BIGINT,
    success_rate NUMERIC,
    avg_processing_time NUMERIC,
    validation_types JSONB
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    start_time := NOW() - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    SELECT 
        COUNT(*) as total_validations,
        COUNT(*) FILTER (WHERE success = true) as successful_validations,
        COUNT(*) FILTER (WHERE success = false) as failed_validations,
        ROUND(
            (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)) * 100, 2
        ) as success_rate,
        ROUND(AVG(processing_time), 2) as avg_processing_time,
        jsonb_object_agg(validation_type, type_count) as validation_types
    FROM (
        SELECT 
            validation_type,
            COUNT(*) as type_count
        FROM validation_logs
        WHERE created_at >= start_time
        GROUP BY validation_type
    ) grouped;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. CREATE MAINTENANCE FUNCTIONS
-- =============================================

-- Function to cleanup old error logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs(
    days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM error_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND resolved = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old validation logs
CREATE OR REPLACE FUNCTION cleanup_old_validation_logs(
    days_to_keep INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM validation_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. CREATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on error logging tables
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;

-- Error logs policies
CREATE POLICY "Users can view own error logs" ON error_logs
    FOR SELECT USING (auth.uid() = resolved_by);

CREATE POLICY "Admins can view all error logs" ON error_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Error alerts policies
CREATE POLICY "Admins can view all error alerts" ON error_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Validation logs policies
CREATE POLICY "Users can view own validation logs" ON validation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all validation logs" ON validation_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- 7. CREATE MONITORING VIEWS
-- =============================================

-- View for error summary
CREATE OR REPLACE VIEW error_summary AS
SELECT 
    error_code,
    severity,
    category,
    COUNT(*) as error_count,
    MAX(created_at) as last_occurrence,
    COUNT(DISTINCT resolved_by) as resolved_by_count
FROM error_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY error_code, severity, category
ORDER BY error_count DESC;

-- View for validation performance
CREATE OR REPLACE VIEW validation_performance AS
SELECT 
    validation_type,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE success = true) as successful_attempts,
    ROUND(
        (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)) * 100, 2
    ) as success_rate,
    ROUND(AVG(processing_time), 2) as avg_processing_time,
    MAX(processing_time) as max_processing_time
FROM validation_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY validation_type
ORDER BY success_rate DESC;

-- View for error alerts summary
CREATE OR REPLACE VIEW error_alerts_summary AS
SELECT 
    alert_type,
    severity,
    COUNT(*) as alert_count,
    COUNT(*) FILTER (WHERE acknowledged = true) as acknowledged_count,
    MAX(created_at) as last_alert
FROM error_alerts
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY alert_type, severity
ORDER BY alert_count DESC;

-- =============================================
-- 8. CREATE DAILY MAINTENANCE PROCEDURE
-- =============================================

-- Procedure for daily error system maintenance
CREATE OR REPLACE FUNCTION daily_error_system_maintenance()
RETURNS TABLE (
    error_cleanup INTEGER,
    validation_cleanup INTEGER,
    pattern_count INTEGER,
    alert_count INTEGER
) AS $$
DECLARE
    error_cleanup INTEGER;
    validation_cleanup INTEGER;
    pattern_count INTEGER;
    alert_count INTEGER;
BEGIN
    -- Cleanup old logs
    SELECT cleanup_old_error_logs(30) INTO error_cleanup;
    SELECT cleanup_old_validation_logs(7) INTO validation_cleanup;
    
    -- Check for error patterns
    SELECT COUNT(*) INTO pattern_count
    FROM detect_error_patterns(1);
    
    -- Count recent alerts
    SELECT COUNT(*) INTO alert_count
    FROM error_alerts
    WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours';
    
    RETURN QUERY SELECT error_cleanup, validation_cleanup, pattern_count, alert_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Validation and error logging system migration completed successfully!';
    RAISE NOTICE 'Added comprehensive error logging, validation tracking, and monitoring.';
    RAISE NOTICE 'Created error analysis functions, validation tracking, and maintenance procedures.';
    RAISE NOTICE 'Implemented security policies and monitoring views for error management.';
END $$;
