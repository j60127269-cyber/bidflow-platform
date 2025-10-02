# 🚀 Performance Optimization System Documentation

## Overview

This document outlines the comprehensive performance optimization system implemented for BidCloud, including caching, query optimization, performance monitoring, and CDN integration.

## 🛠️ System Components

### 1. **Cache Management System** (`src/lib/performance/cache-manager.ts`)
- **Multi-layer caching** with Redis, in-memory, and database optimization
- **Automatic cache invalidation** with tags and TTL
- **Cache statistics** and performance monitoring
- **Memory management** with size limits and cleanup

### 2. **Query Optimization** (`src/lib/performance/query-optimizer.ts`)
- **Database query optimization** with connection pooling
- **Query caching** with automatic invalidation
- **Performance monitoring** with slow query detection
- **Optimized database functions** for common operations

### 3. **Performance Monitoring** (`src/lib/performance/performance-monitor.ts`)
- **Real-time performance tracking** for all requests
- **System health monitoring** with alerts
- **Performance metrics** collection and analysis
- **Automatic alerting** for performance issues

### 4. **CDN Optimization** (`src/lib/performance/cdn-optimizer.ts`)
- **Static asset optimization** with automatic compression
- **Image optimization** with format conversion
- **CDN cache management** with purge capabilities
- **Responsive image generation** with srcset

## 📊 Performance Features

### **Caching System**

#### Redis Caching
```typescript
import { CacheManager } from '@/lib/performance/cache-manager';

// Cache data with TTL and tags
await CacheManager.set('user:123', userData, {
  ttl: 3600, // 1 hour
  tags: ['user', 'profile'],
  namespace: 'api'
});

// Get cached data
const cachedData = await CacheManager.get('user:123');
```

#### Memory Caching
```typescript
// Automatic memory caching for frequently accessed data
const result = await CacheManager.cache(
  () => 'frequent-data-key',
  async () => await fetchExpensiveData(),
  { ttl: 300, tags: ['frequent'] }
);
```

#### Cache Invalidation
```typescript
// Invalidate by tags
await CacheManager.invalidateByTags(['user', 'profile']);

// Invalidate specific key
await CacheManager.delete('user:123');
```

### **Query Optimization**

#### Optimized Database Queries
```typescript
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

// Get contracts with automatic caching
const contracts = await QueryOptimizer.getContracts({
  category: 'IT',
  limit: 20
});

// Get user dashboard data with optimization
const dashboardData = await QueryOptimizer.getUserDashboardData(userId);
```

#### Query Caching
```typescript
// Cache database query results
const result = await QueryOptimizer.executeQuery(
  'user-contracts',
  async () => await fetchUserContracts(userId),
  { cache: true, cacheTtl: 600, tags: ['user', 'contracts'] }
);
```

#### Performance Monitoring
```typescript
// Get query performance metrics
const metrics = QueryOptimizer.getPerformanceMetrics();
console.log('Average execution time:', metrics.averageExecutionTime);
console.log('Cache hit rate:', metrics.cacheHitRate);
```

### **Performance Monitoring**

#### Request Monitoring
```typescript
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(async (request: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ data: 'response' });
});
```

#### System Health
```typescript
import { PerformanceMonitor } from '@/lib/performance/performance-monitor';

// Get system health status
const health = PerformanceMonitor.getSystemHealth();
console.log('System status:', health.status);
console.log('Memory usage:', health.memoryUsage);
console.log('Recommendations:', health.recommendations);
```

#### Performance Statistics
```typescript
// Get performance statistics
const stats = PerformanceMonitor.getPerformanceStats('24h');
console.log('Total requests:', stats.totalRequests);
console.log('Average response time:', stats.averageResponseTime);
console.log('Error rate:', stats.errorRate);
```

### **CDN Optimization**

#### Image Optimization
```typescript
import { CDNOptimizer } from '@/lib/performance/cdn-optimizer';

// Optimize image for different use cases
const heroImage = await CDNOptimizer.optimizeImage('/images/hero.jpg', {
  width: 1920,
  height: 1080,
  quality: 90,
  format: 'webp'
});

// Generate responsive images
const responsiveImages = CDNOptimizer.generateResponsiveImages('/images/product.jpg');
```

