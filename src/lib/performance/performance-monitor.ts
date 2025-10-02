/**
 * Performance Monitoring System
 * Comprehensive performance tracking, metrics, and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface PerformanceMetrics {
  timestamp: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseQueries: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseConnections: number;
  cacheStatus: 'connected' | 'disconnected' | 'error';
  lastError?: string;
  recommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_response' | 'high_memory' | 'database_slow' | 'cache_miss' | 'error_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
  resolved: boolean;
}

export class PerformanceMonitor {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private static metrics: PerformanceMetrics[] = [];
  private static alerts: PerformanceAlert[] = [];
  private static startTime = Date.now();

  private static thresholds = {
    responseTime: 2000, // 2 seconds
    memoryUsage: 80, // 80%
    cpuUsage: 80, // 80%
    errorRate: 5, // 5%
    cacheMissRate: 50 // 50%
  };

  /**
   * Monitor API request performance
   */
  static async monitorRequest(
    request: NextRequest,
    handler: Function
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const endpoint = new URL(request.url).pathname;
    const method = request.method;

    try {
      // Execute the handler
      const response = await handler(request);

      // Calculate metrics
      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      const memoryUsage = this.getMemoryUsage();
      const cpuUsage = await this.getCpuUsage();

      // Record metrics
      const metrics: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        responseTime,
        statusCode,
        memoryUsage,
        cpuUsage,
        databaseQueries: 0, // Would need to track this
        cacheHits: 0, // Would need to track this
        cacheMisses: 0, // Would need to track this
        errorCount: statusCode >= 400 ? 1 : 0
      };

      await this.recordMetrics(metrics);

      // Check for performance issues
      await this.checkPerformanceIssues(metrics);

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error metrics
      const metrics: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        responseTime,
        statusCode: 500,
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: await this.getCpuUsage(),
        databaseQueries: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 1
      };

      await this.recordMetrics(metrics);
      await this.createAlert('error_spike', 'critical', 'API error occurred', 0, 1);

      throw error;
    }
  }

  /**
   * Record performance metrics
   */
  private static async recordMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Store in memory for quick access
      this.metrics.push(metrics);

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Store in database for persistence
      await this.supabase
        .from('performance_metrics')
        .insert({
          timestamp: metrics.timestamp,
          endpoint: metrics.endpoint,
          method: metrics.method,
          response_time: metrics.responseTime,
          status_code: metrics.statusCode,
          memory_usage: metrics.memoryUsage,
          cpu_usage: metrics.cpuUsage,
          database_queries: metrics.databaseQueries,
          cache_hits: metrics.cacheHits,
          cache_misses: metrics.cacheMisses,
          error_count: metrics.errorCount
        });

    } catch (error) {
      console.error('Failed to record performance metrics:', error);
    }
  }

  /**
   * Check for performance issues
   */
  private static async checkPerformanceIssues(metrics: PerformanceMetrics): Promise<void> {
    // Check response time
    if (metrics.responseTime > this.thresholds.responseTime) {
      await this.createAlert(
        'slow_response',
        'medium',
        `Slow response time: ${metrics.responseTime}ms`,
        this.thresholds.responseTime,
        metrics.responseTime
      );
    }

    // Check memory usage
    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      await this.createAlert(
        'high_memory',
        'high',
        `High memory usage: ${metrics.memoryUsage}%`,
        this.thresholds.memoryUsage,
        metrics.memoryUsage
      );
    }

    // Check CPU usage
    if (metrics.cpuUsage > this.thresholds.cpuUsage) {
      await this.createAlert(
        'high_cpu',
        'high',
        `High CPU usage: ${metrics.cpuUsage}%`,
        this.thresholds.cpuUsage,
        metrics.cpuUsage
      );
    }

    // Check error rate
    const recentMetrics = this.metrics.slice(-100); // Last 100 requests
    const errorRate = (recentMetrics.filter(m => m.errorCount > 0).length / recentMetrics.length) * 100;
    
    if (errorRate > this.thresholds.errorRate) {
      await this.createAlert(
        'error_spike',
        'critical',
        `High error rate: ${errorRate.toFixed(2)}%`,
        this.thresholds.errorRate,
        errorRate
      );
    }
  }

  /**
   * Create performance alert
   */
  private static async createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    threshold: number,
    actualValue: number
  ): Promise<void> {
    try {
      const alert: PerformanceAlert = {
        id: `${type}_${Date.now()}`,
        type,
        severity,
        message,
        threshold,
        actualValue,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      this.alerts.push(alert);

      // Store in database
      await this.supabase
        .from('performance_alerts')
        .insert({
          alert_id: alert.id,
          alert_type: alert.type,
          severity: alert.severity,
          message: alert.message,
          threshold: alert.threshold,
          actual_value: alert.actualValue,
          timestamp: alert.timestamp,
          resolved: alert.resolved
        });

      // Log alert
      console.warn(`Performance Alert [${severity.toUpperCase()}]: ${message}`);

    } catch (error) {
      console.error('Failed to create performance alert:', error);
    }
  }

  /**
   * Get system health status
   */
  static getSystemHealth(): SystemHealth {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = this.getCpuUsage();
    
    // Calculate health status
    let status: SystemHealth['status'] = 'healthy';
    const recommendations: string[] = [];

    if (memoryUsage > 90 || cpuUsage > 90) {
      status = 'critical';
      recommendations.push('High resource usage detected. Consider scaling up.');
    } else if (memoryUsage > 70 || cpuUsage > 70) {
      status = 'degraded';
      recommendations.push('Moderate resource usage. Monitor closely.');
    }

    // Check for recent errors
    const recentErrors = this.metrics.filter(m => 
      m.timestamp > new Date(Date.now() - 5 * 60 * 1000).toISOString() && 
      m.errorCount > 0
    );

    if (recentErrors.length > 10) {
      status = 'critical';
      recommendations.push('High error rate detected. Check logs immediately.');
    } else if (recentErrors.length > 5) {
      status = 'degraded';
      recommendations.push('Moderate error rate. Monitor for issues.');
    }

    return {
      status,
      uptime,
      memoryUsage,
      cpuUsage,
      databaseConnections: 0, // Would need to track this
      cacheStatus: 'connected', // Would need to check cache status
      lastError: recentErrors.length > 0 ? 'Recent errors detected' : undefined,
      recommendations
    };
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(timeRange: '1h' | '24h' | '7d' = '1h'): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    slowQueries: number;
  } {
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange];

    const cutoffTime = new Date(Date.now() - timeRangeMs);
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) > cutoffTime
    );

    const totalRequests = recentMetrics.length;
    const averageResponseTime = totalRequests > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests 
      : 0;
    
    const errorCount = recentMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    
    const cacheHits = recentMetrics.reduce((sum, m) => sum + m.cacheHits, 0);
    const cacheMisses = recentMetrics.reduce((sum, m) => sum + m.cacheMisses, 0);
    const cacheHitRate = (cacheHits + cacheMisses) > 0 
      ? (cacheHits / (cacheHits + cacheMisses)) * 100 
      : 0;
    
    const slowQueries = recentMetrics.filter(m => m.responseTime > this.thresholds.responseTime).length;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      slowQueries
    };
  }

  /**
   * Get memory usage percentage
   */
  private static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const totalMemory = 1024 * 1024 * 1024; // 1GB assumption
      return Math.round((usage.heapUsed / totalMemory) * 100);
    }
    return 0;
  }

  /**
   * Get CPU usage percentage
   */
  private static async getCpuUsage(): Promise<number> {
    // This would need a proper CPU monitoring library
    // For now, return a placeholder
    return Math.random() * 100;
  }

  /**
   * Get active alerts
   */
  static getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve alert
   */
  static async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        
        await this.supabase
          .from('performance_alerts')
          .update({ resolved: true })
          .eq('alert_id', alertId);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      return false;
    }
  }

  /**
   * Clear old metrics
   */
  static async clearOldMetrics(daysToKeep: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const { count } = await this.supabase
        .from('performance_metrics')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch (error) {
      console.error('Failed to clear old metrics:', error);
      return 0;
    }
  }
}

/**
 * Performance monitoring middleware
 */
export function withPerformanceMonitoring(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    return PerformanceMonitor.monitorRequest(request, handler);
  };
}

/**
 * Performance monitoring decorator
 */
export function monitorPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    
    try {
      const result = await method.apply(this, args);
      const responseTime = Date.now() - startTime;
      
      // Log performance
      console.log(`Method ${propertyName} executed in ${responseTime}ms`);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Method ${propertyName} failed after ${responseTime}ms:`, error);
      throw error;
    }
  };
}
