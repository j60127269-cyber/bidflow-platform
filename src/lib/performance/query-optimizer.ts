/**
 * Database Query Optimization System
 * Advanced query optimization, connection pooling, and performance monitoring
 */

import { createClient } from '@supabase/supabase-js';
import { CacheManager } from './cache-manager';

export interface QueryOptimizationConfig {
  connectionPooling: boolean;
  maxConnections: number;
  queryTimeout: number;
  enableQueryCache: boolean;
  enableQueryLogging: boolean;
  slowQueryThreshold: number;
}

export interface QueryStats {
  query: string;
  executionTime: number;
  rowsReturned: number;
  cacheHit: boolean;
  timestamp: string;
}

export interface PerformanceMetrics {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  cacheHitRate: number;
  connectionPoolUsage: number;
}

export class QueryOptimizer {
  private static supabase: any = null;
  private static queryStats: QueryStats[] = [];
  private static config: QueryOptimizationConfig = {
    connectionPooling: true,
    maxConnections: 20,
    queryTimeout: 30000, // 30 seconds
    enableQueryCache: true,
    enableQueryLogging: process.env.NODE_ENV === 'development',
    slowQueryThreshold: 1000 // 1 second
  };

  /**
   * Initialize query optimizer
   */
  static async initialize(): Promise<void> {
    try {
      // Initialize Supabase client with connection pooling
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          db: {
            schema: 'public'
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Start performance monitoring
      this.startPerformanceMonitoring();

      console.log('Query optimizer initialized successfully');

    } catch (error) {
      console.error('Query optimizer initialization failed:', error);
    }
  }

  /**
   * Execute optimized query with caching
   */
  static async executeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      cache?: boolean;
      cacheTtl?: number;
      tags?: string[];
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    let cacheHit = false;

    try {
      let result: T;

      // Try cache first if enabled
      if (options.cache && this.config.enableQueryCache) {
        const cached = await CacheManager.get<T>(`query:${queryKey}`);
        if (cached !== null) {
          cacheHit = true;
          result = cached;
        } else {
          result = await queryFn();
          await CacheManager.set(`query:${queryKey}`, result, {
            ttl: options.cacheTtl || 300,
            tags: options.tags || []
          });
        }
      } else {
        result = await queryFn();
      }

      // Log query performance
      const executionTime = Date.now() - startTime;
      this.logQueryPerformance(queryKey, executionTime, cacheHit);

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logQueryPerformance(queryKey, executionTime, cacheHit, error);
      throw error;
    }
  }