#### Asset Optimization
```typescript
// Optimize CSS files
const optimizedCSS = await CDNOptimizer.optimizeCSS('/styles/main.css');

// Optimize JavaScript files
const optimizedJS = await CDNOptimizer.optimizeJS('/scripts/app.js');
```

#### CDN Cache Management
```typescript
// Purge CDN cache
const success = await CDNOptimizer.purgeCache([
  '/api/contracts',
  '/api/users'
]);
```

## 🔧 Configuration

### Environment Variables

```bash
# Cache Configuration
REDIS_URL=redis://localhost:6379
MEMORY_CACHE_SIZE=1000
MEMORY_CACHE_TTL=300

# Query Optimization
QUERY_CACHE_ENABLED=true
CONNECTION_POOLING_ENABLED=true
SLOW_QUERY_THRESHOLD=1000

# Performance Monitoring
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_ALERT_THRESHOLD=2000
PERFORMANCE_CLEANUP_DAYS=30

# CDN Configuration
CDN_PROVIDER=vercel
CDN_DOMAIN=cdn.bidcloud.org
CDN_COMPRESSION=true
CDN_MINIFICATION=true
CDN_IMAGE_OPTIMIZATION=true
CDN_CACHING=true
CDN_CACHE_TTL=86400
```

### Cache Configuration

```typescript
const cacheConfig = {
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'your-password',
    db: 0
  },
  memory: {
    maxSize: 1000,
    ttl: 300
  },
  database: {
    queryCache: true,
    connectionPooling: true
  }
};
```

## 📈 Performance Metrics

### **Cache Statistics**

```sql
-- Get cache performance
SELECT * FROM get_cache_statistics(24);

-- Get cache hit rates by namespace
SELECT 
    cache_namespace,
    SUM(hit_count) as total_hits,
    SUM(miss_count) as total_misses,
    ROUND(
        (SUM(hit_count)::NUMERIC / NULLIF(SUM(hit_count + miss_count), 0)::NUMERIC) * 100, 
        2
    ) as hit_rate
FROM cache_statistics
GROUP BY cache_namespace;
```

### **Query Performance**

```sql
-- Get slow queries
SELECT * FROM get_slow_queries(24, 1000);

-- Get query performance summary
SELECT * FROM query_performance_summary;

-- Get database optimization recommendations
SELECT * FROM optimize_database_queries();
```

### **System Health**

```sql
-- Get system health metrics
SELECT * FROM get_system_health();

-- Get performance statistics
SELECT * FROM get_performance_statistics(24);

-- Get performance dashboard data
SELECT * FROM performance_dashboard;
```

## 🚀 Usage Examples

### **API Route with Caching**

```typescript
import { withCache } from '@/lib/performance/cache-manager';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  withCache({ ttl: 600, tags: ['contracts'] })(
    async (request: NextRequest) => {
      const contracts = await QueryOptimizer.getContracts();
      return NextResponse.json({ contracts });
    }
  )
);
```

### **Optimized Database Query**

```typescript
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

export async function getContractMatches(userId: string) {
  return QueryOptimizer.getContractMatches(userId, 20);
}
```

### **Performance Monitoring**

```typescript
import { monitorPerformance } from '@/lib/performance/performance-monitor';

class ContractService {
  @monitorPerformance
  async getContracts(filters: any) {
    // Your business logic here
    return await this.fetchContracts(filters);
  }
}
```

### **CDN Optimization**

```typescript
import { AssetOptimizer } from '@/lib/performance/cdn-optimizer';

// Optimize image for hero section
const heroImage = await AssetOptimizer.optimizeForUseCase(
  '/images/hero.jpg',
  'hero'
);

// Generate responsive image component
const responsiveImage = AssetOptimizer.generateResponsiveImageComponent(
  '/images/product.jpg',
  'Product image',
  '(max-width: 768px) 100vw, 50vw'
);
```

