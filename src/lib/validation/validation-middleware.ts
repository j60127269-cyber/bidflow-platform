/**
 * Validation Middleware System
 * Unified validation middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ErrorHandler } from './error-handling';
import { InputSanitizer } from './input-sanitization';
import { ValidationUtils } from './validation-schemas';

export interface ValidationConfig {
  schema: ZodSchema;
  sanitizeInput?: boolean;
  allowPartial?: boolean;
  strictMode?: boolean;
}

export class ValidationMiddleware {
  /**
   * Validate request body
   */
  static async validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>,
    options: {
      sanitize?: boolean;
      allowPartial?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    data?: T;
    errors?: ZodError;
    sanitizedData?: any;
  }> {
    try {
      // Parse request body
      const body = await request.json();
      
      // Sanitize input if requested
      let sanitizedData = body;
      if (options.sanitize) {
        sanitizedData = this.sanitizeRequestBody(body);
      }

      // Validate data
      const result = ValidationUtils.validate(schema, sanitizedData);
      
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        sanitizedData: options.sanitize ? sanitizedData : undefined
      };

    } catch (error) {
      console.error('Body validation error:', error);
      return {
        success: false,
        errors: new ZodError([{
          code: 'custom',
          message: 'Invalid request body',
          path: ['body']
        }])
      };
    }
  }

  /**
   * Validate query parameters
   */
  static validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): {
    success: boolean;
    data?: T;
    errors?: ZodError;
  } {
    try {
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams);
      
      const result = ValidationUtils.validate(schema, queryParams);
      return result;

    } catch (error) {
      console.error('Query validation error:', error);
      return {
        success: false,
        errors: new ZodError([{
          code: 'custom',
          message: 'Invalid query parameters',
          path: ['query']
        }])
      };
    }
  }

  /**
   * Validate path parameters
   */
  static validateParams<T>(
    params: Record<string, string>,
    schema: ZodSchema<T>
  ): {
    success: boolean;
    data?: T;
    errors?: ZodError;
  } {
    try {
      const result = ValidationUtils.validate(schema, params);
      return result;

    } catch (error) {
      console.error('Params validation error:', error);
      return {
        success: false,
        errors: new ZodError([{
          code: 'custom',
          message: 'Invalid path parameters',
          path: ['params']
        }])
      };
    }
  }

  /**
   * Sanitize request body
   */
  private static sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitized[key] = InputSanitizer.sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = InputSanitizer.sanitizeNumber(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? InputSanitizer.sanitizeString(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeRequestBody(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Create validation middleware
   */
  static withValidation<T>(
    config: ValidationConfig
  ) {
    return (handler: Function) => {
      return async (request: NextRequest, ...args: any[]) => {
        try {
          // Validate request body
          const validationResult = await this.validateBody(
            request,
            config.schema,
            {
              sanitize: config.sanitizeInput,
              allowPartial: config.allowPartial
            }
          );

          if (!validationResult.success) {
            const context = ErrorHandler.extractContext(request);
            const apiError = ErrorHandler.handleZodError(
              validationResult.errors!,
              context
            );
            return ErrorHandler.createErrorResponse(apiError);
          }

          // Add validated data to request
          const requestWithData = {
            ...request,
            validatedData: validationResult.data,
            sanitizedData: validationResult.sanitizedData
          };

          return await handler(requestWithData, ...args);

        } catch (error) {
          const context = ErrorHandler.extractContext(request);
          const apiError = ErrorHandler.handleUnknownError(error, context);
          return ErrorHandler.createErrorResponse(apiError);
        }
      };
    };
  }

  /**
   * Create query validation middleware
   */
  static withQueryValidation<T>(schema: ZodSchema<T>) {
    return (handler: Function) => {
      return async (request: NextRequest, ...args: any[]) => {
        try {
          const validationResult = this.validateQuery(request, schema);

          if (!validationResult.success) {
            const context = ErrorHandler.extractContext(request);
            const apiError = ErrorHandler.handleZodError(
              validationResult.errors!,
              context
            );
            return ErrorHandler.createErrorResponse(apiError);
          }

          // Add validated query to request
          const requestWithQuery = {
            ...request,
            validatedQuery: validationResult.data
          };

          return await handler(requestWithQuery, ...args);

        } catch (error) {
          const context = ErrorHandler.extractContext(request);
          const apiError = ErrorHandler.handleUnknownError(error, context);
          return ErrorHandler.createErrorResponse(apiError);
        }
      };
    };
  }

  /**
   * Create params validation middleware
   */
  static withParamsValidation<T>(schema: ZodSchema<T>) {
    return (handler: Function) => {
      return async (request: NextRequest, params: Record<string, string>, ...args: any[]) => {
        try {
          const validationResult = this.validateParams(params, schema);

          if (!validationResult.success) {
            const context = ErrorHandler.extractContext(request);
            const apiError = ErrorHandler.handleZodError(
              validationResult.errors!,
              context
            );
            return ErrorHandler.createErrorResponse(apiError);
          }

          // Add validated params to request
          const requestWithParams = {
            ...request,
            validatedParams: validationResult.data
          };

          return await handler(requestWithParams, params, ...args);

        } catch (error) {
          const context = ErrorHandler.extractContext(request);
          const apiError = ErrorHandler.handleUnknownError(error, context);
          return ErrorHandler.createErrorResponse(apiError);
        }
      };
    };
  }

  /**
   * Validate array of data (for bulk operations)
   */
  static validateArray<T>(
    data: any[],
    schema: ZodSchema<T>
  ): {
    success: boolean;
    validData: T[];
    errors: Array<{ index: number; errors: string[] }>;
  } {
    return ValidationUtils.validateArray(schema, data);
  }

  /**
   * Create array validation middleware
   */
  static withArrayValidation<T>(schema: ZodSchema<T>) {
    return (handler: Function) => {
      return async (request: NextRequest, ...args: any[]) => {
        try {
          const body = await request.json();
          
          if (!Array.isArray(body)) {
            const context = ErrorHandler.extractContext(request);
            const apiError = ErrorHandler.createError(
              'VALIDATION_ERROR',
              'Request body must be an array',
              400,
              undefined,
              context
            );
            return ErrorHandler.createErrorResponse(apiError);
          }

          const validationResult = this.validateArray(body, schema);

          if (!validationResult.success) {
            const context = ErrorHandler.extractContext(request);
            const apiError = ErrorHandler.createError(
              'VALIDATION_ERROR',
              'Array validation failed',
              400,
              { validationErrors: validationResult.errors },
              context
            );
            return ErrorHandler.createErrorResponse(apiError);
          }

          // Add validated array to request
          const requestWithArray = {
            ...request,
            validatedArray: validationResult.validData
          };

          return await handler(requestWithArray, ...args);

        } catch (error) {
          const context = ErrorHandler.extractContext(request);
          const apiError = ErrorHandler.handleUnknownError(error, context);
          return ErrorHandler.createErrorResponse(apiError);
        }
      };
    };
  }
}

/**
 * Validation middleware decorators
 */
export function withValidation<T>(config: ValidationConfig) {
  return ValidationMiddleware.withValidation(config);
}

export function withQueryValidation<T>(schema: ZodSchema<T>) {
  return ValidationMiddleware.withQueryValidation(schema);
}

export function withParamsValidation<T>(schema: ZodSchema<T>) {
  return ValidationMiddleware.withParamsValidation(schema);
}

export function withArrayValidation<T>(schema: ZodSchema<T>) {
  return ValidationMiddleware.withArrayValidation(schema);
}

/**
 * Common validation patterns
 */
export const CommonValidations = {
  // Pagination
  pagination: z.object({
    page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100))
  }),

  // Search
  search: z.object({
    q: z.string().min(1).max(100),
    category: z.string().optional(),
    status: z.string().optional()
  }),

  // Date range
  dateRange: z.object({
    startDate: z.string().refine(date => !isNaN(Date.parse(date))),
    endDate: z.string().refine(date => !isNaN(Date.parse(date)))
  }),

  // ID parameter
  idParam: z.object({
    id: z.string().uuid()
  }),

  // Bulk operations
  bulkIds: z.object({
    ids: z.array(z.string().uuid()).min(1).max(100)
  })
};
