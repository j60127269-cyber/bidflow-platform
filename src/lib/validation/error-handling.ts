/**
 * Comprehensive Error Handling System
 * Standardized error handling, logging, and user feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  context?: ErrorContext;
}

export class ErrorHandler {
  private static errorCodes = {
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
    INVALID_FORMAT: 'INVALID_FORMAT',
    INVALID_VALUE: 'INVALID_VALUE',
    
    // Authentication errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    
    // Database errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
    CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
    
    // Business logic errors
    BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    
    // External service errors
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
    PAYMENT_SERVICE_ERROR: 'PAYMENT_SERVICE_ERROR',
    
    // System errors
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
  };

  /**
   * Create standardized API error
   */
  static createError(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
    context?: ErrorContext
  ): ApiError {
    return {
      code,
      message,
      statusCode,
      details,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    errors: ValidationError[],
    context?: ErrorContext
  ): ApiError {
    return this.createError(
      this.errorCodes.VALIDATION_ERROR,
      'Validation failed',
      400,
      { validationErrors: errors },
      context
    );
  }

  /**
   * Handle Zod validation errors
   */
  static handleZodError(
    error: ZodError,
    context?: ErrorContext
  ): ApiError {
    const validationErrors: ValidationError[] = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.input,
      code: err.code
    }));

    return this.handleValidationError(validationErrors, context);
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(
    type: 'unauthorized' | 'forbidden' | 'session_expired' | 'invalid_credentials',
    context?: ErrorContext
  ): ApiError {
    const errorMap = {
      unauthorized: {
        code: this.errorCodes.UNAUTHORIZED,
        message: 'Authentication required',
        statusCode: 401
      },
      forbidden: {
        code: this.errorCodes.FORBIDDEN,
        message: 'Access denied',
        statusCode: 403
      },
      session_expired: {
        code: this.errorCodes.SESSION_EXPIRED,
        message: 'Session has expired',
        statusCode: 401
      },
      invalid_credentials: {
        code: this.errorCodes.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
        statusCode: 401
      }
    };

    const error = errorMap[type];
    return this.createError(error.code, error.message, error.statusCode, undefined, context);
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(
    error: any,
    context?: ErrorContext
  ): ApiError {
    // Check for specific database error types
    if (error.code === '23505') { // Unique constraint violation
      return this.createError(
        this.errorCodes.DUPLICATE_ENTRY,
        'Record already exists',
        409,
        { constraint: error.constraint },
        context
      );
    }

    if (error.code === '23503') { // Foreign key constraint violation
      return this.createError(
        this.errorCodes.CONSTRAINT_VIOLATION,
        'Referenced record not found',
        400,
        { constraint: error.constraint },
        context
      );
    }

    if (error.code === '23502') { // Not null constraint violation
      return this.createError(
        this.errorCodes.CONSTRAINT_VIOLATION,
        'Required field is missing',
        400,
        { column: error.column },
        context
      );
    }

    // Generic database error
    return this.createError(
      this.errorCodes.DATABASE_ERROR,
      'Database operation failed',
      500,
      { originalError: error.message },
      context
    );
  }

  /**
   * Handle business logic errors
   */
  static handleBusinessError(
    message: string,
    details?: any,
    context?: ErrorContext
  ): ApiError {
    return this.createError(
      this.errorCodes.BUSINESS_RULE_VIOLATION,
      message,
      422,
      details,
      context
    );
  }

  /**
   * Handle external service errors
   */
  static handleExternalServiceError(
    service: string,
    error: any,
    context?: ErrorContext
  ): ApiError {
    const serviceErrorMap: Record<string, string> = {
      email: this.errorCodes.EMAIL_SERVICE_ERROR,
      payment: this.errorCodes.PAYMENT_SERVICE_ERROR,
      default: this.errorCodes.EXTERNAL_SERVICE_ERROR
    };

    const errorCode = serviceErrorMap[service] || serviceErrorMap.default;

    return this.createError(
      errorCode,
      `${service} service error`,
      502,
      { service, originalError: error.message },
      context
    );
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(
    retryAfter: number,
    context?: ErrorContext
  ): ApiError {
    return this.createError(
      this.errorCodes.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      429,
      { retryAfter },
      context
    );
  }

  /**
   * Create error response
   */
  static createErrorResponse(error: ApiError): NextResponse {
    const response = NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: error.context?.timestamp
        }
      },
      { status: error.statusCode }
    );

    // Add error-specific headers
    if (error.code === this.errorCodes.RATE_LIMIT_EXCEEDED && error.details?.retryAfter) {
      response.headers.set('Retry-After', error.details.retryAfter.toString());
    }

    if (error.code === this.errorCodes.SESSION_EXPIRED) {
      response.headers.set('WWW-Authenticate', 'Bearer');
    }

    return response;
  }

  /**
   * Log error for monitoring
   */
  static async logError(error: ApiError, request?: NextRequest): Promise<void> {
    try {
      // Create error log entry
      const errorLog = {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        context: error.context,
        request: request ? {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.ip
        } : undefined,
        timestamp: new Date().toISOString()
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', errorLog);
      }

      // TODO: Send to external logging service (e.g., Sentry, LogRocket)
      // await this.sendToLoggingService(errorLog);

    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError(
    error: any,
    context?: ErrorContext
  ): ApiError {
    // Log the original error for debugging
    console.error('Unknown error:', error);

    return this.createError(
      this.errorCodes.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined,
      context
    );
  }

  /**
   * Extract context from request
   */
  static extractContext(request: NextRequest): ErrorContext {
    return {
      requestId: request.headers.get('x-request-id') || undefined,
      endpoint: request.url,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined
    };
  }
}

/**
 * Error handling middleware
 */
export function withErrorHandling(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      const context = ErrorHandler.extractContext(request);
      
      let apiError: ApiError;
      
      if (error instanceof ZodError) {
        apiError = ErrorHandler.handleZodError(error, context);
      } else if (error.code && error.message) {
        // Database or known error
        apiError = ErrorHandler.handleDatabaseError(error, context);
      } else {
        // Unknown error
        apiError = ErrorHandler.handleUnknownError(error, context);
      }

      // Log the error
      await ErrorHandler.logError(apiError, request);

      // Return error response
      return ErrorHandler.createErrorResponse(apiError);
    }
  };
}

