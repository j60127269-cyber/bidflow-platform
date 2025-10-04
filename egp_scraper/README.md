# EGP Uganda Post-Award Contract Scraper

This Python script scrapes post-award contract information from the EGP Uganda portal, including Best Evaluated Bidders and detailed contract information.

## Features

- **Authentication**: Logs into EGP Uganda portal using your credentials
- **Contract List**: Fetches all current Best Evaluated Bidders contracts
- **Detail Extraction**: Follows "View Details" links to get comprehensive contract information
- **Data Collection**: Extracts both successful and unsuccessful bidder information
- **CSV Export**: Saves all data to a structured CSV file

## Data Extracted

### Basic Contract Information
- Subject of Procurement
- Provider (Successful Bidder)
- Published Date
- Contract Price
- Status

### Detailed Contract Information
- Procurement Entity
- Reference Number
- Method of Procurement
- Dates (Display, Removal)
- Authorization Details

### Bidder Information
- **Successful Bidder**: Name, Price, Status
- **Unsuccessful Bidders**: Name, Price, Rank, Failure Reasons

## Installation

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Make the script executable:**
   ```bash
   chmod +x egp_post_award_scraper.py
   ```

## Usage

### Method 1: Interactive Mode
```bash
python egp_post_award_scraper.py
```

### Method 2: Using the run script
```bash
python run_scraper.py
```

### Method 3: Environment Variables
```bash
export EGP_USERNAME="your_email@example.com"
export EGP_PASSWORD="your_password"
python run_scraper.py
```

## Output

The script generates:
- **CSV File**: `egp_post_award_contracts_YYYYMMDD_HHMMSS.csv`
- **Log File**: `egp_post_award_scraper.log`

### CSV Structure

The CSV contains the following columns:
- `subject`: Contract subject
- `provider`: Successful bidder name
- `published_date`: Publication date
- `contract_price`: Contract value
- `status`: Contract status
- `contract_url`: Link to detailed contract page
- `procurement_entity`: Government entity
- `reference_number`: Contract reference
- `method`: Procurement method
- `successful_bidder`: Winning company
- `removal_date`: Date for removal
- `published_by`: Published by
- `published_on`: Published on date
- `signed_by`: Signed by
- `extraction_timestamp`: When data was extracted
- `bidder_type`: 'successful_only' or 'unsuccessful'
- `bidder_name`: Bidder company name
- `bidder_price`: Bidder's price
- `bidder_rank`: Bidder's rank
- `evaluation_stage`: Stage where bid failed
- `failure_reasons`: Reasons for failure

## Features

- **Rate Limiting**: 2-second delay between requests to avoid overwhelming the server
- **Error Handling**: Continues processing even if some contracts fail
- **Comprehensive Logging**: Detailed logs for debugging
- **CSRF Protection**: Handles CSRF tokens for secure requests
- **Session Management**: Maintains login session throughout scraping

## Troubleshooting

### Common Issues

1. **Login Failed**
   - Verify your credentials are correct
   - Check if your account is active
   - Ensure you have access to the Best Evaluated Bidders section

2. **No Contracts Found**
   - The portal might be empty
   - Check if you're logged in correctly
   - Verify the AJAX endpoints are accessible

3. **Detail Extraction Failed**
   - Some contracts might have restricted access
   - The "View Details" link might be broken
   - Basic contract info will still be saved

### Logs

Check the `egp_post_award_scraper.log` file for detailed information about the scraping process.

## Security Notes

- Credentials are only used for authentication
- No data is stored permanently except in the CSV output
- Session cookies are cleared after scraping
- CSRF tokens are handled securely

## Example Output

```csv
subject,provider,published_date,contract_price,status,bidder_type,bidder_name,bidder_price,failure_reasons
"Supply of Morning Bites, Lunch and Meals during Meetings on Framework Contract","MY MAKA GROUP LIMITED","01-09-2025","UGX :67,260.00 /= V.A.T Inclusive","Completed","successful_only","","",""
"Supply of Morning Bites, Lunch and Meals during Meetings on Framework Contract","MY MAKA GROUP LIMITED","01-09-2025","UGX :67,260.00 /= V.A.T Inclusive","Completed","unsuccessful","CRYSTAL SUITES & APARTMENTS LIMITED","85,720.03","Did not buy required standards and the Audited books of Accounts was not signed"
```

## License

This script is for educational and research purposes only. Please respect the EGP Uganda portal's terms of service and rate limits.