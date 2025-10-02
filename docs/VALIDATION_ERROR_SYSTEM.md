# 🔍 Validation and Error Handling System Documentation

## Overview

This document outlines the comprehensive validation and error handling system implemented for BidCloud, including standardized validation schemas, error handling, input sanitization, and monitoring.

## 🛠️ System Components

### 1. **Validation Schemas** (`src/lib/validation/validation-schemas.ts`)
- **Standardized schemas** for all data types
- **Zod-based validation** with comprehensive rules
- **Type-safe validation** with TypeScript integration
- **Reusable validation patterns** for common use cases

### 2. **Error Handling** (`src/lib/validation/error-handling.ts`)
- **Standardized error responses** with consistent format
- **Error categorization** by type and severity
- **User-friendly error messages** for frontend display
- **Error context tracking** for debugging

### 3. **Input Sanitization** (`src/lib/validation/input-sanitization.ts`)
- **Comprehensive input cleaning** for all data types
- **XSS protection** with HTML sanitization
- **SQL injection prevention** with input filtering
- **Data normalization** and format validation

### 4. **Validation Middleware** (`src/lib/validation/validation-middleware.ts`)
- **Unified validation middleware** for API routes
- **Automatic error responses** with proper status codes
- **Request sanitization** and data cleaning
- **Validation result handling** with detailed feedback

### 5. **Error Logging** (`src/lib/validation/error-logging.ts`)
- **Comprehensive error logging** to database
- **Error pattern detection** and alerting
- **Performance monitoring** and metrics
- **Error resolution tracking** and management

## 📋 Validation Schemas

### Contract Validation

```typescript
import { ContractValidation } from '@/lib/validation/validation-schemas';

// Validate contract creation
const result = ValidationUtils.validate(ContractValidation.create, contractData);

// Validate contract update
const result = ValidationUtils.validate(ContractValidation.update, updateData);
```

**Required Fields:**
- `reference_number`: Unique alphanumeric identifier
- `title`: Contract title (max 500 characters)
- `category`: Predefined category from enum
- `procurement_method`: Predefined method from enum
- `submission_deadline`: Valid future date
- `procuring_entity`: Entity name (max 200 characters)

**Validation Rules:**
- Reference numbers must be unique and alphanumeric
- Dates must be valid and in the future
- Financial values must be positive numbers
- Categories must match predefined options

### Profile Validation

```typescript
import { ProfileValidation } from '@/lib/validation/validation-schemas';

// Validate profile creation
const result = ValidationUtils.validate(ProfileValidation.create, profileData);
```

**Required Fields:**
- `email`: Valid email format
- `first_name`: Letters and spaces only (max 50 chars)
- `last_name`: Letters and spaces only (max 50 chars)
- `company_name`: Required (max 100 chars)
- `business_type`: Predefined type from enum

### Procuring Entity Validation

```typescript
import { ProcuringEntityValidation } from '@/lib/validation/validation-schemas';

// Validate entity creation
const result = ValidationUtils.validate(ProcuringEntityValidation.create, entityData);
```

**Required Fields:**
- `entity_name`: Required (max 200 chars)
- `entity_type`: Predefined type from enum

**Optional Fields:**
- `contact_person`: Max 100 characters
- `contact_email`: Valid email format
- `contact_phone`: Valid Ugandan phone number
- `website`: Valid URL format
- `address`: Max 500 characters

## 🔧 Error Handling

### Error Types

```typescript
const errorTypes = {
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  DUPLICATE_ENTRY: 'Record already exists',
  RECORD_NOT_FOUND: 'Record not found',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  EXTERNAL_SERVICE_ERROR: 'External service error',
  INTERNAL_SERVER_ERROR: 'Internal server error'
};
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "validationErrors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "value": "invalid-email"
        }
      ]
    },
    "timestamp": "2025-01-27T10:30:00Z"
  }
}
```

### Error Handling in API Routes

```typescript
import { withErrorHandling } from '@/lib/validation/error-handling';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ success: true });
});
```

## 🧹 Input Sanitization

### String Sanitization