## 📊 Performance Dashboard

### **Dashboard API**

```typescript
// Get performance dashboard
const response = await fetch('/api/performance/dashboard?timeRange=24h&includeDetails=true');
const dashboard = await response.json();

console.log('Performance metrics:', dashboard.data.performance);
console.log('System health:', dashboard.data.systemHealth);
console.log('Cache statistics:', dashboard.data.cache);
```

### **Performance Actions**

```typescript
// Clear cache
await fetch('/api/performance/dashboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'clear_cache' })
});

// Clear user cache
await fetch('/api/performance/dashboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'clear_user_cache', 
    data: { userId: 'user-123' } 
  })
});

// Purge CDN cache
await fetch('/api/performance/dashboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'purge_cdn', 
    data: { urls: ['/api/contracts', '/api/users'] } 
  })
});
```

## 🛠️ Maintenance

### **Daily Maintenance**

```sql
-- Run daily performance maintenance
SELECT * FROM daily_performance_maintenance();
```

### **Cleanup Old Data**

```sql
-- Cleanup performance data older than 30 days
SELECT * FROM cleanup_performance_data(30);
```

### **Database Optimization**

```sql
-- Get optimization recommendations
SELECT * FROM optimize_database_queries();

-- Get table statistics
SELECT * FROM get_table_statistics();
```

## 🔍 Monitoring and Alerting

### **Performance Alerts**

The system automatically creates alerts for:
- **Slow responses** (> 2 seconds)
- **High memory usage** (> 80%)
- **High CPU usage** (> 80%)
- **High error rates** (> 5%)
- **Low cache hit rates** (< 50%)

### **Alert Management**

```typescript
// Get active alerts
const alerts = PerformanceMonitor.getActiveAlerts();

// Resolve alert
await PerformanceMonitor.resolveAlert('alert-id');
```

### **Performance Thresholds**

```typescript
const thresholds = {
  responseTime: 2000, // 2 seconds
  memoryUsage: 80, // 80%
  cpuUsage: 80, // 80%
  errorRate: 5, // 5%
  cacheMissRate: 50 // 50%
};
```

## 🚀 Performance Best Practices

### **Caching Strategy**

1. **Cache frequently accessed data** with appropriate TTL
2. **Use cache tags** for efficient invalidation
3. **Implement cache warming** for critical data
4. **Monitor cache hit rates** and optimize accordingly

### **Query Optimization**

1. **Use optimized database functions** for complex queries
2. **Implement query caching** for repeated operations
3. **Monitor slow queries** and optimize them
4. **Use database indexes** effectively

### **CDN Optimization**

1. **Optimize images** for different use cases
2. **Use responsive images** with srcset
3. **Implement lazy loading** for images
4. **Purge cache** when content changes

### **Performance Monitoring**

1. **Monitor key metrics** continuously
2. **Set up alerts** for performance issues
3. **Regular cleanup** of old performance data
4. **Analyze trends** and optimize accordingly

## 🔧 Troubleshooting

### **Common Issues**

#### **High Memory Usage**
- Check for memory leaks in application code
- Optimize data structures and algorithms
- Implement proper garbage collection

#### **Slow Database Queries**
- Analyze query execution plans
- Add missing indexes
- Optimize complex joins and subqueries

#### **Low Cache Hit Rates**
- Review cache TTL settings
- Check cache invalidation logic
- Optimize cache key strategies

#### **CDN Issues**
- Verify CDN configuration
- Check asset optimization settings
- Monitor CDN performance metrics

### **Performance Debugging**

```typescript
// Enable performance logging
process.env.PERFORMANCE_LOGGING = 'true';

// Get detailed performance metrics
const metrics = PerformanceMonitor.getPerformanceStats('1h');
console.log('Performance metrics:', metrics);
```

---

**The Performance Optimization System provides comprehensive caching, query optimization, monitoring, and CDN integration to ensure optimal performance and scalability for BidCloud.**
