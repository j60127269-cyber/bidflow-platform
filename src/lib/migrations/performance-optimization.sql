-- Performance Optimization Migration
-- Adds comprehensive performance monitoring, caching, and optimization features

-- =============================================
-- 1. CREATE PERFORMANCE MONITORING TABLES
-- =============================================

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    memory_usage DECIMAL(5,2),
    cpu_usage DECIMAL(5,2),
    database_queries INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT
);

-- Performance alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    actual_value DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Cache statistics table
CREATE TABLE IF NOT EXISTS cache_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) NOT NULL,
    cache_namespace VARCHAR(100),
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Query performance table
CREATE TABLE IF NOT EXISTS query_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash VARCHAR(64) NOT NULL,
    query_text TEXT NOT NULL,
    execution_time INTEGER NOT NULL,
    rows_returned INTEGER DEFAULT 0,
    cache_hit BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- =============================================
-- 2. CREATE PERFORMANCE INDEXES
-- =============================================

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time ON performance_metrics(response_time);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_status_code ON performance_metrics(status_code);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);

-- Performance alerts indexes
CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp);

-- Cache statistics indexes
CREATE INDEX IF NOT EXISTS idx_cache_statistics_key ON cache_statistics(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_statistics_namespace ON cache_statistics(cache_namespace);
CREATE INDEX IF NOT EXISTS idx_cache_statistics_expires ON cache_statistics(expires_at);

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_query_performance_hash ON query_performance(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_performance_execution_time ON query_performance(execution_time);
CREATE INDEX IF NOT EXISTS idx_query_performance_timestamp ON query_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_query_performance_user_id ON query_performance(user_id);

-- =============================================
-- 3. CREATE PERFORMANCE FUNCTIONS
-- =============================================

-- Function to get performance statistics
CREATE OR REPLACE FUNCTION get_performance_statistics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_requests BIGINT,
    average_response_time NUMERIC,
    error_rate NUMERIC,
    cache_hit_rate NUMERIC,
    slow_requests BIGINT,
    top_endpoints JSONB
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    start_time := NOW() - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    SELECT 
        COUNT(*) as total_requests,
        ROUND(AVG(response_time), 2) as average_response_time,
        ROUND(
            (COUNT(*) FILTER (WHERE error_count > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as error_rate,
        ROUND(
            (SUM(cache_hits)::NUMERIC / NULLIF(SUM(cache_hits + cache_misses), 0)::NUMERIC) * 100, 
            2
        ) as cache_hit_rate,
        COUNT(*) FILTER (WHERE response_time > 2000) as slow_requests,
        jsonb_object_agg(endpoint, endpoint_count) as top_endpoints
    FROM (
        SELECT 
            endpoint,
            COUNT(*) as endpoint_count
        FROM performance_metrics
        WHERE timestamp >= start_time
        GROUP BY endpoint
        ORDER BY endpoint_count DESC
        LIMIT 10
    ) endpoint_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(
    time_range_hours INTEGER DEFAULT 24,
    min_execution_time INTEGER DEFAULT 1000
)
RETURNS TABLE (
    query_hash VARCHAR(64),
    query_text TEXT,
    execution_time INTEGER,
    occurrences BIGINT,
    average_time NUMERIC
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    start_time := NOW() - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    SELECT 
        qp.query_hash,
        qp.query_text,
        qp.execution_time,
        COUNT(*) as occurrences,
        ROUND(AVG(qp.execution_time), 2) as average_time
    FROM query_performance qp
    WHERE qp.timestamp >= start_time
    AND qp.execution_time >= min_execution_time
    GROUP BY qp.query_hash, qp.query_text, qp.execution_time
    ORDER BY qp.execution_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_statistics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_requests BIGINT,
    cache_hits BIGINT,
    cache_misses BIGINT,
    hit_rate NUMERIC,
    top_keys JSONB
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    start_time := NOW() - INTERVAL '1 hour' * time_range_hours;
    
    RETURN QUERY
    SELECT 
        SUM(cs.hit_count + cs.miss_count) as total_requests,
        SUM(cs.hit_count) as cache_hits,
        SUM(cs.miss_count) as cache_misses,
        ROUND(
            (SUM(cs.hit_count)::NUMERIC / NULLIF(SUM(cs.hit_count + cs.miss_count), 0)::NUMERIC) * 100, 
            2
        ) as hit_rate,
        jsonb_object_agg(cs.cache_key, cs.hit_count) as top_keys
    FROM cache_statistics cs
    WHERE cs.created_at >= start_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get system health
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS TABLE (
    metric VARCHAR(50),
    value NUMERIC,
    status VARCHAR(20),
    threshold NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'response_time'::VARCHAR(50) as metric,
        ROUND(AVG(pm.response_time), 2) as value,
        CASE 
            WHEN AVG(pm.response_time) > 2000 THEN 'critical'::VARCHAR(20)
            WHEN AVG(pm.response_time) > 1000 THEN 'warning'::VARCHAR(20)
            ELSE 'healthy'::VARCHAR(20)
        END as status,
        1000::NUMERIC as threshold
    FROM performance_metrics pm
    WHERE pm.timestamp >= NOW() - INTERVAL '1 hour'
    
    UNION ALL
    
    SELECT 
        'error_rate'::VARCHAR(50) as metric,
        ROUND(
            (COUNT(*) FILTER (WHERE pm.error_count > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as value,
        CASE 
            WHEN (COUNT(*) FILTER (WHERE pm.error_count > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100 > 5 THEN 'critical'::VARCHAR(20)
            WHEN (COUNT(*) FILTER (WHERE pm.error_count > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100 > 2 THEN 'warning'::VARCHAR(20)
            ELSE 'healthy'::VARCHAR(20)
        END as status,
        2::NUMERIC as threshold
    FROM performance_metrics pm
    WHERE pm.timestamp >= NOW() - INTERVAL '1 hour'
    
    UNION ALL
    
    SELECT 
        'cache_hit_rate'::VARCHAR(50) as metric,
        ROUND(
            (SUM(pm.cache_hits)::NUMERIC / NULLIF(SUM(pm.cache_hits + pm.cache_misses), 0)::NUMERIC) * 100, 
            2
        ) as value,
        CASE 
            WHEN (SUM(pm.cache_hits)::NUMERIC / NULLIF(SUM(pm.cache_hits + pm.cache_misses), 0)::NUMERIC) * 100 < 50 THEN 'critical'::VARCHAR(20)
            WHEN (SUM(pm.cache_hits)::NUMERIC / NULLIF(SUM(pm.cache_hits + pm.cache_misses), 0)::NUMERIC) * 100 < 70 THEN 'warning'::VARCHAR(20)
            ELSE 'healthy'::VARCHAR(20)
        END as status,
        70::NUMERIC as threshold
    FROM performance_metrics pm
    WHERE pm.timestamp >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. CREATE PERFORMANCE VIEWS
-- =============================================

-- View for performance dashboard
CREATE OR REPLACE VIEW performance_dashboard AS
SELECT 
    DATE(timestamp) as date,
    endpoint,
    COUNT(*) as request_count,
    ROUND(AVG(response_time), 2) as avg_response_time,
    COUNT(*) FILTER (WHERE response_time > 2000) as slow_requests,
    COUNT(*) FILTER (WHERE error_count > 0) as error_requests,
    ROUND(
        (COUNT(*) FILTER (WHERE error_count > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
    ) as error_rate
FROM performance_metrics
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(timestamp), endpoint
ORDER BY date DESC, request_count DESC;

-- View for cache performance
CREATE OR REPLACE VIEW cache_performance AS
SELECT 
    cache_namespace,
    COUNT(*) as total_keys,
    SUM(hit_count) as total_hits,
    SUM(miss_count) as total_misses,
    ROUND(
        (SUM(hit_count)::NUMERIC / NULLIF(SUM(hit_count + miss_count), 0)::NUMERIC) * 100, 
        2
    ) as hit_rate,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_keys
FROM cache_statistics
GROUP BY cache_namespace
ORDER BY hit_rate DESC;

-- View for query performance
CREATE OR REPLACE VIEW query_performance_summary AS
SELECT 
    query_hash,
    LEFT(query_text, 100) as query_preview,
    COUNT(*) as execution_count,
    ROUND(AVG(execution_time), 2) as avg_execution_time,
    MAX(execution_time) as max_execution_time,
    COUNT(*) FILTER (WHERE cache_hit = true) as cache_hits,
    ROUND(
        (COUNT(*) FILTER (WHERE cache_hit = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
    ) as cache_hit_rate
FROM query_performance
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY query_hash, query_text
ORDER BY avg_execution_time DESC;

-- =============================================
-- 5. CREATE PERFORMANCE TRIGGERS
-- =============================================

-- Trigger to update cache statistics
CREATE OR REPLACE FUNCTION update_cache_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cache_statistics (cache_key, cache_namespace, hit_count, miss_count, last_accessed, expires_at)
    VALUES (NEW.cache_key, NEW.cache_namespace, NEW.hit_count, NEW.miss_count, NEW.last_accessed, NEW.expires_at)
    ON CONFLICT (cache_key) DO UPDATE SET
        hit_count = cache_statistics.hit_count + NEW.hit_count,
        miss_count = cache_statistics.miss_count + NEW.miss_count,
        last_accessed = NEW.last_accessed;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. CREATE CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old performance data
CREATE OR REPLACE FUNCTION cleanup_performance_data(
    days_to_keep INTEGER DEFAULT 30
)
RETURNS TABLE (
    cleaned_metrics INTEGER,
    cleaned_alerts INTEGER,
    cleaned_queries INTEGER,
    cleaned_cache INTEGER
) AS $$
DECLARE
    metrics_count INTEGER;
    alerts_count INTEGER;
    queries_count INTEGER;
    cache_count INTEGER;
BEGIN
    -- Cleanup old performance metrics
    DELETE FROM performance_metrics 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    GET DIAGNOSTICS metrics_count = ROW_COUNT;
    
    -- Cleanup old performance alerts
    DELETE FROM performance_alerts 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep
    AND resolved = true;
    GET DIAGNOSTICS alerts_count = ROW_COUNT;
    
    -- Cleanup old query performance data
    DELETE FROM query_performance 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    GET DIAGNOSTICS queries_count = ROW_COUNT;
    
    -- Cleanup expired cache statistics
    DELETE FROM cache_statistics 
    WHERE expires_at < NOW();
    GET DIAGNOSTICS cache_count = ROW_COUNT;
    
    RETURN QUERY SELECT metrics_count, alerts_count, queries_count, cache_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. CREATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on performance tables
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_performance ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies (admin only)
CREATE POLICY "Admins can view performance metrics" ON performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Performance alerts policies (admin only)
CREATE POLICY "Admins can view performance alerts" ON performance_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Cache statistics policies (admin only)
CREATE POLICY "Admins can view cache statistics" ON cache_statistics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Query performance policies (admin only)
CREATE POLICY "Admins can view query performance" ON query_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- 8. CREATE MAINTENANCE PROCEDURES
-- =============================================

-- Procedure for daily performance maintenance
CREATE OR REPLACE FUNCTION daily_performance_maintenance()
RETURNS TABLE (
    cleaned_metrics INTEGER,
    cleaned_alerts INTEGER,
    cleaned_queries INTEGER,
    cleaned_cache INTEGER,
    performance_summary JSONB
) AS $$
DECLARE
    cleanup_result RECORD;
    performance_data JSONB;
BEGIN
    -- Run cleanup
    SELECT * INTO cleanup_result FROM cleanup_performance_data(30);
    
    -- Get performance summary
    SELECT jsonb_build_object(
        'total_requests', total_requests,
        'average_response_time', average_response_time,
        'error_rate', error_rate,
        'cache_hit_rate', cache_hit_rate
    ) INTO performance_data
    FROM get_performance_statistics(24);
    
    RETURN QUERY SELECT 
        cleanup_result.cleaned_metrics,
        cleanup_result.cleaned_alerts,
        cleanup_result.cleaned_queries,
        cleanup_result.cleaned_cache,
        performance_data;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. CREATE PERFORMANCE OPTIMIZATION FUNCTIONS
-- =============================================

-- Function to optimize database queries
CREATE OR REPLACE FUNCTION optimize_database_queries()
RETURNS TABLE (
    table_name VARCHAR(100),
    index_name VARCHAR(100),
    index_size BIGINT,
    usage_count BIGINT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        indexname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid))::BIGINT as index_size,
        idx_scan as usage_count,
        CASE 
            WHEN idx_scan = 0 THEN 'Consider dropping unused index'
            WHEN idx_scan < 100 THEN 'Low usage index - monitor'
            ELSE 'Index is well utilized'
        END as recommendation
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE (
    table_name VARCHAR(100),
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    last_analyzed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        last_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Performance optimization migration completed successfully!';
    RAISE NOTICE 'Added comprehensive performance monitoring and optimization features.';
    RAISE NOTICE 'Created performance metrics, alerts, and cache statistics tracking.';
    RAISE NOTICE 'Implemented performance views and maintenance procedures.';
    RAISE NOTICE 'Added database optimization functions and monitoring.';
END $$;
