# CSV Import Guide for BidFlow

## Overview

The CSV import feature allows administrators to bulk import contracts into the BidFlow platform. This feature is designed to handle large volumes of contract data efficiently while maintaining data integrity and validation.

## Accessing the Import Feature

1. Navigate to the Admin Dashboard
2. Go to **Contracts** section
3. Click the **"Import CSV"** button in the top right corner

## CSV Template

### Download Template
- Click the **"Download Template"** button on the import page
- This will download a sample CSV file with the correct column headers and example data

### Required Columns

| Column Name | Required | Type | Description | Example |
|-------------|----------|------|-------------|---------|
| `reference_number` | ✅ | Text | Unique contract reference number | `URSB/SUPLS/2025-2026/00011` |
| `title` | ✅ | Text | Contract title | `Laptops & Accessories` |
| `short_description` | ❌ | Text | Brief description | `Supply of laptops and accessories` |
| `category` | ✅ | Text | Contract category | `supplies`, `services`, `works` |
| `procurement_method` | ✅ | Text | Procurement method | `open domestic bidding` |
| `estimated_value_min` | ❌ | Number | Minimum estimated value | `668000000` |
| `estimated_value_max` | ❌ | Number | Maximum estimated value | `1000000000` |
| `currency` | ❌ | Text | Currency code | `UGX` |
| `bid_fee` | ❌ | Number | Bid fee amount | `100000` |
| `bid_security_amount` | ❌ | Number | Bid security amount | `13760000` |
| `bid_security_type` | ❌ | Text | Type of bid security | `bank guarantee` |
| `margin_of_preference` | ❌ | Boolean | Whether margin of preference applies | `false` |
| `competition_level` | ❌ | Text | Competition level | `low`, `medium`, `high`, `very_high` |
| `publish_date` | ❌ | Date | Publication date | `2025-08-01` |
| `pre_bid_meeting_date` | ❌ | Date | Pre-bid meeting date | `2025-08-25` |
| `site_visit_date` | ❌ | Date | Site visit date | `2025-08-30` |
| `submission_deadline` | ✅ | Date | Submission deadline | `2025-08-28` |
| `bid_opening_date` | ❌ | Date | Bid opening date | `2025-09-20` |
| `procuring_entity` | ✅ | Text | Procuring entity name | `Uganda Registration Services Bureau` |
| `contact_person` | ❌ | Text | Contact person name | `MUSTAPHER NTALE` |
| `contact_position` | ❌ | Text | Contact person position | `ACCOUNTING OFFICER` |
| `evaluation_methodology` | ❌ | Text | Evaluation methodology | `Within 20 working days from bid closing date` |
| `requires_registration` | ❌ | Boolean | Requires registration | `true` |
| `requires_trading_license` | ❌ | Boolean | Requires trading license | `true` |
| `requires_tax_clearance` | ❌ | Boolean | Requires tax clearance | `true` |
| `requires_nssf_clearance` | ❌ | Boolean | Requires NSSF clearance | `true` |
| `requires_manufacturer_auth` | ❌ | Boolean | Requires manufacturer authorization | `false` |
| `submission_method` | ❌ | Text | Submission method | `online`, `physical` |
| `submission_format` | ❌ | Text | Submission format | `electronic submission` |
| `required_documents` | ❌ | Text | Comma-separated list of required documents | `Registration/Incorporation,Trading License,Tax Clearance Certificate` |
| `required_forms` | ❌ | Text | Comma-separated list of required forms | `Bid Submission Sheet,Price Schedule,Code of Ethical Conduct` |
| `status` | ❌ | Text | Contract status | `open`, `closed`, `awarded`, `cancelled` |
| `current_stage` | ❌ | Text | Current stage | `published`, `pre-bid meeting`, `submission`, `evaluation` |
| `award_information` | ❌ | Text | Award information | `Awarded to ABC Company` |

## Data Format Guidelines

### Text Fields
- Use plain text without special formatting
- Avoid quotes unless necessary for CSV parsing
- Maximum length: 255 characters for most fields

### Number Fields
- Use whole numbers (no decimals unless necessary)
- No currency symbols or commas
- Examples: `668000000`, `100000`

### Boolean Fields
- Use `true` or `false` (case insensitive)
- Alternative: `1` for true, `0` for false
- Examples: `true`, `false`, `1`, `0`

