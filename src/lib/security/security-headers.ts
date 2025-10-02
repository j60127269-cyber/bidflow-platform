/**
 * Security Headers System
 * Comprehensive security headers for all responses
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  cspDirectives: Record<string, string[]>;
  hstsMaxAge: number;
  permissionsPolicy: Record<string, string[]>;
}

export class SecurityHeaders {
  private static config: SecurityHeadersConfig = {
    enableCSP: true,
    enableHSTS: process.env.NODE_ENV === 'production',
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true,
    hstsMaxAge: 31536000, // 1 year
    cspDirectives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for Next.js development
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'https://*.resend.com',
        'wss://*.supabase.co'
      ],
      'frame-src': [
        "'none'"
      ],
      'object-src': [
        "'none'"
      ],
      'base-uri': [
        "'self'"
      ],
      'form-action': [
        "'self'"
      ],
      'frame-ancestors': [
        "'none'"
      ]
    },
    permissionsPolicy: {
      'camera': [],
      'microphone': [],
      'geolocation': [],
      'payment': [],
      'usb': [],
      'magnetometer': [],
      'gyroscope': [],
      'accelerometer': []
    }
  };

  /**
   * Apply security headers to response
   */
  static applySecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.enableCSP) {
      const csp = this.buildCSP();
      response.headers.set('Content-Security-Policy', csp);
    }

    // HTTP Strict Transport Security
    if (this.config.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        `max-age=${this.config.hstsMaxAge}; includeSubDomains; preload`
      );
    }

    // X-Frame-Options
    if (this.config.enableXFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY');
    }

    // X-Content-Type-Options
    if (this.config.enableXContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      const permissionsPolicy = this.buildPermissionsPolicy();
      response.headers.set('Permissions-Policy', permissionsPolicy);
    }

    // Additional security headers
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return response;
  }

  /**
   * Build Content Security Policy
   */
  private static buildCSP(): string {
    const directives = Object.entries(this.config.cspDirectives)
      .map(([directive, sources]) => {
        if (sources.length === 0) return directive;
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    return directives;
  }

  /**
   * Build Permissions Policy
   */
  private static buildPermissionsPolicy(): string {
    return Object.entries(this.config.permissionsPolicy)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) return `${feature}=()`;
        return `${feature}=(${allowlist.join(' ')})`;
      })
      .join(', ');
  }

  /**
   * Security headers middleware
   */
  static withSecurityHeaders(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
      const response = await handler(request, ...args);
      return this.applySecurityHeaders(response);
    };
  }

  /**
   * Get security headers for specific route
   */
  static getRouteSecurityHeaders(route: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // API routes get stricter CSP
    if (route.startsWith('/api/')) {
      headers['Content-Security-Policy'] = "default-src 'self'; script-src 'none'; style-src 'none'";
    }

    // Admin routes get additional security
    if (route.startsWith('/admin/')) {
      headers['X-Frame-Options'] = 'DENY';
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    return headers;
  }

  /**
   * Validate security headers in response
   */
  static validateSecurityHeaders(response: NextResponse): {
    valid: boolean;
    missing: string[];
    warnings: string[];
  } {
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy'
    ];

    const missing: string[] = [];
    const warnings: string[] = [];

    // Check for required headers
    for (const header of requiredHeaders) {
      if (!response.headers.has(header)) {
        missing.push(header);
      }
    }

    // Check for security warnings
    const csp = response.headers.get('Content-Security-Policy');
    if (csp && csp.includes("'unsafe-inline'")) {
      warnings.push('CSP contains unsafe-inline directive');
    }

    if (csp && csp.includes("'unsafe-eval'")) {
      warnings.push('CSP contains unsafe-eval directive');
    }

    const valid = missing.length === 0;

    return { valid, missing, warnings };
  }
}

/**
 * Security headers middleware for API routes
 */
export function withAPISecurityHeaders(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const response = await handler(request, ...args);
    
    // Apply API-specific security headers
    response.headers.set('Content-Security-Policy', "default-src 'self'");
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  };
}

/**
 * Security headers middleware for admin routes
 */
export function withAdminSecurityHeaders(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const response = await handler(request, ...args);
    
    // Apply admin-specific security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer');
    
    return response;
  };
}
