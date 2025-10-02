/**
 * CSRF Protection System
 * Comprehensive CSRF protection for all forms and API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export interface CSRFConfig {
  secret: string;
  tokenLength: number;
  tokenExpiry: number; // in milliseconds
  cookieName: string;
  headerName: string;
}

export class CSRFProtection {
  private static config: CSRFConfig = {
    secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    tokenLength: 32,
    tokenExpiry: 3600000, // 1 hour
    cookieName: 'csrf-token',
    headerName: 'x-csrf-token'
  };

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    return crypto.randomBytes(this.config.tokenLength).toString('hex');
  }

  /**
   * Create a signed CSRF token
   */
  static createSignedToken(): string {
    const token = this.generateToken();
    const timestamp = Date.now().toString();
    const data = `${token}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.config.secret)
      .update(data)
      .digest('hex');
    
    return `${data}:${signature}`;
  }

  /**
   * Verify a CSRF token
   */
  static verifyToken(token: string): boolean {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) return false;

      const [tokenPart, timestamp, signature] = parts;
      const data = `${tokenPart}:${timestamp}`;
      
      // Check if token is expired
      const tokenTime = parseInt(timestamp);
      if (Date.now() - tokenTime > this.config.tokenExpiry) {
        return false;
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secret)
        .update(data)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('CSRF token verification error:', error);
      return false;
    }
  }

  /**
   * Extract CSRF token from request
   */
  static extractToken(request: NextRequest): string | null {
    // Try header first
    const headerToken = request.headers.get(this.config.headerName);
    if (headerToken) return headerToken;

    // Try form data
    const formData = request.formData();
    if (formData) {
      const csrfField = formData.get('_csrf') as string;
      if (csrfField) return csrfField;
    }

    // Try JSON body
    try {
      const body = request.json();
      if (body && body._csrf) return body._csrf;
    } catch (error) {
      // Not JSON or no _csrf field
    }

    return null;
  }

  /**
   * Middleware to validate CSRF tokens
   */
  static validateCSRF(request: NextRequest): { valid: boolean; token?: string } {
    const token = this.extractToken(request);
    
    if (!token) {
      return { valid: false };
    }

    const isValid = this.verifyToken(token);
    return { valid: isValid, token: isValid ? token : undefined };
  }

  /**
   * Create CSRF protection response
   */
  static createProtectedResponse(
    response: NextResponse,
    token?: string
  ): NextResponse {
    const csrfToken = token || this.createSignedToken();
    
    // Set CSRF token in cookie
    response.cookies.set(this.config.headerName, csrfToken, {
      httpOnly: false, // Allow JavaScript access for forms
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.tokenExpiry / 1000
    });

    // Add CSRF token to response headers
    response.headers.set('X-CSRF-Token', csrfToken);
    
    return response;
  }

  /**
   * Generate CSRF token for forms
   */
  static getFormToken(): string {
    return this.createSignedToken();
  }

  /**
   * Validate CSRF token from form submission
   */
  static validateFormSubmission(request: NextRequest): boolean {
    const { valid } = this.validateCSRF(request);
    return valid;
  }
}

/**
 * CSRF Protection Middleware
 */
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Skip CSRF validation for GET requests
    if (request.method === 'GET') {
      return handler(request, ...args);
    }

    // Validate CSRF token
    const { valid } = CSRFProtection.validateCSRF(request);
    
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    return handler(request, ...args);
  };
}

/**
 * CSRF Token Provider for React components
 */
export function getCSRFToken(): string {
  return CSRFProtection.getFormToken();
}

/**
 * CSRF Protected Form Hook
 */
export function useCSRFProtection() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    setToken(CSRFProtection.getFormToken());
  }, []);

  return token;
}
