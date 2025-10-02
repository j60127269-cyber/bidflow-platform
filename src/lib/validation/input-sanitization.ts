/**
 * Input Sanitization System
 * Comprehensive input sanitization and data cleaning
 */

import DOMPurify from 'isomorphic-dompurify';

export interface SanitizationOptions {
  allowHtml: boolean;
  maxLength: number;
  removeScripts: boolean;
  normalizeWhitespace: boolean;
  trimSpaces: boolean;
}

export class InputSanitizer {
  private static defaultOptions: SanitizationOptions = {
    allowHtml: false,
    maxLength: 1000,
    removeScripts: true,
    normalizeWhitespace: true,
    trimSpaces: true
  };

  /**
   * Sanitize string input
   */
  static sanitizeString(
    input: string,
    options: Partial<SanitizationOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Trim spaces
    if (opts.trimSpaces) {
      sanitized = sanitized.trim();
    }

    // Normalize whitespace
    if (opts.normalizeWhitespace) {
      sanitized = sanitized.replace(/\s+/g, ' ');
    }

    // Remove scripts if HTML is not allowed
    if (!opts.allowHtml && opts.removeScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Sanitize HTML if allowed
    if (opts.allowHtml) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
      });
    } else {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Encode special characters
    sanitized = this.encodeSpecialCharacters(sanitized);

    // Limit length
    if (sanitized.length > opts.maxLength) {
      sanitized = sanitized.substring(0, opts.maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize number input
   */
  static sanitizeNumber(input: string | number): number | null {
    if (typeof input === 'number') {
      return isNaN(input) || !isFinite(input) ? null : input;
    }

    if (typeof input !== 'string') {
      return null;
    }

    // Remove all non-numeric characters except decimal point and minus sign
    const cleaned = input.replace(/[^\d.-]/g, '');
    
    // Handle multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return null;
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const sanitized = input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^\w@.-]/g, ''); // Remove special characters except @, ., -

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Handle Ugandan phone numbers
    if (digits.startsWith('256')) {
      return `+${digits}`;
    } else if (digits.startsWith('0') && digits.length === 10) {
      return `+256${digits.substring(1)}`;
    } else if (digits.length === 9) {
      return `+256${digits}`;
    }
    
    return digits;
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const sanitized = input.trim();
    
    // Add protocol if missing
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      return `https://${sanitized}`;
    }
    
    return sanitized;
  }

  /**
   * Sanitize date input
   */
  static sanitizeDate(input: string): string | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const sanitized = input.trim();
    const parsed = new Date(sanitized);
    
    // Check if date is valid
    if (isNaN(parsed.getTime())) {
      return null;
    }
    
    // Check if date is reasonable (not too far in past or future)
    const now = new Date();
    const minDate = new Date(1900, 0, 1);
    const maxDate = new Date(2100, 11, 31);
    
    if (parsed < minDate || parsed > maxDate) {
      return null;
    }
    
    return parsed.toISOString();
  }

  /**
   * Sanitize array input
   */
  static sanitizeArray<T>(
    input: any[],
    itemSanitizer: (item: any) => T
  ): T[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return input
      .filter(item => item !== null && item !== undefined)
      .map(item => itemSanitizer(item))
      .filter(item => item !== null && item !== undefined);
  }

  /**
   * Sanitize object input
   */
  static sanitizeObject<T>(
    input: Record<string, any>,
    sanitizers: Record<string, (value: any) => any>
  ): Partial<T> {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (sanitizers[key]) {
        const sanitizedValue = sanitizers[key](value);
        if (sanitizedValue !== null && sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      }
    }

    return sanitized as Partial<T>;
  }

  /**
   * Sanitize file upload
   */
  static sanitizeFile(
    filename: string,
    allowedExtensions: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
  ): string | null {
    if (!filename || typeof filename !== 'string') {
      return null;
    }

    // Remove path information
    const basename = filename.split('/').pop() || filename;
    
    // Remove special characters
    const sanitized = basename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Check extension
    const extension = sanitized.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Encode special characters
   */
  private static encodeSpecialCharacters(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 100); // Limit length
  }

  /**
   * Sanitize SQL-like input (prevent injection)
   */
  static sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment starts
      .replace(/\*\//g, '') // Remove block comment ends
      .replace(/union/gi, '') // Remove UNION keywords
      .replace(/select/gi, '') // Remove SELECT keywords
      .replace(/insert/gi, '') // Remove INSERT keywords
      .replace(/update/gi, '') // Remove UPDATE keywords
      .replace(/delete/gi, '') // Remove DELETE keywords
      .replace(/drop/gi, '') // Remove DROP keywords
      .replace(/create/gi, '') // Remove CREATE keywords
      .replace(/alter/gi, '') // Remove ALTER keywords
      .trim();
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: string): any {
    if (!input || typeof input !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(input);
      
      // Recursively sanitize object
      return this.sanitizeObjectRecursively(parsed);
    } catch (error) {
      return null;
    }
  }

  /**
   * Recursively sanitize object
   */
  private static sanitizeObjectRecursively(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number') {
      return this.sanitizeNumber(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObjectRecursively(item));
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        const sanitizedValue = this.sanitizeObjectRecursively(value);
        sanitized[sanitizedKey] = sanitizedValue;
      }
      return sanitized;
    }

    return obj;
  }
}

/**
 * Sanitization middleware
 */
export function withSanitization<T>(
  sanitizers: Record<string, (value: any) => any>
) {
  return (data: Record<string, any>): Partial<T> => {
    return InputSanitizer.sanitizeObject(data, sanitizers);
  };
}

/**
 * Common sanitization patterns
 */
export const CommonSanitizers = {
  string: (value: any) => InputSanitizer.sanitizeString(value),
  email: (value: any) => InputSanitizer.sanitizeEmail(value),
  phone: (value: any) => InputSanitizer.sanitizePhone(value),
  url: (value: any) => InputSanitizer.sanitizeUrl(value),
  number: (value: any) => InputSanitizer.sanitizeNumber(value),
  date: (value: any) => InputSanitizer.sanitizeDate(value),
  search: (value: any) => InputSanitizer.sanitizeSearchQuery(value)
};