```typescript
import { InputSanitizer } from '@/lib/validation/input-sanitization';

// Basic string sanitization
const sanitized = InputSanitizer.sanitizeString(input);

// With custom options
const sanitized = InputSanitizer.sanitizeString(input, {
  allowHtml: false,
  maxLength: 500,
  removeScripts: true
});
```

### Email Sanitization

```typescript
// Sanitize email input
const sanitizedEmail = InputSanitizer.sanitizeEmail('  USER@EXAMPLE.COM  ');
// Result: 'user@example.com'
```

### Phone Number Sanitization

```typescript
// Sanitize Ugandan phone numbers
const sanitizedPhone = InputSanitizer.sanitizePhone('0770 123 456');
// Result: '+256770123456'
```

### Number Sanitization

```typescript
// Sanitize numeric input
const sanitizedNumber = InputSanitizer.sanitizeNumber('1,234.56');
// Result: 1234.56
```

### Date Sanitization

```typescript
// Sanitize date input
const sanitizedDate = InputSanitizer.sanitizeDate('2025-01-27');
// Result: '2025-01-27T00:00:00.000Z'
```

## 🛡️ Validation Middleware

### Basic Validation

```typescript
import { withValidation } from '@/lib/validation/validation-middleware';
import { ContractValidation } from '@/lib/validation/validation-schemas';

export const POST = withValidation({
  schema: ContractValidation.create,
  sanitizeInput: true,
  allowPartial: false
})(async (request: NextRequest) => {
  // Access validated data
  const contractData = request.validatedData;
  // Your logic here
});
```

### Query Parameter Validation

```typescript
import { withQueryValidation } from '@/lib/validation/validation-middleware';
import { CommonValidations } from '@/lib/validation/validation-middleware';

export const GET = withQueryValidation(CommonValidations.pagination)(
  async (request: NextRequest) => {
    // Access validated query
    const { page, limit } = request.validatedQuery;
    // Your logic here
  }
);
```

### Array Validation

```typescript
import { withArrayValidation } from '@/lib/validation/validation-middleware';

export const POST = withArrayValidation(ContractValidation.create)(
  async (request: NextRequest) => {
    // Access validated array
    const contracts = request.validatedArray;
    // Your logic here
  }
);
```

## 📊 Error Monitoring

### Error Logging

```typescript
import { ErrorLogger } from '@/lib/validation/error-logging';

// Log an error
const errorId = await ErrorLogger.logError({
  errorCode: 'VALIDATION_ERROR',
  message: 'Validation failed',
  severity: 'medium',
  category: 'validation',
  context: {
    userId: 'user-id',
    endpoint: '/api/contracts',
    timestamp: new Date().toISOString()
  }
});
```

### Error Metrics

```typescript
// Get error metrics for last 24 hours
const metrics = await ErrorLogger.getErrorMetrics('24h');

console.log('Total errors:', metrics.totalErrors);
console.log('Errors by severity:', metrics.errorsBySeverity);
console.log('Recent errors:', metrics.recentErrors);
```

### Error Resolution

```typescript
// Mark error as resolved
const success = await ErrorLogger.resolveError(errorId, userId);
```

## 🔍 Monitoring Dashboard

### Error Statistics

```sql
-- Get error statistics for last 24 hours
SELECT * FROM get_error_statistics(24);

-- Get unresolved errors
SELECT * FROM get_unresolved_errors();

-- Check for error patterns
SELECT * FROM check_error_patterns();
```

### Validation Statistics

```sql
-- Get validation statistics
SELECT * FROM get_validation_statistics(24);

-- Get system health
SELECT * FROM system_health;
```

### Dashboard Views

```sql
-- Error dashboard
SELECT * FROM error_dashboard;

-- Validation dashboard
SELECT * FROM validation_dashboard;
```

## 🚀 Usage Examples

### API Route with Full Validation