### Date Fields
- Use ISO format: `YYYY-MM-DD`
- Examples: `2025-08-01`, `2025-12-31`

### List Fields (required_documents, required_forms)
- Use comma-separated values
- No spaces around commas
- Examples: `Document1,Document2,Document3`

## Validation Rules

### Required Fields
The following fields are mandatory and must be provided:
- `reference_number`
- `title`
- `category`
- `procurement_method`
- `submission_deadline`
- `procuring_entity`

### Validation Checks
1. **Reference Number Uniqueness**: Each reference number must be unique
2. **Date Format**: All dates must be in YYYY-MM-DD format
3. **Number Format**: Numeric fields must contain valid numbers
4. **Boolean Format**: Boolean fields must be true/false, 1/0, or empty
5. **Competition Level**: Must be one of: low, medium, high, very_high

## Import Process

### Step 1: Prepare Your CSV File
1. Use the provided template as a starting point
2. Fill in your contract data following the format guidelines
3. Save the file as a CSV format

### Step 2: Upload and Validate
1. Click **"Choose File"** and select your CSV file
2. The system will automatically parse and validate the data
3. Review any validation errors displayed

### Step 3: Preview and Import
1. Review the preview table showing your data
2. Fix any validation errors if present
3. Click **"Import Contracts"** to proceed

### Step 4: Confirmation
1. The system will display import results
2. Successfully imported contracts will be available in the contracts list
3. Any failed imports will show specific error messages

## Error Handling

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Reference number is required` | Missing reference number | Add a unique reference number |
| `Invalid date format` | Incorrect date format | Use YYYY-MM-DD format |
| `Duplicate reference numbers` | Same reference number used multiple times | Ensure each reference number is unique |
| `Reference numbers already exist` | Reference number already in database | Use different reference numbers |

### Import Results
The system provides detailed feedback:
- **Success Count**: Number of contracts successfully imported
- **Failed Count**: Number of contracts that failed to import
- **Error Details**: Specific error messages for failed imports

## Best Practices

### Data Preparation
1. **Use the template**: Always start with the provided template
2. **Test with small batches**: Import a few contracts first to test the format
3. **Validate data**: Double-check all required fields and formats
4. **Backup data**: Keep a backup of your original data

### File Management
1. **Use descriptive filenames**: Include date and purpose in filename
2. **Check file size**: Large files may take longer to process
3. **Use UTF-8 encoding**: Ensure proper character encoding

### Quality Assurance
1. **Review preview data**: Always check the preview before importing
2. **Verify imported data**: Check the contracts list after import
3. **Handle errors promptly**: Fix and re-import failed records

## Troubleshooting

### File Upload Issues
- **File not selected**: Ensure you've selected a CSV file
- **Invalid file type**: Only CSV files are accepted
- **File too large**: Split large files into smaller batches

### Parsing Issues
- **Encoding problems**: Save file as UTF-8
- **Delimiter issues**: Use standard comma delimiters
- **Quote problems**: Avoid unnecessary quotes in text fields

### Import Failures
- **Database errors**: Check for duplicate reference numbers
- **Validation errors**: Review and fix validation messages
- **System errors**: Try importing smaller batches

## Support

If you encounter issues with the CSV import feature:
1. Check this guide for common solutions
2. Verify your CSV format matches the template
3. Contact the system administrator for technical support

## Example CSV Data

```csv
reference_number,title,short_description,category,procurement_method,estimated_value_min,estimated_value_max,currency,bid_fee,bid_security_amount,bid_security_type,margin_of_preference,competition_level,publish_date,submission_deadline,procuring_entity,contact_person,contact_position,status,current_stage
URSB/SUPLS/2025-2026/00011,Laptops & Accessories,Supply of laptops and accessories,supplies,open domestic bidding,668000000,1000000000,UGX,100000,13760000,bank guarantee,false,medium,2025-08-01,2025-08-28,Uganda Registration Services Bureau,MUSTAPHER NTALE,ACCOUNTING OFFICER,open,published
MOH/SUPLS/2025-2026/00012,Medical Equipment,Supply of medical equipment,supplies,open domestic bidding,50000000,75000000,UGX,50000,2500000,bank guarantee,false,high,2025-08-15,2025-09-15,Ministry of Health,DR. SARAH NAKIMERA,PROCUREMENT OFFICER,open,published
```

This example shows the minimum required fields for a successful import.
