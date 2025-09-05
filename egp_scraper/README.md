# EGP Uganda Portal Scraper

A Python scraper for extracting procurement contracts from the EGP Uganda portal, with enhanced CSV export capabilities for BidFlow platform compatibility.

## Features

- **Automatic Login**: Handles authentication to the EGP portal
- **Contract Extraction**: Scrapes bid notices and contract details
- **Data Cleaning**: Automatically cleans and validates contract data
- **CSV Export**: Exports data in BidFlow-compatible format
- **Line Ending Fixes**: Automatically fixes Windows/Unix line ending issues
- **Compatibility Testing**: Tests CSV files for web app import compatibility
- **Import Reports**: Generates detailed import reports

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

Run the scraper to fetch contracts and export them:

```bash
python egp_scraper.py
```

This will:
- Login to the EGP portal
- Scrape bid notices and contract details
- Export a web app ready CSV file
- Test CSV compatibility
- Generate an import report

### Programmatic Usage (For Agents)

```python
from egp_scraper import EGPScraper

# Initialize scraper
scraper = EGPScraper(email="your_email", password="your_password")

# Login
if scraper.login():
    # Get contracts
    contracts = scraper.get_bid_notices_from_page(include_details=True)
    
    # Export for web app (automatically fixes line endings)
    csv_file = scraper.export_to_csv_webapp_ready(contracts)
    
    # Test compatibility
    is_compatible = scraper.test_csv_compatibility(csv_file)
    
    # Create import report
    report_file = scraper.create_import_report(csv_file, contracts)
```

## CSV Compatibility Features

The scraper automatically ensures CSV files are compatible with the BidFlow platform:

### ✅ Automatic Line Ending Fixes
- Converts Windows line endings (CRLF) to Unix line endings (LF)
- Removes carriage returns (CR) that cause parsing issues
- Ensures consistent line endings across all platforms

### ✅ Data Cleaning
- Removes hidden characters and formatting issues
- Normalizes whitespace
- Handles NaN values and empty fields
- Validates required fields

### ✅ Web App Optimization
- Matches BidFlow import requirements exactly
- Includes all required fields
- Proper data types and formats
- UTF-8 encoding

### ✅ Quality Assurance
- Automatic compatibility testing
- Validation of exported data
- Detailed import reports
- Error logging and reporting

## Output Files

When you run the scraper, it creates:

1. **CSV File**: `egp_contracts_webapp_ready_YYYYMMDD_HHMMSS.csv`
   - Ready for immediate import into BidFlow platform
   - All line ending issues automatically fixed
   - Data cleaned and validated

2. **Import Report**: `egp_contracts_webapp_ready_YYYYMMDD_HHMMSS_import_report.txt`
   - Detailed information about the export
   - Import instructions
   - Troubleshooting tips

## API Methods

### Core Methods

- `login()` - Authenticate with the EGP portal
- `get_bid_notices_from_page()` - Scrape bid notices
- `export_to_csv_webapp_ready()` - Export optimized CSV for web app
- `test_csv_compatibility()` - Test CSV compatibility
- `create_import_report()` - Generate import report

### Data Processing

- `transform_for_webapp()` - Transform raw data to web app format
- `_clean_string()` - Clean string values
- `_clean_date()` - Clean and format dates
- `_extract_category_from_title()` - Extract category from title

## Troubleshooting

### Common Issues

1. **Line Ending Problems**
   - The scraper automatically fixes line endings during export
   - All exported files use Unix line endings (LF)

2. **Import Validation Errors**
   - Ensure you're using the latest version of the platform
   - Check that the CSV file wasn't modified after export
   - Verify the file encoding is UTF-8

3. **CSV Parsing Issues**
   - Use `test_csv_compatibility()` to test files
   - Check the import report for detailed information

### Getting Help

- Check the console output for detailed error messages
- Review the generated import report for troubleshooting tips
- Use the `test_csv_compatibility()` method to verify files

## Technical Details

### Line Ending Handling
- **Input**: Handles any line ending format (CR, LF, CRLF)
- **Processing**: Normalizes to Unix line endings (LF) during export
- **Output**: Ensures consistent LF line endings for maximum compatibility

### Data Validation
- Required fields: `reference_number`, `title`, `procuring_entity`
- Automatic cleaning of string values
- Handling of missing or invalid data
- Error reporting for problematic records

### Export Process
1. Transform raw data to web app format
2. Clean and validate all fields
3. Export with proper line endings
4. Verify compatibility
5. Generate import report

## Best Practices

1. **Always use the web app ready export** for BidFlow platform imports
2. **Test CSV compatibility** before attempting imports
3. **Keep original files** as backups
4. **Review import reports** for any warnings or issues
5. **Use programmatic methods** for automated workflows

## Support

For issues or questions:
1. Check the console output for error messages
2. Review the generated import report
3. Test CSV compatibility using the test method
4. Ensure you're using the latest version of the scraper

---

**Note**: This scraper is designed specifically for compatibility with the BidFlow platform. All exported CSV files are automatically optimized for successful imports without validation errors. The scraper is optimized for both manual use and programmatic integration with agents or automated systems.
