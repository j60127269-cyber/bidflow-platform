/**
 * Performance Dashboard API
 * Comprehensive performance monitoring and analytics endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CacheManager } from '@/lib/performance/cache-manager';
import { QueryOptimizer } from '@/lib/performance/query-optimizer';
import { PerformanceMonitor } from '@/lib/performance/performance-monitor';
import { CDNOptimizer } from '@/lib/performance/cdn-optimizer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Get performance statistics
    const performanceStats = await getPerformanceStatistics(timeRange);
    
    // Get system health
    const systemHealth = PerformanceMonitor.getSystemHealth();
    
    // Get cache statistics
    const cacheStats = CacheManager.getStats();
    
    // Get query performance
    const queryPerformance = await getQueryPerformance(timeRange);
    
    // Get CDN statistics
    const cdnStats = CDNOptimizer.getCDNStats();
    
    // Get active alerts
    const activeAlerts = PerformanceMonitor.getActiveAlerts();

    const dashboard = {
      timestamp: new Date().toISOString(),
      timeRange,
      performance: performanceStats,
      systemHealth,
      cache: cacheStats,
      queries: queryPerformance,
      cdn: cdnStats,
      alerts: activeAlerts
    };

    // Include detailed metrics if requested
    if (includeDetails) {
      const detailedMetrics = await getDetailedMetrics(timeRange);
      dashboard.details = detailedMetrics;
    }

    return NextResponse.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    console.error('Performance dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to get performance dashboard' },
      { status: 500 }
    );
  }
}

/**
 * Get performance statistics
 */
async function getPerformanceStatistics(timeRange: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('get_performance_statistics', {
      time_range_hours: getTimeRangeHours(timeRange)
    });

    if (error) {
      throw new Error(`Performance statistics query failed: ${error.message}`);
    }

    return data[0] || {
      total_requests: 0,
      average_response_time: 0,
      error_rate: 0,
      cache_hit_rate: 0,
      slow_requests: 0,
      top_endpoints: {}
    };

  } catch (error) {
    console.error('Error getting performance statistics:', error);
    return {
      total_requests: 0,
      average_response_time: 0,
      error_rate: 0,
      cache_hit_rate: 0,
      slow_requests: 0,
      top_endpoints: {}
    };
  }
}

/**
 * Get query performance data
 */
async function getQueryPerformance(timeRange: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('get_slow_queries', {
      time_range_hours: getTimeRangeHours(timeRange),
      min_execution_time: 1000
    });

    if (error) {
      throw new Error(`Query performance query failed: ${error.message}`);
    }

    return {
      slowQueries: data || [],
      totalSlowQueries: data?.length || 0
    };

  } catch (error) {
    console.error('Error getting query performance:', error);
    return {
      slowQueries: [],
      totalSlowQueries: 0
    };
  }
}

/**
 * Get detailed metrics
 */
async function getDetailedMetrics(timeRange: string): Promise<any> {
  try {
    const [performanceData, cacheData, systemHealth] = await Promise.all([
      supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - getTimeRangeHours(timeRange) * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100),
      
      supabase.rpc('get_cache_statistics', {
        time_range_hours: getTimeRangeHours(timeRange)
      }),
      
      supabase.rpc('get_system_health')
    ]);

    return {
      performanceMetrics: performanceData.data || [],
      cacheStatistics: cacheData.data || [],
      systemHealth: systemHealth.data || []
    };

  } catch (error) {
    console.error('Error getting detailed metrics:', error);
    return {
      performanceMetrics: [],
      cacheStatistics: [],
      systemHealth: []
    };
  }
}

/**
 * Convert time range string to hours
 */
function getTimeRangeHours(timeRange: string): number {
  const timeRanges = {
    '1h': 1,
    '24h': 24,
    '7d': 168,
    '30d': 720
  };
  
  return timeRanges[timeRange as keyof typeof timeRanges] || 24;
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'clear_cache':
        await CacheManager.clear();
        return NextResponse.json({ success: true, message: 'Cache cleared successfully' });

      case 'clear_user_cache':
        if (!data.userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        await QueryOptimizer.clearUserCache(data.userId);
        return NextResponse.json({ success: true, message: 'User cache cleared successfully' });

      case 'purge_cdn':
        if (!data.urls || !Array.isArray(data.urls)) {
          return NextResponse.json({ error: 'URLs array is required' }, { status: 400 });
        }
        const success = await CDNOptimizer.purgeCache(data.urls);
        return NextResponse.json({ 
          success, 
          message: success ? 'CDN cache purged successfully' : 'CDN cache purge failed' 
        });

      case 'resolve_alert':
        if (!data.alertId) {
          return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
        }
        const resolved = await PerformanceMonitor.resolveAlert(data.alertId);
        return NextResponse.json({ 
          success: resolved, 
          message: resolved ? 'Alert resolved successfully' : 'Failed to resolve alert' 
        });

      case 'optimize_database':
        const optimizationResult = await optimizeDatabase();
        return NextResponse.json({ 
          success: true, 
          message: 'Database optimization completed',
          data: optimizationResult
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Performance dashboard POST error:', error);
    return NextResponse.json(
      { error: 'Failed to execute performance action' },
      { status: 500 }
    );
  }
}

/**
 * Optimize database
 */
async function optimizeDatabase(): Promise<any> {
  try {
    const [queryOptimization, tableStats] = await Promise.all([
      supabase.rpc('optimize_database_queries'),
      supabase.rpc('get_table_statistics')
    ]);

    return {
      queryOptimization: queryOptimization.data || [],
      tableStatistics: tableStats.data || []
    };

  } catch (error) {
    console.error('Database optimization error:', error);
    return {
      queryOptimization: [],
      tableStatistics: []
    };
  }
}
