/**
 * Advanced Cache Management System
 * Multi-layer caching with Redis, in-memory, and database optimization
 */

import { createClient } from 'redis';

export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  memory: {
    maxSize: number;
    ttl: number;
  };
  database: {
    queryCache: boolean;
    connectionPooling: boolean;
  };
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  namespace?: string; // Cache namespace
  serialize?: boolean; // Whether to serialize data
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  redisConnected: boolean;
}

export class CacheManager {
  private static redis: any = null;
  private static memoryCache = new Map<string, { data: any; expires: number; tags: string[] }>();
  private static stats = {
    hits: 0,
    misses: 0,
    memorySize: 0
  };

  private static config: CacheConfig = {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    },
    memory: {
      maxSize: parseInt(process.env.MEMORY_CACHE_SIZE || '1000'),
      ttl: parseInt(process.env.MEMORY_CACHE_TTL || '300') // 5 minutes
    },
    database: {
      queryCache: process.env.QUERY_CACHE_ENABLED === 'true',
      connectionPooling: process.env.CONNECTION_POOLING_ENABLED === 'true'
    }
  };

  /**
   * Initialize cache system
   */
  static async initialize(): Promise<void> {
    try {
      // Initialize Redis connection
      if (process.env.REDIS_URL) {
        this.redis = createClient({
          url: process.env.REDIS_URL
        });
      } else {
        this.redis = createClient({
          host: this.config.redis.host,
          port: this.config.redis.port,
          password: this.config.redis.password,
          db: this.config.redis.db
        });
      }

      this.redis.on('error', (err: any) => {
        console.error('Redis connection error:', err);
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
      });

      await this.redis.connect();

      // Start memory cache cleanup
      this.startMemoryCacheCleanup();

    } catch (error) {
      console.error('Cache initialization failed:', error);
      // Continue without Redis if connection fails
    }
  }

  /**
   * Get data from cache
   */
  static async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryResult = this.getFromMemory(key);
      if (memoryResult !== null) {
        this.stats.hits++;
        return memoryResult;
      }

      // Try Redis cache
      if (this.redis) {
        const redisKey = this.buildKey(key, options.namespace);
        const redisResult = await this.redis.get(redisKey);
        
        if (redisResult) {
          this.stats.hits++;
          const data = options.serialize ? JSON.parse(redisResult) : redisResult;
          
          // Store in memory cache for faster access
          this.setInMemory(key, data, options);
          
          return data;
        }
      }

      this.stats.misses++;
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set data in cache
   */
  static async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const ttl = options.ttl || 3600; // Default 1 hour
      const serializedData = options.serialize !== false ? JSON.stringify(data) : data;

      // Set in memory cache
      this.setInMemory(key, data, options);

      // Set in Redis cache
      if (this.redis) {
        const redisKey = this.buildKey(key, options.namespace);
        await this.redis.setEx(redisKey, ttl, serializedData);

        // Set tags for invalidation
        if (options.tags && options.tags.length > 0) {
          await this.setCacheTags(redisKey, options.tags);
        }
      }

      return true;

    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete data from cache
   */
  static async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      // Delete from memory cache
      this.memoryCache.delete(key);

      // Delete from Redis cache
      if (this.redis) {
        const redisKey = this.buildKey(key, options.namespace);
        await this.redis.del(redisKey);
      }

      return true;

    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  static async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let invalidatedCount = 0;

      if (this.redis) {
        for (const tag of tags) {
          const keys = await this.redis.sMembers(`tag:${tag}`);
          if (keys.length > 0) {
            await this.redis.del(...keys);
            invalidatedCount += keys.length;
          }
        }
      }

      // Invalidate memory cache by tags
      for (const [key, value] of this.memoryCache.entries()) {
        if (value.tags.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key);
          invalidatedCount++;
        }
      }

      return invalidatedCount;

    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<boolean> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      this.stats.memorySize = 0;

      // Clear Redis cache
      if (this.redis) {
        await this.redis.flushDb();
      }

      return true;

    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.stats.memorySize,
      redisConnected: this.redis ? this.redis.isReady : false
    };
  }

  /**
   * Get data from memory cache
   */
  private static getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.memoryCache.delete(key);
      this.stats.memorySize--;
      return null;
    }

    return item.data;
  }

  /**
   * Set data in memory cache
   */
  private static setInMemory<T>(
    key: string, 
    data: T, 
    options: CacheOptions
  ): void {
    const ttl = (options.ttl || 300) * 1000; // Convert to milliseconds
    const expires = Date.now() + ttl;
    const tags = options.tags || [];

    // Check memory cache size limit
    if (this.memoryCache.size >= this.config.memory.maxSize) {
      // Remove oldest item
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
      this.stats.memorySize--;
    }

    this.memoryCache.set(key, { data, expires, tags });
    this.stats.memorySize++;
  }

  /**
   * Build cache key with namespace
   */
  private static buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Set cache tags for invalidation
   */
  private static async setCacheTags(key: string, tags: string[]): Promise<void> {
    if (!this.redis) return;

    for (const tag of tags) {
      await this.redis.sAdd(`tag:${tag}`, key);
    }
  }

  /**
   * Start memory cache cleanup process
   */
  private static startMemoryCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, value] of this.memoryCache.entries()) {
        if (now > value.expires) {
          this.memoryCache.delete(key);
          cleanedCount++;
        }
      }

      this.stats.memorySize -= cleanedCount;

      if (cleanedCount > 0) {
        console.log(`Cleaned ${cleanedCount} expired memory cache entries`);
      }
    }, 60000); // Run every minute
  }

  /**
   * Cache with automatic key generation
   */
  static async cache<T>(
    keyGenerator: () => string,
    dataFetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const key = keyGenerator();
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }

    const data = await dataFetcher();
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Cache database query results
   */
  static async cacheQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    return this.cache(
      () => `query:${queryKey}`,
      queryFn,
      { ...options, namespace: 'db', ttl: options.ttl || 300 }
    );
  }

  /**
   * Cache API response
   */
  static async cacheApiResponse<T>(
    endpoint: string,
    params: Record<string, any>,
    responseFetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const paramString = JSON.stringify(params);
    const cacheKey = `${endpoint}:${Buffer.from(paramString).toString('base64')}`;
    
    return this.cache(
      () => cacheKey,
      responseFetcher,
      { ...options, namespace: 'api', ttl: options.ttl || 600 }
    );
  }
}

/**
 * Cache decorator for functions
 */
export function cached(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      const cached = await CacheManager.get(key, options);
      
      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      await CacheManager.set(key, result, options);
      
      return result;
    };
  };
}

/**
 * Cache middleware for API routes
 */
export function withCache(options: CacheOptions = {}) {
  return function (handler: Function) {
    return async function (request: NextRequest, ...args: any[]) {
      const url = new URL(request.url);
      const cacheKey = `${request.method}:${url.pathname}:${url.search}`;
      
      const cached = await CacheManager.get(cacheKey, options);
      if (cached !== null) {
        return new NextResponse(JSON.stringify(cached), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const response = await handler(request, ...args);
      const responseData = await response.json();
      
      await CacheManager.set(cacheKey, responseData, options);
      
      return new NextResponse(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' }
      });
    };
  };
}
