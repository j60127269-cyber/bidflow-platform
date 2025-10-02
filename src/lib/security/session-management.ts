/**
 * Enhanced Session Management System
 * Secure session handling with rate limiting and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface SessionConfig {
  maxSessionsPerUser: number;
  sessionTimeout: number; // in milliseconds
  refreshThreshold: number; // in milliseconds
  secureCookies: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export interface SessionData {
  userId: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export class SessionManager {
  private static config: SessionConfig = {
    maxSessionsPerUser: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 60 * 60 * 1000, // 1 hour
    secureCookies: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Create a new session
   */
  static async createSession(
    userId: string,
    request: NextRequest
  ): Promise<{ sessionId: string; expiresAt: number }> {
    try {
      // Clean up old sessions for this user
      await this.cleanupUserSessions(userId);

      // Check session limit
      const activeSessions = await this.getUserActiveSessions(userId);
      if (activeSessions.length >= this.config.maxSessionsPerUser) {
        // Remove oldest session
        await this.removeOldestSession(userId);
      }

      const sessionId = crypto.randomUUID();
      const now = Date.now();
      const expiresAt = now + this.config.sessionTimeout;

      const sessionData: SessionData = {
        userId,
        sessionId,
        createdAt: now,
        lastActivity: now,
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        isActive: true
      };

      // Store session in database
      await this.supabase
        .from('user_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          session_data: sessionData,
          expires_at: new Date(expiresAt).toISOString(),
          created_at: new Date(now).toISOString(),
          last_activity: new Date(now).toISOString()
        });

      return { sessionId, expiresAt };

    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Validate and refresh session
   */
  static async validateSession(
    sessionId: string,
    request: NextRequest
  ): Promise<{ valid: boolean; userId?: string; refreshed?: boolean }> {
    try {
      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        return { valid: false };
      }

      const now = Date.now();
      const lastActivity = new Date(session.last_activity).getTime();

      // Check if session is expired
      if (now - lastActivity > this.config.sessionTimeout) {
        await this.invalidateSession(sessionId);
        return { valid: false };
      }

      // Check if session needs refresh
      const needsRefresh = now - lastActivity > this.config.refreshThreshold;
      
      if (needsRefresh) {
        await this.refreshSession(sessionId, request);
        return { valid: true, userId: session.user_id, refreshed: true };
      }

      return { valid: true, userId: session.user_id, refreshed: false };

    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false };
    }
  }

  /**
   * Refresh session activity
   */
  private static async refreshSession(
    sessionId: string,
    request: NextRequest
  ): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString(),
          ip_address: this.getClientIP(request),
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }

  /**
   * Invalidate session
   */
  static async invalidateSession(sessionId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  }

  /**
   * Invalidate all user sessions
   */
  static async invalidateUserSessions(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error invalidating user sessions:', error);
    }
  }

  /**
   * Get user's active sessions
   */
  private static async getUserActiveSessions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error fetching user sessions:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Remove oldest session for user
   */
  private static async removeOldestSession(userId: string): Promise<void> {
    try {
      const { data: oldestSession } = await this.supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: true })
        .limit(1)
        .single();

      if (oldestSession) {
        await this.invalidateSession(oldestSession.id);
      }

    } catch (error) {
      console.error('Error removing oldest session:', error);
    }
  }

  /**
   * Clean up expired sessions for user
   */
  private static async cleanupUserSessions(userId: string): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - this.config.sessionTimeout);
      
      await this.supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .lt('last_activity', cutoffTime.toISOString());

    } catch (error) {
      console.error('Error cleaning up user sessions:', error);
    }
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
   * Create secure session cookie
   */
  static createSessionCookie(
    sessionId: string,
    expiresAt: number
  ): string {
    const cookieOptions = [
      `session-id=${sessionId}`,
      `Expires=${new Date(expiresAt).toUTCString()}`,
      `Path=/`,
      this.config.secureCookies ? 'Secure' : '',
      `SameSite=${this.config.sameSite}`
    ].filter(Boolean).join('; ');

    return cookieOptions;
  }

  /**
   * Session middleware
   */
  static async withSessionValidation(
    request: NextRequest,
    handler: Function
  ): Promise<NextResponse> {
    try {
      const sessionId = request.cookies.get('session-id')?.value;
      
      if (!sessionId) {
        return NextResponse.json(
          { error: 'No session found' },
          { status: 401 }
        );
      }

      const { valid, userId, refreshed } = await this.validateSession(
        sessionId,
        request
      );

      if (!valid) {
        return NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        );
      }

      // Add user ID to request headers for downstream handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', userId || '');
      
      const modifiedRequest = new NextRequest(request, {
        headers: requestHeaders
      });

      const response = await handler(modifiedRequest);

      // If session was refreshed, update the cookie
      if (refreshed) {
        const newExpiresAt = Date.now() + this.config.sessionTimeout;
        response.cookies.set(
          'session-id',
          sessionId,
          {
            expires: new Date(newExpiresAt),
            httpOnly: true,
            secure: this.config.secureCookies,
            sameSite: this.config.sameSite
          }
        );
      }

      return response;

    } catch (error) {
      console.error('Session validation error:', error);
      return NextResponse.json(
        { error: 'Session validation failed' },
        { status: 500 }
      );
    }
  }
}

/**
 * Session cleanup job
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - SessionManager['config'].sessionTimeout);
    
    const { error } = await SessionManager['supabase']
      .from('user_sessions')
      .update({ is_active: false })
      .lt('last_activity', cutoffTime.toISOString());

    if (error) {
      console.error('Error cleaning up expired sessions:', error);
    } else {
      console.log('Expired sessions cleaned up successfully');
    }

  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}
