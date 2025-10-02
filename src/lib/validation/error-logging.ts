/**
 * Error Logging and Monitoring System
 * Comprehensive error logging, monitoring, and alerting
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface ErrorLog {
  id?: string;
  errorCode: string;
  message: string;
  stackTrace?: string;
  context: {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    timestamp: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'authentication' | 'database' | 'external_service' | 'business_logic' | 'system';
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: ErrorLog[];
  errorTrend: Array<{ date: string; count: number }>;
}

export class ErrorLogger {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Log error to database
   */
  static async logError(
    error: ErrorLog,
    request?: NextRequest
  ): Promise<string> {
    try {
      // Enhance context with request information
      if (request) {
        error.context = {
          ...error.context,
          method: request.method,
          endpoint: request.url,
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined
        };
      }

      // Insert error log
      const { data, error: insertError } = await this.supabase
        .from('error_logs')
        .insert({
          error_code: error.errorCode,
          message: error.message,
          stack_trace: error.stackTrace,
          context: error.context,
          severity: error.severity,
          category: error.category,
          metadata: error.metadata,
          resolved: false
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Failed to log error:', insertError);
        return '';
      }

      // Check for error patterns and trigger alerts
      await this.checkErrorPatterns(error);

      return data.id;

    } catch (logError) {
      console.error('Error logging failed:', logError);
      return '';
    }
  }

  /**
   * Get error metrics
   */
  static async getErrorMetrics(
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<ErrorMetrics> {
    try {
      const timeRanges = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720
      };

      const hours = timeRanges[timeRange];
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get total errors
      const { count: totalErrors } = await this.supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startTime.toISOString());

      // Get errors by category
      const { data: categoryData } = await this.supabase
        .from('error_logs')
        .select('category')
        .gte('created_at', startTime.toISOString());

      const errorsByCategory = categoryData?.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get errors by severity
      const { data: severityData } = await this.supabase
        .from('error_logs')
        .select('severity')
        .gte('created_at', startTime.toISOString());

      const errorsBySeverity = severityData?.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get errors by endpoint
      const { data: endpointData } = await this.supabase
        .from('error_logs')
        .select('context')
        .gte('created_at', startTime.toISOString());

      const errorsByEndpoint = endpointData?.reduce((acc, log) => {
        const endpoint = log.context?.endpoint || 'unknown';
        acc[endpoint] = (acc[endpoint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get recent errors
      const { data: recentErrors } = await this.supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Get error trend
      const { data: trendData } = await this.supabase
        .from('error_logs')
        .select('created_at')
        .gte('created_at', startTime.toISOString());

      const errorTrend = this.calculateErrorTrend(trendData || [], hours);

      return {
        totalErrors: totalErrors || 0,
        errorsByCategory,
        errorsBySeverity,
        errorsByEndpoint,
        recentErrors: recentErrors || [],
        errorTrend
      };

    } catch (error) {
      console.error('Failed to get error metrics:', error);
      return {
        totalErrors: 0,
        errorsByCategory: {},
        errorsBySeverity: {},
        errorsByEndpoint: {},
        recentErrors: [],
        errorTrend: []
      };
    }
  }

  /**
   * Get unresolved errors
   */
  static async getUnresolvedErrors(): Promise<ErrorLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('error_logs')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to get unresolved errors:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error getting unresolved errors:', error);
      return [];
    }
  }

  /**
   * Mark error as resolved
   */
  static async resolveError(
    errorId: string,
    resolvedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', errorId);

      if (error) {
        console.error('Failed to resolve error:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error resolving error:', error);
      return false;
    }
  }

  /**
   * Check for error patterns and trigger alerts
   */
  private static async checkErrorPatterns(error: ErrorLog): Promise<void> {
    try {
      // Check for critical errors
      if (error.severity === 'critical') {
        await this.triggerAlert('critical_error', error);
      }

      // Check for repeated errors
      const { count } = await this.supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('error_code', error.errorCode)
        .eq('resolved', false)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      if (count && count >= 5) {
        await this.triggerAlert('repeated_errors', error);
      }

      // Check for error spikes
      const { count: recentCount } = await this.supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Last 10 minutes

      if (recentCount && recentCount >= 20) {
        await this.triggerAlert('error_spike', error);
      }

    } catch (error) {
      console.error('Error checking patterns:', error);
    }
  }

  /**
   * Trigger alert for error patterns
   */
  private static async triggerAlert(
    alertType: string,
    error: ErrorLog
  ): Promise<void> {
    try {
      // Log alert
      await this.supabase
        .from('error_alerts')
        .insert({
          alert_type: alertType,
          error_id: error.id,
          message: `Alert triggered: ${alertType}`,
          severity: error.severity,
          context: error.context,
          created_at: new Date().toISOString()
        });

      // TODO: Send notification to monitoring team
      console.log(`Alert triggered: ${alertType}`, error);

    } catch (alertError) {
      console.error('Failed to trigger alert:', alertError);
    }
  }

  /**
   * Calculate error trend
   */
  private static calculateErrorTrend(
    errors: Array<{ created_at: string }>,
    hours: number
  ): Array<{ date: string; count: number }> {
    const trend: Array<{ date: string; count: number }> = [];
    const interval = Math.max(1, Math.floor(hours / 24)); // Hours per interval

    for (let i = 0; i < hours; i += interval) {
      const startTime = new Date(Date.now() - (i + interval) * 60 * 60 * 1000);
      const endTime = new Date(Date.now() - i * 60 * 60 * 1000);

      const count = errors.filter(error => {
        const errorTime = new Date(error.created_at);
        return errorTime >= startTime && errorTime < endTime;
      }).length;

      trend.push({
        date: startTime.toISOString(),
        count
      });
    }

    return trend.reverse();
  }

  /**
   * Clean up old error logs
   */
  static async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const { count } = await this.supabase
        .from('error_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('*', { count: 'exact', head: true });

      return count || 0;

    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }
}

/**
 * Error monitoring dashboard data
 */
export class ErrorMonitoring {
  /**
   * Get dashboard data
   */
  static async getDashboardData(): Promise<{
    metrics: ErrorMetrics;
    unresolvedErrors: ErrorLog[];
    alerts: any[];
  }> {
    try {
      const [metrics, unresolvedErrors, alerts] = await Promise.all([
        ErrorLogger.getErrorMetrics('24h'),
        ErrorLogger.getUnresolvedErrors(),
        this.getRecentAlerts()
      ]);

      return {
        metrics,
        unresolvedErrors,
        alerts
      };

    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return {
        metrics: {
          totalErrors: 0,
          errorsByCategory: {},
          errorsBySeverity: {},
          errorsByEndpoint: {},
          recentErrors: [],
          errorTrend: []
        },
        unresolvedErrors: [],
        alerts: []
      };
    }
  }

  /**
   * Get recent alerts
   */
  private static async getRecentAlerts(): Promise<any[]> {
    try {
      const { data, error } = await ErrorLogger['supabase']
        .from('error_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to get alerts:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }
}
