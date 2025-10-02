/**
 * Rate Limiting System
 * Comprehensive rate limiting for API endpoints and user actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitRule {
  endpoint: string;
  config: RateLimitConfig;
  message?: string;
}

export class RateLimiter {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private static rules: RateLimitRule[] = [
    // Authentication endpoints
    {
      endpoint: '/api/auth/login',
      config: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
      message: 'Too many login attempts. Please try again later.'
    },
    {
      endpoint: '/api/auth/register',
      config: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 registrations per hour
      message: 'Too many registration attempts. Please try again later.'
    },
    {
      endpoint: '/api/auth/reset-password',
      config: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 password resets per hour
      message: 'Too many password reset attempts. Please try again later.'
    },
    
    // API endpoints
    {
      endpoint: '/api/contracts',
      config: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
      message: 'Too many requests. Please slow down.'
    },
    {
      endpoint: '/api/notifications',
      config: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 requests per minute
      message: 'Too many notification requests. Please slow down.'
    },
    
    // Admin endpoints
    {
      endpoint: '/api/admin',
      config: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 requests per minute
      message: 'Admin rate limit exceeded.'
    },
    
    // General API protection
    {
      endpoint: '/api',
      config: { windowMs: 60 * 1000, maxRequests: 1000 }, // 1000 requests per minute
      message: 'API rate limit exceeded. Please slow down.'
    }
  ];

  /**
   * Get rate limit key for request
   */
  private static getRateLimitKey(request: NextRequest): string {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const endpoint = this.getEndpointPattern(request.url);
    
    return `${ip}:${endpoint}:${userAgent}`;
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return request.ip || 'unknown';
  }

  /**
   * Get endpoint pattern for rate limiting
   */
  private static getEndpointPattern(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Find matching rule
      for (const rule of this.rules) {
        if (pathname.startsWith(rule.endpoint)) {
          return rule.endpoint;
        }
      }
      
      // Default to general API protection
      return '/api';
    } catch (error) {
      return '/api';
    }
  }

  /**
   * Get rate limit rule for endpoint
   */
  private static getRateLimitRule(endpoint: string): RateLimitRule | null {
    return this.rules.find(rule => endpoint.startsWith(rule.endpoint)) || null;
  }

  /**
   * Check rate limit for request
   */
  static async checkRateLimit(request: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    message?: string;
  }> {
    try {
      const key = this.getRateLimitKey(request);
      const endpoint = this.getEndpointPattern(request.url);
      const rule = this.getRateLimitRule(endpoint);
      
      if (!rule) {
        return { allowed: true, remaining: Infinity, resetTime: 0 };
      }

      const now = Date.now();
      const windowStart = now - rule.config.windowMs;
      
      // Get current request count
      const { data: requests, error } = await this.supabase
        .from('rate_limit_requests')
        .select('*')
        .eq('rate_limit_key', key)
        .gte('created_at', new Date(windowStart).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true, remaining: rule.config.maxRequests, resetTime: now + rule.config.windowMs };
      }

      const requestCount = requests?.length || 0;
      const remaining = Math.max(0, rule.config.maxRequests - requestCount);
      const resetTime = now + rule.config.windowMs;

      if (requestCount >= rule.config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          message: rule.message || 'Rate limit exceeded'
        };
      }

      // Record this request
      await this.recordRequest(key, now);

      return {
        allowed: true,
        remaining,
        resetTime
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }
  }

  /**
   * Record a request for rate limiting
   */
  private static async recordRequest(key: string, timestamp: number): Promise<void> {
    try {
      await this.supabase
        .from('rate_limit_requests')
        .insert({
          rate_limit_key: key,
          created_at: new Date(timestamp).toISOString()
        });

    } catch (error) {
      console.error('Error recording rate limit request:', error);
    }
  }

  /**
   * Clean up old rate limit records
   */
  static async cleanupOldRecords(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const { error } = await this.supabase
        .from('rate_limit_requests')
        .delete()
        .lt('created_at', cutoffTime.toISOString());

      if (error) {
        console.error('Error cleaning up rate limit records:', error);
      } else {
        console.log('Rate limit records cleaned up successfully');
      }

    } catch (error) {
      console.error('Rate limit cleanup error:', error);
    }
  }

  /**
   * Rate limiting middleware
   */
  static async withRateLimit(
    request: NextRequest,
    handler: Function
  ): Promise<NextResponse> {
    const rateLimitResult = await this.checkRateLimit(request);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', '1000');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  }

  /**
   * Get rate limit status for user
   */
  static async getRateLimitStatus(request: NextRequest): Promise<{
    endpoint: string;
    remaining: number;
    resetTime: number;
    limit: number;
  }> {
    const key = this.getRateLimitKey(request);
    const endpoint = this.getEndpointPattern(request.url);
    const rule = this.getRateLimitRule(endpoint);
    
    if (!rule) {
      return {
        endpoint,
        remaining: Infinity,
        resetTime: 0,
        limit: Infinity
      };
    }

    const now = Date.now();
    const windowStart = now - rule.config.windowMs;
    
    const { data: requests } = await this.supabase
      .from('rate_limit_requests')
      .select('*')
      .eq('rate_limit_key', key)
      .gte('created_at', new Date(windowStart).toISOString());

    const requestCount = requests?.length || 0;
    const remaining = Math.max(0, rule.config.maxRequests - requestCount);
    const resetTime = now + rule.config.windowMs;

    return {
      endpoint,
      remaining,
      resetTime,
      limit: rule.config.maxRequests
    };
  }
}

/**
 * Rate limit middleware for specific endpoints
 */
export function withRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, handler: Function) => {
    const rateLimitResult = await RateLimiter.checkRateLimit(request);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    return handler(request);
  };
}
