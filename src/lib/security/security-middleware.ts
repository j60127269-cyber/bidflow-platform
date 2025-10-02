/**
 * Comprehensive Security Middleware
 * Combines CSRF protection, rate limiting, session management, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from './csrf-protection';
import { SessionManager } from './session-management';
import { RateLimiter } from './rate-limiting';
import { SecurityHeaders } from './security-headers';

export interface SecurityConfig {
  enableCSRF: boolean;
  enableRateLimit: boolean;
  enableSessionValidation: boolean;
  enableSecurityHeaders: boolean;
  skipPaths: string[];
}

export class SecurityMiddleware {
  private static config: SecurityConfig = {
    enableCSRF: true,
    enableRateLimit: true,
    enableSessionValidation: true,
    enableSecurityHeaders: true,
    skipPaths: [
      '/api/health',
      '/api/auth/callback',
      '/favicon.ico',
      '/_next/static',
      '/_next/image'
    ]
  };

  /**
   * Main security middleware
   */
  static async withSecurity(
    request: NextRequest,
    handler: Function
  ): Promise<NextResponse> {
    try {
      // Skip security checks for certain paths
      if (this.shouldSkipSecurity(request)) {
        return await handler(request);
      }

      // Apply rate limiting
      if (this.config.enableRateLimit) {
        const rateLimitResult = await RateLimiter.checkRateLimit(request);
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
      }

      // Apply session validation for protected routes
      if (this.config.enableSessionValidation && this.requiresSession(request)) {
        const sessionId = request.cookies.get('session-id')?.value;
        
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const { valid, userId } = await SessionManager.validateSession(sessionId, request);
        
        if (!valid) {
          return NextResponse.json(
            { error: 'Invalid or expired session' },
            { status: 401 }
          );
        }

        // Add user ID to request headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', userId || '');
        request.headers = requestHeaders;
      }

      // Apply CSRF protection for state-changing requests
      if (this.config.enableCSRF && this.requiresCSRF(request)) {
        const { valid } = CSRFProtection.validateCSRF(request);
        
        if (!valid) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          );
        }
      }

      // Execute the handler
      const response = await handler(request);

      // Apply security headers
      if (this.config.enableSecurityHeaders) {
        return SecurityHeaders.applySecurityHeaders(response);
      }

      return response;

    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Security validation failed' },
        { status: 500 }
      );
    }
  }

  /**
   * Check if security should be skipped for this request
   */
  private static shouldSkipSecurity(request: NextRequest): boolean {
    const pathname = new URL(request.url).pathname;
    
    return this.config.skipPaths.some(skipPath => 
      pathname.startsWith(skipPath)
    );
  }

  /**
   * Check if request requires session validation
   */
  private static requiresSession(request: NextRequest): boolean {
    const pathname = new URL(request.url).pathname;
    
    // API routes require session validation
    if (pathname.startsWith('/api/')) {
      // Skip auth callback and health check
      if (pathname.includes('/auth/callback') || pathname.includes('/health')) {
        return false;
      }
      return true;
    }
    
    // Admin routes require session validation
    if (pathname.startsWith('/admin/')) {
      return true;
    }
    
    // Dashboard routes require session validation
    if (pathname.startsWith('/dashboard/')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if request requires CSRF protection
   */
  private static requiresCSRF(request: NextRequest): boolean {
    // Only POST, PUT, PATCH, DELETE requests need CSRF protection
    const method = request.method;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return false;
    }
    
    const pathname = new URL(request.url).pathname;
    
    // Skip CSRF for certain endpoints
    const skipCSRFPaths = [
      '/api/auth/callback',
      '/api/health',
      '/api/webhooks'
    ];
    
    if (skipCSRFPaths.some(skipPath => pathname.startsWith(skipPath))) {
      return false;
    }
    
    return true;
  }

  /**
   * Security middleware for API routes
   */
  static withAPISecurity(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      return this.withSecurity(request, handler);
    };
  }

  /**
   * Security middleware for admin routes
   */
  static withAdminSecurity(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      // Admin routes get stricter security
      const originalConfig = { ...this.config };
      this.config.enableCSRF = true;
      this.config.enableRateLimit = true;
      this.config.enableSessionValidation = true;
      
      const response = await this.withSecurity(request, handler);
      
      // Restore original config
      this.config = originalConfig;
      
      return response;
    };
  }

  /**
   * Security middleware for public routes
   */
  static withPublicSecurity(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      // Public routes get minimal security
      const originalConfig = { ...this.config };
      this.config.enableCSRF = false;
      this.config.enableSessionValidation = false;
      this.config.enableRateLimit = true; // Still apply rate limiting
      
      const response = await this.withSecurity(request, handler);
      
      // Restore original config
      this.config = originalConfig;
      
      return response;
    };
  }

  /**
   * Get security status for request
   */
  static async getSecurityStatus(request: NextRequest): Promise<{
    rateLimit: any;
    session: any;
    csrf: any;
  }> {
    const rateLimit = await RateLimiter.getRateLimitStatus(request);
    
    const sessionId = request.cookies.get('session-id')?.value;
    const session = sessionId ? 
      await SessionManager.validateSession(sessionId, request) : 
      { valid: false };
    
    const csrfToken = CSRFProtection.extractToken(request);
    const csrf = {
      hasToken: !!csrfToken,
      valid: csrfToken ? CSRFProtection.verifyToken(csrfToken) : false
    };
    
    return { rateLimit, session, csrf };
  }
}

/**
 * Security middleware decorators
 */
export function withSecurity(handler: Function) {
  return SecurityMiddleware.withSecurity;
}

export function withAPISecurity(handler: Function) {
  return SecurityMiddleware.withAPISecurity(handler);
}

export function withAdminSecurity(handler: Function) {
  return SecurityMiddleware.withAdminSecurity(handler);
}

export function withPublicSecurity(handler: Function) {
  return SecurityMiddleware.withPublicSecurity(handler);
}

/**
 * Security status endpoint
 */
export async function getSecurityStatus(request: NextRequest) {
  try {
    const status = await SecurityMiddleware.getSecurityStatus(request);
    
    return NextResponse.json({
      success: true,
      security: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting security status:', error);
    return NextResponse.json(
      { error: 'Failed to get security status' },
      { status: 500 }
    );
  }
}
