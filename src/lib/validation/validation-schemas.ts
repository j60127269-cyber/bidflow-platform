/**
 * Standardized Validation Schemas
 * Comprehensive validation schemas for all data types in BidCloud
 */

import { z } from 'zod';

// =============================================
// BASE VALIDATION SCHEMAS
// =============================================

export const BaseValidation = {
  // Common field validations
  requiredString: z.string().min(1, 'This field is required').trim(),
  optionalString: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^(\+256|0)[0-9]{9}$/, 'Invalid Ugandan phone number format'),
  url: z.string().url('Invalid URL format'),
  
  // Date validations
  dateString: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  futureDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return parsedDate > new Date();
  }, {
    message: 'Date must be in the future'
  }),
  
  // Number validations
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Must be a non-negative number'),
  currency: z.number().min(0, 'Currency amount must be non-negative'),
  
  // Array validations
  nonEmptyArray: z.array(z.any()).min(1, 'At least one item is required'),
  optionalArray: z.array(z.any()).optional(),
};

// =============================================
// CONTRACT VALIDATION SCHEMAS
// =============================================

export const ContractValidation = {
  // Basic contract fields
  referenceNumber: z.string()
    .min(1, 'Reference number is required')
    .max(100, 'Reference number too long')
    .regex(/^[A-Z0-9\/\-_]+$/, 'Reference number contains invalid characters'),
  
  title: z.string()
    .min(1, 'Title is required')
    .max(500, 'Title too long'),
  
  category: z.enum([
    'Information Technology',
    'Construction & Engineering',
    'Media & Communications',
    'Financial Services',
    'Healthcare & Medical',
    'Education & Training',
    'Agriculture & Farming',
    'Tourism & Hospitality',
    'Transportation & Logistics',
    'Energy & Utilities',
    'Security & Safety',
    'Consulting & Professional Services',
    'Manufacturing & Production',
    'Research & Development',
    'Other'
  ], {
    errorMap: () => ({ message: 'Invalid category selected' })
  }),
  
  procurementMethod: z.enum([
    'Open Domestic Bidding',
    'International Competitive Bidding',
    'Restricted Bidding',
    'Direct Procurement',
    'Framework Agreement',
    'Request for Quotations',
    'Request for Proposals',
    'Single Source',
    'Emergency Procurement'
  ], {
    errorMap: () => ({ message: 'Invalid procurement method' })
  }),
  
  submissionDeadline: z.string()
    .min(1, 'Submission deadline is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, {
      message: 'Invalid deadline format'
    }),
  
  procuringEntity: z.string()
    .min(1, 'Procuring entity is required')
    .max(200, 'Entity name too long'),
  
  // Financial validations
  estimatedValueMin: z.number()
    .min(0, 'Minimum value must be non-negative')
    .max(1000000000000, 'Value too large')
    .optional(),
  
  estimatedValueMax: z.number()
    .min(0, 'Maximum value must be non-negative')
    .max(1000000000000, 'Value too large')
    .optional(),
  
  bidFee: z.number()
    .min(0, 'Bid fee must be non-negative')
    .max(10000000, 'Bid fee too large')
    .optional(),
  
  bidSecurityAmount: z.number()
    .min(0, 'Bid security amount must be non-negative')
    .max(100000000, 'Bid security amount too large')
    .optional(),
  
  // Status validations
  status: z.enum([
    'draft',
    'open',
    'closed',
    'evaluating',
    'awarded',
    'cancelled',
    'completed'
  ]),
  
  publishStatus: z.enum([
    'draft',
    'published',
    'archived'
  ]),
  
  // Complete contract schema
  create: z.object({
    reference_number: ContractValidation.referenceNumber,
    title: ContractValidation.title,
    category: ContractValidation.category,
    procurement_method: ContractValidation.procurementMethod,
    submission_deadline: ContractValidation.submissionDeadline,
    procuring_entity: ContractValidation.procuringEntity,
    estimated_value_min: ContractValidation.estimatedValueMin,
    estimated_value_max: ContractValidation.estimatedValueMax,
    bid_fee: ContractValidation.bidFee,
    bid_security_amount: ContractValidation.bidSecurityAmount,
    short_description: BaseValidation.optionalString,
    currency: z.string().default('UGX'),
    margin_of_preference: z.boolean().default(false),
    competition_level: z.enum(['low', 'medium', 'high', 'very_high']).default('medium'),
    status: ContractValidation.status.default('draft'),
    publish_status: ContractValidation.publishStatus.default('draft'),
    required_documents: BaseValidation.optionalArray,
    bid_attachments: BaseValidation.optionalArray
  }),
  
  update: ContractValidation.create.partial(),
  
  bulkImport: z.array(ContractValidation.create)
};

// =============================================
// USER PROFILE VALIDATION SCHEMAS
// =============================================