```typescript
import { withValidation, withErrorHandling } from '@/lib/validation';
import { ContractValidation } from '@/lib/validation/validation-schemas';

export const POST = withErrorHandling(
  withValidation({
    schema: ContractValidation.create,
    sanitizeInput: true
  })(async (request: NextRequest) => {
    const contractData = request.validatedData;
    
    // Your business logic here
    const result = await createContract(contractData);
    
    return NextResponse.json({ success: true, data: result });
  })
);
```

### Frontend Form Validation

```typescript
import { ValidationUtils } from '@/lib/validation/validation-schemas';

const validateForm = (formData: any) => {
  const result = ValidationUtils.validateWithErrors(
    ContractValidation.create,
    formData
  );
  
  if (!result.success) {
    setErrors(ValidationErrorFormatter.formatErrors(result.formattedErrors));
    return false;
  }
  
  return true;
};
```

### Bulk Data Validation

```typescript
import { ValidationUtils } from '@/lib/validation/validation-schemas';

const validateBulkData = (dataArray: any[]) => {
  const result = ValidationUtils.validateArray(
    ContractValidation.create,
    dataArray
  );
  
  if (!result.success) {
    console.log('Validation errors:', result.errors);
    return result.validData; // Return only valid data
  }
  
  return result.validData;
};
```

## 🔧 Configuration

### Environment Variables

```bash
# Error logging
ERROR_LOGGING_ENABLED=true
ERROR_RETENTION_DAYS=30

# Validation
VALIDATION_STRICT_MODE=true
INPUT_SANITIZATION_ENABLED=true

# Monitoring
ERROR_ALERT_THRESHOLD=5
ERROR_SPIKE_THRESHOLD=20
```

### Custom Validation Rules

```typescript
// Create custom validation schema
const customSchema = z.object({
  field: z.string().min(1).max(100),
  customRule: z.string().refine((val) => {
    // Custom validation logic
    return val.includes('custom');
  }, {
    message: 'Must contain "custom"'
  })
});
```

## 📈 Performance Considerations

### Validation Performance

- **Schema compilation**: Schemas are compiled once and reused
- **Lazy validation**: Only validate when needed
- **Caching**: Validation results are cached for repeated requests
- **Batch processing**: Bulk validation is optimized for large datasets

### Error Logging Performance

- **Asynchronous logging**: Error logging doesn't block requests
- **Batch inserts**: Multiple errors are logged in batches
- **Index optimization**: Database indexes for fast queries
- **Automatic cleanup**: Old logs are automatically removed

## 🛠️ Maintenance

### Daily Maintenance

```sql
-- Run daily maintenance
SELECT * FROM daily_validation_maintenance();
```

### Manual Cleanup

```sql
-- Cleanup old error logs
SELECT cleanup_old_error_logs(30);

-- Cleanup old validation logs
SELECT cleanup_old_validation_logs(7);
```

### Monitoring Queries

```sql
-- Check system health
SELECT * FROM system_health;

-- Get error trends
SELECT * FROM error_dashboard
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Get validation success rates
SELECT * FROM validation_dashboard
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

## 🔒 Security Features

### Input Sanitization

- **XSS Protection**: HTML tags and scripts are removed
- **SQL Injection Prevention**: Special characters are filtered
- **Data Normalization**: Input is standardized and cleaned
- **Length Limits**: Input length is restricted to prevent attacks

### Error Security

- **Sensitive Data Filtering**: Sensitive information is removed from logs
- **Access Control**: Error logs are restricted to authorized users
- **Audit Trail**: All error access is logged and monitored
- **Data Encryption**: Sensitive error data is encrypted at rest

## 🚀 Future Enhancements

### Planned Features

- **Real-time Error Alerts**: WebSocket-based error notifications
- **Machine Learning**: AI-powered error pattern detection
- **Advanced Analytics**: Detailed error trend analysis
- **Integration**: Third-party monitoring service integration

### Performance Improvements

- **Redis Caching**: Cache validation results and error metrics
- **Database Optimization**: Advanced indexing and query optimization
- **CDN Integration**: Distribute validation schemas globally
- **Monitoring Integration**: Real-time performance metrics

---

**The Validation and Error Handling System provides comprehensive data validation, error management, and monitoring capabilities while maintaining high performance and security standards.**