  /**
   * Get contracts with optimization
   */
  static async getContracts(filters: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    const queryKey = `contracts:${JSON.stringify(filters)}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        let query = this.supabase
          .from('contracts')
          .select(`
            id,
            reference_number,
            title,
            category,
            procurement_method,
            submission_deadline,
            procuring_entity,
            estimated_value_min,
            estimated_value_max,
            publish_status,
            created_at
          `)
          .eq('publish_status', 'published')
          .order('created_at', { ascending: false });

        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.limit) {
          query = query.limit(filters.limit);
        }

        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Query failed: ${error.message}`);
        }

        return data || [];
      },
      {
        cache: true,
        cacheTtl: 300, // 5 minutes
        tags: ['contracts']
      }
    );
  }

  /**
   * Get user dashboard data with optimization
   */
  static async getUserDashboardData(userId: string): Promise<any> {
    const queryKey = `user_dashboard:${userId}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        // Use the optimized view instead of complex joins
        const { data, error } = await this.supabase
          .from('user_dashboard_data')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw new Error(`Dashboard query failed: ${error.message}`);
        }

        return data;
      },
      {
        cache: true,
        cacheTtl: 600, // 10 minutes
        tags: ['user_dashboard', `user:${userId}`]
      }
    );
  }

  /**
   * Get contract matches for user with optimization
   */
  static async getContractMatches(userId: string, limit: number = 20): Promise<any[]> {
    const queryKey = `contract_matches:${userId}:${limit}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        // Use the optimized function instead of complex application logic
        const { data, error } = await this.supabase.rpc('get_user_contract_matches', {
          user_uuid: userId
        });

        if (error) {
          throw new Error(`Contract matches query failed: ${error.message}`);
        }

        return (data || []).slice(0, limit);
      },
      {
        cache: true,
        cacheTtl: 1800, // 30 minutes
        tags: ['contract_matches', `user:${userId}`]
      }
    );
  }

  /**
   * Get notification statistics with optimization
   */
  static async getNotificationStats(userId: string): Promise<any> {
    const queryKey = `notification_stats:${userId}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        const { data, error } = await this.supabase.rpc('get_notification_stats', {
          user_uuid: userId
        });

        if (error) {
          throw new Error(`Notification stats query failed: ${error.message}`);
        }

        return data;
      },
      {
        cache: true,
        cacheTtl: 300, // 5 minutes
        tags: ['notification_stats', `user:${userId}`]
      }
    );
  }

  /**
   * Get procuring entities with optimization
   */
  static async getProcuringEntities(filters: {
    search?: string;
    type?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    const queryKey = `procuring_entities:${JSON.stringify(filters)}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        let query = this.supabase
          .from('procuring_entities')
          .select('*')
          .order('entity_name', { ascending: true });

        if (filters.search) {
          query = query.ilike('entity_name', `%${filters.search}%`);
        }

        if (filters.type) {
          query = query.eq('entity_type', filters.type);
        }

        if (filters.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Procuring entities query failed: ${error.message}`);
        }

        return data || [];
      },
      {
        cache: true,
        cacheTtl: 1800, // 30 minutes
        tags: ['procuring_entities']
      }
    );
  }

  /**
   * Get contract analytics with optimization
   */
  static async getContractAnalytics(filters: {
    dateRange?: { start: string; end: string };
    category?: string;
  } = {}): Promise<any> {
    const queryKey = `contract_analytics:${JSON.stringify(filters)}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        let query = this.supabase
          .from('contracts')
          .select(`
            category,
            procurement_method,
            estimated_value_min,
            estimated_value_max,
            created_at,
            publish_status
          `)
          .eq('publish_status', 'published');

        if (filters.dateRange) {
          query = query
            .gte('created_at', filters.dateRange.start)
            .lte('created_at', filters.dateRange.end);
        }

        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Analytics query failed: ${error.message}`);
        }

        // Process analytics data
        const analytics = this.processAnalyticsData(data || []);
        return analytics;
      },
      {
        cache: true,
        cacheTtl: 3600, // 1 hour
        tags: ['analytics', 'contracts']
      }
    );
  }

  /**
   * Process analytics data
   */
  private static processAnalyticsData(data: any[]): any {
    const categoryCounts: Record<string, number> = {};
    const methodCounts: Record<string, number> = {};
    let totalValue = 0;
    let contractCount = 0;

    data.forEach(contract => {
      // Category counts
      categoryCounts[contract.category] = (categoryCounts[contract.category] || 0) + 1;
      
      // Method counts
      methodCounts[contract.procurement_method] = (methodCounts[contract.procurement_method] || 0) + 1;
      
      // Value calculations
      if (contract.estimated_value_min && contract.estimated_value_max) {
        const avgValue = (contract.estimated_value_min + contract.estimated_value_max) / 2;
        totalValue += avgValue;
        contractCount++;
      }
    });

    return {
      totalContracts: data.length,
      categoryBreakdown: categoryCounts,
      methodBreakdown: methodCounts,
      averageValue: contractCount > 0 ? totalValue / contractCount : 0,
      totalValue
    };
  }

  /**
   * Log query performance
   */
  private static logQueryPerformance(
    query: string,
    executionTime: number,
    cacheHit: boolean,
    error?: any
  ): void {
    const stats: QueryStats = {
      query,
      executionTime,
      rowsReturned: 0, // Would need to be passed from query
      cacheHit,
      timestamp: new Date().toISOString()
    };

    this.queryStats.push(stats);

    // Keep only last 1000 queries
    if (this.queryStats.length > 1000) {
      this.queryStats = this.queryStats.slice(-1000);
    }

    // Log slow queries
    if (executionTime > this.config.slowQueryThreshold) {
      console.warn(`Slow query detected: ${query} (${executionTime}ms)`);
    }

    // Log errors
    if (error) {
      console.error(`Query error: ${query}`, error);
    }

    // Development logging
    if (this.config.enableQueryLogging) {
      console.log(`Query: ${query} | Time: ${executionTime}ms | Cache: ${cacheHit}`);
    }
  }

  /**
   * Get performance metrics
   */
  static getPerformanceMetrics(): PerformanceMetrics {
    const totalQueries = this.queryStats.length;
    const averageExecutionTime = totalQueries > 0 
      ? this.queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) / totalQueries 
      : 0;
    
    const slowQueries = this.queryStats.filter(stat => 
      stat.executionTime > this.config.slowQueryThreshold
    ).length;
    
    const cacheHits = this.queryStats.filter(stat => stat.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime),
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      connectionPoolUsage: 0 // Would need connection pool monitoring
    };
  }

  /**
   * Get slow queries
   */
  static getSlowQueries(limit: number = 10): QueryStats[] {
    return this.queryStats
      .filter(stat => stat.executionTime > this.config.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Start performance monitoring
   */
  private static startPerformanceMonitoring(): void {
    setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      
      if (metrics.slowQueries > 0) {
        console.warn(`Performance alert: ${metrics.slowQueries} slow queries detected`);
      }

      if (metrics.cacheHitRate < 50) {
        console.warn(`Performance alert: Low cache hit rate (${metrics.cacheHitRate}%)`);
      }

    }, 60000); // Check every minute
  }

  /**
   * Clear query cache
   */
  static async clearQueryCache(): Promise<void> {
    await CacheManager.invalidateByTags(['query']);
  }

  /**
   * Clear user-specific cache
   */
  static async clearUserCache(userId: string): Promise<void> {
    await CacheManager.invalidateByTags([`user:${userId}`]);
  }

  /**
   * Clear all cache
   */
  static async clearAllCache(): Promise<void> {
    await CacheManager.clear();
  }
}

/**
 * Query optimization decorator
 */
export function optimizedQuery(options: {
  cache?: boolean;
  cacheTtl?: number;
  tags?: string[];
} = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const queryKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      return QueryOptimizer.executeQuery(
        queryKey,
        () => method.apply(this, args),
        options
      );
    };
  };
}