export const ProfileValidation = {
  email: BaseValidation.email,
  
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long'),
  
  businessType: z.enum([
    'IT Consulting',
    'Construction',
    'Engineering',
    'Financial Services',
    'Healthcare',
    'Education',
    'Agriculture',
    'Manufacturing',
    'Trading',
    'Services',
    'Other'
  ]),
  
  experienceYears: z.number()
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience too high'),
  
  teamSize: z.number()
    .int('Team size must be a whole number')
    .min(0, 'Team size cannot be negative')
    .max(1000, 'Team size too large'),
  
  maxContractValue: z.number()
    .min(0, 'Maximum contract value must be non-negative')
    .max(1000000000000, 'Maximum contract value too large'),
  
  minContractValue: z.number()
    .min(0, 'Minimum contract value must be non-negative')
    .max(1000000000000, 'Minimum contract value too large'),
  
  preferredCategories: z.array(z.string())
    .max(10, 'Too many preferred categories')
    .optional(),
  
  preferredLocations: z.array(z.string())
    .max(20, 'Too many preferred locations')
    .optional(),
  
  certifications: z.array(z.string())
    .max(50, 'Too many certifications')
    .optional(),
  
  // Complete profile schema
  create: z.object({
    email: ProfileValidation.email,
    first_name: ProfileValidation.firstName,
    last_name: ProfileValidation.lastName,
    company_name: ProfileValidation.companyName,
    business_type: ProfileValidation.businessType,
    experience_years: ProfileValidation.experienceYears,
    team_size: ProfileValidation.teamSize,
    max_contract_value: ProfileValidation.maxContractValue,
    min_contract_value: ProfileValidation.minContractValue,
    preferred_categories: ProfileValidation.preferredCategories,
    preferred_locations: ProfileValidation.preferredLocations,
    certifications: ProfileValidation.certifications
  }),
  
  update: ProfileValidation.create.partial()
};

// =============================================
// PROCURING ENTITY VALIDATION SCHEMAS
// =============================================

export const ProcuringEntityValidation = {
  entityName: z.string()
    .min(1, 'Entity name is required')
    .max(200, 'Entity name too long'),
  
  entityType: z.enum([
    'Ministry',
    'Department',
    'Agency',
    'Corporation',
    'District',
    'Municipality',
    'University',
    'Hospital',
    'School',
    'Other'
  ]),
  
  contactPerson: z.string()
    .max(100, 'Contact person name too long')
    .optional(),
  
  contactEmail: BaseValidation.email.optional(),
  
  contactPhone: BaseValidation.phone.optional(),
  
  website: BaseValidation.url.optional(),
  
  address: z.string()
    .max(500, 'Address too long')
    .optional(),
  
  // Complete entity schema
  create: z.object({
    entity_name: ProcuringEntityValidation.entityName,
    entity_type: ProcuringEntityValidation.entityType,
    contact_person: ProcuringEntityValidation.contactPerson,
    contact_email: ProcuringEntityValidation.contactEmail,
    contact_phone: ProcuringEntityValidation.contactPhone,
    website: ProcuringEntityValidation.website,
    address: ProcuringEntityValidation.address
  }),
  
  update: ProcuringEntityValidation.create.partial()
};

// =============================================
// NOTIFICATION VALIDATION SCHEMAS
// =============================================

export const NotificationValidation = {
  type: z.enum([
    'new_contract_match',
    'deadline_reminder',
    'daily_digest'
  ]),
  
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message too long'),
  
  channel: z.enum(['email', 'in_app', 'whatsapp']),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  // Complete notification schema
  create: z.object({
    type: NotificationValidation.type,
    title: NotificationValidation.title,
    message: NotificationValidation.message,
    channel: NotificationValidation.channel.default('email'),
    priority: NotificationValidation.priority.default('medium'),
    data: z.record(z.any()).optional()
  })
};

// =============================================
// BID TRACKING VALIDATION SCHEMAS
// =============================================

export const BidTrackingValidation = {
  contractId: z.string().uuid('Invalid contract ID'),
  
  trackingActive: z.boolean(),
  
  emailAlerts: z.boolean(),
  
  whatsappAlerts: z.boolean(),
  
  // Complete bid tracking schema
  create: z.object({
    contract_id: BidTrackingValidation.contractId,
    tracking_active: BidTrackingValidation.trackingActive,
    email_alerts: BidTrackingValidation.emailAlerts,
    whatsapp_alerts: BidTrackingValidation.whatsappAlerts
  }),
  
  update: BidTrackingValidation.create.partial()
};

// =============================================
// VALIDATION UTILITIES
// =============================================

export class ValidationUtils {
  /**
   * Validate data against schema
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
  } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }
  
  /**
   * Validate with custom error formatting
   */
  static validateWithErrors<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    formattedErrors?: string[];
  } {
    const result = this.validate(schema, data);
    
    if (!result.success && result.errors) {
      const formattedErrors = result.errors.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      return {
        success: false,
        formattedErrors
      };
    }
    
    return result;
  }
  
  /**
   * Validate array of data
   */
  static validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): {
    success: boolean;
    validData: T[];
    errors: Array<{ index: number; errors: string[] }>;
  } {
    const validData: T[] = [];
    const errors: Array<{ index: number; errors: string[] }> = [];
    
    data.forEach((item, index) => {
      const result = this.validateWithErrors(schema, item);
      
      if (result.success && result.data) {
        validData.push(result.data);
      } else if (result.formattedErrors) {
        errors.push({
          index,
          errors: result.formattedErrors
        });
      }
    });
    
    return {
      success: errors.length === 0,
      validData,
      errors
    };
  }
  
  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  }
  
  /**
   * Sanitize number input
   */
  static sanitizeNumber(input: string | number): number | null {
    if (typeof input === 'number') {
      return isNaN(input) ? null : input;
    }
    
    const cleaned = input.toString().replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? null : parsed;
  }
  
  /**
   * Sanitize date input
   */
  static sanitizeDate(input: string): string | null {
    const cleaned = input.trim();
    const parsed = new Date(cleaned);
    
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
}
