# Uganda eGP Portal Scraper

A Python scraper for the Uganda Electronic Government Procurement (eGP) portal that extracts bid notices and exports them to CSV format for import into the BidFlow platform.

## 🎯 Features

- **Automated Login** - Uses provided credentials to access the portal
- **Multi-Category Scraping** - Scrapes Works, Supplies, Consultancy, and Non-Consultancy services
- **Detailed Data Extraction** - Extracts contract details including values, deadlines, and entities
- **CSV Export** - Exports data in format compatible with BidFlow import
- **Rate Limiting** - Respectful scraping with delays between requests
- **Error Handling** - Robust error handling and logging

## 📋 Prerequisites

- Python 3.7+
- pip (Python package installer)

## 🚀 Installation

1. **Clone or download the scraper files**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## 🔧 Configuration

The scraper is pre-configured with your credentials:
- **Email:** sebunyaronaldoo@gmail.com
- **Password:** zHE-YZNc%5S8EFD

## 📖 Usage

### Basic Usage
```bash
python egp_scraper.py
```

### Custom Usage
```python
from egp_scraper import EGPScraper

# Initialize scraper
scraper = EGPScraper("your_email@example.com", "your_password")

# Login
if scraper.login():
    # Scrape all categories
    contracts = scraper.get_bid_notices(category="all", max_pages=5)
    
    # Or scrape specific category
    # contracts = scraper.get_bid_notices(category="works", max_pages=3)
    
    # Export to CSV
    filename = scraper.export_to_csv(contracts)
    print(f"Exported to: {filename}")
```

## 📊 Output Format

The scraper exports a CSV file with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| reference_number | Contract reference ID | EGP-288161550 |
| title | Contract title | Supply and delivery of One Station Wagon Motor Vehicle |
| category | Contract category | Supplies |
| publish_date | Publication date | 2025-09-10 |
| procuring_entity | Government entity | Ministry of Health |
| estimated_value_min | Minimum estimated value | 50000000 |
| estimated_value_max | Maximum estimated value | 75000000 |
| currency | Currency code | UGX |
| submission_deadline | Bid submission deadline | 2025-10-15 |
| procurement_method | Procurement method | Open Domestic Bidding |
| status | Contract status | Open |
| competition_level | Competition level | medium |
| short_description | Contract description | Brief description of the contract |
| link | Original contract URL | https://egpuganda.go.ug/index/288161550%5Fegp |

## 🔄 Import to BidFlow

1. **Run the scraper** to generate CSV file
2. **Go to BidFlow Admin** → Contracts → Import
3. **Upload the generated CSV file**
4. **Review and confirm** the import

## ⚙️ Configuration Options

### Categories Available
- `"all"` - All categories
- `"works"` - Construction works
- `"supplies"` - Goods and supplies
- `"consultancy"` - Consultancy services
- `"non-consultancy"` - Non-consultancy services

### Rate Limiting
The scraper includes a 2-second delay between requests to be respectful to the server. You can adjust this in the code if needed.

## 🛠️ Troubleshooting

### Common Issues

1. **Login Failed**
   - Check credentials are correct
   - Verify the portal is accessible
   - Check for CAPTCHA requirements

2. **No Data Found**
   - The portal structure may have changed
   - Check if the selectors need updating
   - Verify the category parameter

3. **CSV Export Issues**
   - Ensure you have write permissions in the directory
   - Check if pandas is properly installed

### Debug Mode
Enable debug logging by modifying the logging level in the script:
```python
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
```

## 📝 Notes

- **Respectful Scraping**: The scraper includes delays to avoid overwhelming the server
- **Data Quality**: Some fields may be empty if not available on the portal
- **Updates**: The portal structure may change, requiring selector updates
- **Legal**: Ensure you have permission to scrape the portal data

## 🔄 Maintenance

The scraper may need updates if:
- The portal HTML structure changes
- New fields are added to contracts
- Login process changes
- Rate limiting requirements change

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Verify the portal is accessible manually
