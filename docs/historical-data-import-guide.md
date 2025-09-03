# Historical Data Import Guide

## Overview
The BidFlow platform supports importing historical contract award data from both CSV and Excel files. This guide explains the supported formats and how to prepare your data for import.

## Supported File Formats

### 1. CSV Files (.csv)
- **Format**: Comma-separated values
- **Encoding**: UTF-8 recommended
- **Headers**: First row must contain column headers
- **Delimiter**: Comma (,)

### 2. Excel Files (.xlsx, .xls)
- **Format**: Microsoft Excel spreadsheets
- **Sheets**: Data should be in the first sheet
- **Headers**: First row must contain column headers
- **Versions**: Excel 2007+ (.xlsx) and legacy (.xls)

## Required Column Structure

All files must contain the following columns (case-insensitive, spaces will be converted to underscores):

| Column Name | Description | Required | Example |
|-------------|-------------|----------|---------|
| **Provider** | Company name that won the contract | Yes | "ABC Construction Ltd" |
| **Female Owned** | Whether the company is female-owned | Yes | "Yes" or "No" |
| **Entity** | Procuring entity/agency | Yes | "Ministry of Works and Transport" |
| **Proc Reference No** | Contract reference number | Yes | "MOWT/WRKS/22-23/00084" |
| **Subject of Procurement** | Contract title/description | Yes | "Construction of Road Infrastructure" |
| **Contract Award Date** | Date when contract was awarded | Yes | "8 Jul 2024" |
| **Contract Amt (UGX)** | Contract value in Uganda Shillings | Yes | "454,982,630" |
| **Status** | Contract completion status | Yes | "Awarded", "completed", "ongoing" |

## Column Name Variations

The system automatically normalizes column names. These variations are all accepted:

### Provider
- `Provider`
- `Company`
- `Awardee`
- `Contractor`

### Female Owned
- `Female Owned`
- `Female Owned Entity`
- `Women Owned`
- `Female Owned Business`

### Proc Reference No
- `Proc Reference No`
- `Procurement Reference No`
- `Reference Number`
- `Contract Reference`
- `Procurement Reference`

### Subject of Procurement
- `Subject of Procurement`
- `Contract Title`
- `Description`
- `Project Title`

### Contract Award Date
- `Contract Award Date`
- `Award Date`
- `Contract Date`
- `Awarded Date`

### Contract Amt (UGX)
- `Contract Amt (UGX)`
- `Contract Amount`
- `Value`
- `Amount`

### Status
- `Status`
- `Contract Status`
- `Completion Status`
- `Project Status`

### Entity
- `Entity`
- `Procuring Entity`
- `Agency`
- `Ministry`

## Data Format Requirements

### Dates
- **Format**: YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY, or "DD MMM YYYY"
- **Examples**: "2024-01-15", "01/15/2024", "01-15-2024", "8 Jul 2024"

### Numbers
- **Currency**: Numbers with or without commas, no currency symbols
- **Examples**: "500000000" or "454,982,630" (not "UGX 500,000,000")

### Text Fields
- **Encoding**: UTF-8 recommended for special characters
- **Length**: No strict limits, but reasonable lengths recommended

## Sample Data

### CSV Format
```csv
Provider,Female Owned,Entity,Proc Reference No,Subject of Procurement,Contract Award Date,Contract Amt (UGX),Status
ABC Construction Ltd,No,Ministry of Works and Transport,MOWT/WRKS/22-23/00084,Construction of Road Infrastructure,8 Jul 2024,454982630,Awarded
XYZ Supplies Co,Yes,Ministry of Works and Transport,MOWT/WRKS/22-23/00085,Supply of Construction Materials,5 Jul 2024,590531000,Awarded
Tech Solutions Ltd,No,Ministry of Works and Transport,MOWT/WRKS/22-23/00086,IT Equipment and Services,5 Jul 2024,1268949580,Awarded
```

### Excel Format
Create an Excel file with the same structure as the CSV example above.

## Import Process

1. **Prepare Your Data**: Ensure your file follows the required structure
2. **Upload File**: Go to `/admin/historical/import`
3. **Select Fiscal Year**: Choose the appropriate fiscal year
4. **Specify Target Entity (Optional)**: 
   - If you want all contracts to belong to a specific entity (e.g., "Ministry of Works and Transport"), enter it here
   - If left empty, the system will use entity names from the Excel file
5. **Preview Data**: Review the data preview before importing
6. **Import**: Click "Import Data" to process the file

## Validation Rules

The system validates your data for:

- **Required Fields**: All required columns must be present
- **Data Types**: Dates must be valid, amounts must be numbers
- **Format**: Column names must match expected patterns
- **Content**: No empty required fields

## Error Handling

If validation fails, the system will:

1. **Show Errors**: Display specific error messages for each issue
2. **Highlight Problems**: Point to exact rows and fields with issues
3. **Allow Correction**: Let you fix the file and try again
4. **Partial Imports**: Import valid rows even if some have errors

## Best Practices

1. **Test with Small Files**: Start with a few rows to test the format
2. **Use Templates**: Download and use the provided template files
3. **Check Encoding**: Ensure UTF-8 encoding for special characters
4. **Validate Dates**: Use consistent date formats throughout
5. **Clean Data**: Remove extra spaces and formatting before import

## Troubleshooting

### Common Issues

**"Missing required columns"**
- Check that your column headers match the expected names
- Ensure the first row contains headers, not data

**"Invalid date format"**
- Use one of the supported date formats
- Check for extra spaces or characters

**"Invalid contract amount"**
- Remove currency symbols and commas
- Use only numbers (e.g., "500000000" not "UGX 500,000,000")

**"File parsing error"**
- For CSV: Check for proper comma separation
- For Excel: Ensure data is in the first sheet

### Getting Help

If you encounter issues:

1. Check this guide for common solutions
2. Use the sample templates as reference
3. Contact support with specific error messages
4. Provide a sample of your data (with sensitive information removed)

## Template Files

Sample template files are available at:
- CSV Template: `/public/government_historical_template.csv`
- Excel Template: Create manually using the CSV template as reference

## Data Processing

After successful import:

1. **Entity Resolution**: Companies and agencies are automatically matched or created
2. **Category Classification**: Contracts are categorized based on title keywords
3. **Data Enrichment**: Missing fields are filled with defaults where appropriate
4. **Audit Trail**: All imports are logged with success/failure rates

## Security Notes

- Only admin users can import historical data
- All import activities are logged
- Data is validated before processing
- No sensitive information should be included in import files
