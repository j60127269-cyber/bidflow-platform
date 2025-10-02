/**
 * Validation API Endpoint
 * Centralized validation endpoint for all data types
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationMiddleware } from '@/lib/validation/validation-middleware';
import { ErrorHandler } from '@/lib/validation/error-handling';
import { 
  ContractValidation, 
  ProfileValidation, 
  ProcuringEntityValidation,
  NotificationValidation,
  BidTrackingValidation 
} from '@/lib/validation/validation-schemas';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    let validationResult;

    switch (type) {
      case 'contract':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          ContractValidation.create
        );
        break;

      case 'contract-update':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          ContractValidation.update
        );
        break;

      case 'profile':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          ProfileValidation.create
        );
        break;

      case 'profile-update':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          ProfileValidation.update
        );
        break;

      case 'procuring-entity':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          ProcuringEntityValidation.create
        );
        break;

      case 'procuring-entity-update':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          ProcuringEntityValidation.update
        );
        break;

      case 'notification':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          NotificationValidation.create
        );
        break;

      case 'bid-tracking':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          BidTrackingValidation.create
        );
        break;

      case 'bid-tracking-update':
        validationResult = await ValidationMiddleware.validateBody(
          request,
          BidTrackingValidation.update
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid validation type' },
          { status: 400 }
        );
    }

    if (validationResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Validation passed',
        data: validationResult.data
      });
    } else {
      const context = ErrorHandler.extractContext(request);
      const apiError = ErrorHandler.handleZodError(
        validationResult.errors!,
        context
      );
      return ErrorHandler.createErrorResponse(apiError);
    }

  } catch (error) {
    const context = ErrorHandler.extractContext(request);
    const apiError = ErrorHandler.handleUnknownError(error, context);
    return ErrorHandler.createErrorResponse(apiError);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Validation type is required' },
        { status: 400 }
      );
    }

    // Return validation schema information
    const schemaInfo = getSchemaInfo(type);
    
    if (!schemaInfo) {
      return NextResponse.json(
        { error: 'Invalid validation type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      schema: schemaInfo
    });

  } catch (error) {
    const context = ErrorHandler.extractContext(request);
    const apiError = ErrorHandler.handleUnknownError(error, context);
    return ErrorHandler.createErrorResponse(apiError);
  }
}

/**
 * Get schema information for validation types
 */
function getSchemaInfo(type: string): any {
  const schemas = {
    contract: {
      required: ['reference_number', 'title', 'category', 'procurement_method', 'submission_deadline', 'procuring_entity'],
      optional: ['short_description', 'estimated_value_min', 'estimated_value_max', 'bid_fee', 'bid_security_amount'],
      rules: {
        reference_number: 'Must be unique, alphanumeric with hyphens/slashes',
        title: 'Required, max 500 characters',
        category: 'Must be one of the predefined categories',
        submission_deadline: 'Must be a valid future date',
        estimated_value_min: 'Must be less than estimated_value_max'
      }
    },
    profile: {
      required: ['email', 'first_name', 'last_name', 'company_name', 'business_type'],
      optional: ['experience_years', 'team_size', 'max_contract_value', 'min_contract_value'],
      rules: {
        email: 'Must be a valid email format',
        first_name: 'Letters and spaces only, max 50 characters',
        company_name: 'Required, max 100 characters',
        business_type: 'Must be one of the predefined types'
      }
    },
    'procuring-entity': {
      required: ['entity_name', 'entity_type'],
      optional: ['contact_person', 'contact_email', 'contact_phone', 'website', 'address'],
      rules: {
        entity_name: 'Required, max 200 characters',
        entity_type: 'Must be one of the predefined types',
        contact_email: 'Must be a valid email format',
        contact_phone: 'Must be a valid Ugandan phone number'
      }
    },
    notification: {
      required: ['type', 'title', 'message'],
      optional: ['channel', 'priority', 'data'],
      rules: {
        type: 'Must be new_contract_match, deadline_reminder, or daily_digest',
        title: 'Required, max 200 characters',
        message: 'Required, max 1000 characters'
      }
    },
    'bid-tracking': {
      required: ['contract_id', 'tracking_active'],
      optional: ['email_alerts', 'whatsapp_alerts'],
      rules: {
        contract_id: 'Must be a valid UUID',
        tracking_active: 'Must be boolean'
      }
    }
  };

  return schemas[type as keyof typeof schemas] || null;
}