/**
 * Validation error formatter
 */
export class ValidationErrorFormatter {
  /**
   * Format validation errors for user display
   */
  static formatErrors(errors: ValidationError[]): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    errors.forEach(error => {
      formatted[error.field] = error.message;
    });
    
    return formatted;
  }

  /**
   * Format Zod errors for user display
   */
  static formatZodErrors(error: ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    error.errors.forEach(err => {
      const field = err.path.join('.');
      formatted[field] = err.message;
    });
    
    return formatted;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: ApiError): string {
    const userFriendlyMessages: Record<string, string> = {
      [ErrorHandler['errorCodes'].VALIDATION_ERROR]: 'Please check your input and try again',
      [ErrorHandler['errorCodes'].UNAUTHORIZED]: 'Please log in to continue',
      [ErrorHandler['errorCodes'].FORBIDDEN]: 'You do not have permission to perform this action',
      [ErrorHandler['errorCodes'].DUPLICATE_ENTRY]: 'This record already exists',
      [ErrorHandler['errorCodes'].RECORD_NOT_FOUND]: 'The requested record was not found',
      [ErrorHandler['errorCodes'].RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait and try again',
      [ErrorHandler['errorCodes'].EMAIL_SERVICE_ERROR]: 'Email service is temporarily unavailable',
      [ErrorHandler['errorCodes'].INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again later'
    };

    return userFriendlyMessages[error.code] || error.message;
  }
}
