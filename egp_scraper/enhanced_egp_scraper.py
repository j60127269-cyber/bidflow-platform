#!/usr/bin/env python3
"""
Enhanced EGP Uganda Post-Award Contract Scraper with Fallback Mechanisms
Handles 500 errors with intelligent fallback data extraction
"""

import requests
import json
import csv
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import logging
from datetime import datetime
import os

# Configure logging with UTF-8 encoding
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('enhanced_egp_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EnhancedEGPPostAwardScraper:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.base_url = "https://egpuganda.go.ug"
        self.csrf_token = None
        self.contracts_data = []
        self.fallback_count = 0
        self.success_count = 0
        
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    def login(self):
        """Login to EGP Uganda portal"""
        try:
            logger.info("🔐 Attempting to login to EGP Uganda portal...")
            
            # Get login page to extract CSRF token
            login_url = f"{self.base_url}/login"
            response = self.session.get(login_url)
            response.raise_for_status()
            
            # Parse login page for CSRF token
            soup = BeautifulSoup(response.text, 'html.parser')
            csrf_input = soup.find('input', {'name': '_token'})
            if csrf_input:
                self.csrf_token = csrf_input.get('value')
                logger.info(f"✅ CSRF token extracted: {self.csrf_token[:20]}...")
            else:
                logger.warning("⚠️ No CSRF token found on login page")
            
            # Prepare login data
            login_data = {
                'email': self.username,
                'password': self.password,
                '_token': self.csrf_token
            }
            
            # Submit login form
            login_response = self.session.post(login_url, data=login_data)
            login_response.raise_for_status()
            
            # Check if login was successful
            if "dashboard" in login_response.url or "best-evaluated-bidders" in login_response.text:
                logger.info("✅ Login successful! Redirected to dashboard or BEB page")
                return True
            else:
                logger.error("❌ Login failed - no redirect to dashboard")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login failed: {str(e)}")
            return False

    def get_contracts_list(self):
        """Get list of contracts from Best Evaluated Bidders page using AJAX"""
        try:
            logger.info("📋 Fetching contracts list from Best Evaluated Bidders...")
            
            # Get the BEB page to extract CSRF token
            beb_url = f"{self.base_url}/best-evaluated-bidders"
            response = self.session.get(beb_url)
            response.raise_for_status()
            
            # Extract CSRF token from the page
            soup = BeautifulSoup(response.text, 'html.parser')
            csrf_input = soup.find('input', {'name': '_token'})
            if csrf_input:
                self.csrf_token = csrf_input.get('value')
                logger.info(f"✅ CSRF token updated: {self.csrf_token[:20]}...")
            else:
                logger.warning("⚠️ No CSRF token found on page")
                return []
            
            # Make AJAX request to get current BEBs
            ajax_url = f"{self.base_url}/best-evaluated-bidder-notice-reports/api-current-beds/ajax"
            
            # DataTables parameters for getting all records
            ajax_data = {
                'draw': 1,
                'start': 0,
                'length': 1000,  # Get up to 1000 records
                'search[value]': '',
                'search[regex]': False,
                'order[0][column]': 2,  # Order by published date
                'order[0][dir]': 'desc',
                'columns[0][data]': 'procurement_subject',
                'columns[0][name]': '',
                'columns[0][searchable]': True,
                'columns[0][orderable]': True,
                'columns[0][search][value]': '',
                'columns[0][search][regex]': False,
                'columns[1][data]': 'provider',
                'columns[1][name]': '',
                'columns[1][searchable]': True,
                'columns[1][orderable]': True,
                'columns[1][search][value]': '',
                'columns[1][search][regex]': False,
                'columns[2][data]': 'published_date',
                'columns[2][name]': '',
                'columns[2][searchable]': True,
                'columns[2][orderable]': True,
                'columns[2][search][value]': '',
                'columns[2][search][regex]': False,
                'columns[3][data]': 'contract_price',
                'columns[3][name]': '',
                'columns[3][searchable]': True,
                'columns[3][orderable]': True,
                'columns[3][search][value]': '',
                'columns[3][search][regex]': False,
                'columns[4][data]': 'status',
                'columns[4][name]': '',
                'columns[4][searchable]': True,
                'columns[4][orderable]': True,
                'columns[4][search][value]': '',
                'columns[4][search][regex]': False,
                'columns[5][data]': 'action',
                'columns[5][name]': '',
                'columns[5][searchable]': False,
                'columns[5][orderable]': False,
                'columns[5][search][value]': '',
                'columns[5][search][regex]': False,
                '_token': self.csrf_token
            }
            
            # Set headers for AJAX request
            ajax_headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': beb_url
            }
            
            # Make AJAX request
            ajax_response = self.session.post(ajax_url, data=ajax_data, headers=ajax_headers)
            ajax_response.raise_for_status()
            
            # Parse JSON response
            data = ajax_response.json()
            contracts = []
            
            if 'data' in data:
                for item in data['data']:
                    # Extract contract information
                    contract_info = {
                        'url': f"{self.base_url}/best-evaluated-bidder-notice-report/{item.get('id', '')}",
                        'subject': item.get('procurement_subject', ''),
                        'provider': item.get('provider', ''),
                        'published_date': item.get('published_date', ''),
                        'contract_price': item.get('contract_price', ''),
                        'status': item.get('status', '')
                    }
                    contracts.append(contract_info)
            
            logger.info(f"📊 Found {len(contracts)} contracts via AJAX")
            return contracts
            
        except Exception as e:
            logger.error(f"❌ Error fetching contracts list: {str(e)}")
            return []

    def clean_html(self, text):
        """Clean HTML tags from text"""
        if not text:
            return ""
        soup = BeautifulSoup(text, 'html.parser')
        return soup.get_text().strip()

    def clean_price(self, price_text):
        """Clean up price formatting"""
        if not price_text:
            return ""
        # Remove extra whitespace and newlines
        price = re.sub(r'\s+', ' ', price_text)
        return price.strip()

    def extract_reference_number(self, subject_text):
        """Extract reference number from subject text"""
        if not subject_text:
            return "N/A"
        # Look for pattern like "UNBS/SUPLS/2024-2025/00119"
        pattern = r'([A-Z]+/[A-Z]+/\d{4}-\d{4}/\d+)'
        match = re.search(pattern, subject_text)
        return match.group(1) if match else "N/A"

    def extract_contract_details_with_fallback(self, contract_url, contract_data=None):
        """Extract detailed information with fallback for 500 errors"""
        max_retries = 1
        
        for attempt in range(max_retries):
            try:
                logger.info(f"🔍 Extracting details from: {contract_url} (Attempt {attempt + 1})")
                
                response = self.session.get(contract_url, timeout=30)
                
                if response.status_code == 200:
                    # Success - extract full details
                    return self._extract_full_details(response.text, contract_url)
                elif response.status_code == 500:
                    logger.warning(f"⚠️ 500 Server Error for {contract_url} (Attempt {attempt + 1})")
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt  # Exponential backoff
                        logger.info(f"⏳ Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.warning(f"🔄 Max retries reached, using fallback data for {contract_url}")
                        return self._extract_fallback_data(contract_url, contract_data)
                else:
                    logger.error(f"❌ HTTP Error {response.status_code} for {contract_url}")
                    return self._extract_fallback_data(contract_url, contract_data)
                    
            except requests.exceptions.Timeout:
                logger.warning(f"⏰ Timeout for {contract_url} (Attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return self._extract_fallback_data(contract_url, contract_data)
            except Exception as e:
                logger.error(f"❌ Error extracting details from {contract_url}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return self._extract_fallback_data(contract_url, contract_data)
        
        return self._extract_fallback_data(contract_url, contract_data)

    def _extract_full_details(self, html_content, contract_url):
        """Extract full details from successful detail page"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Initialize contract data
        contract_data = {
            'contract_url': contract_url,
            'extraction_timestamp': datetime.now().isoformat(),
            'data_source': 'detail_page',
            'detail_extraction_failed': False
        }
        
        # Extract basic contract information from the main table
        main_table = soup.find('table', class_='table-bordered')
        if main_table:
            rows = main_table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True).lower()
                    value = cells[1].get_text(strip=True)
                    
                    if 'procurement entity' in label:
                        contract_data['procurement_entity'] = value
                    elif 'procurement reference number' in label:
                        contract_data['reference_number'] = value
                    elif 'subject of procurement' in label:
                        contract_data['subject'] = value
                    elif 'method of procurement' in label:
                        contract_data['method'] = value
                    elif 'name of best evaluated bidder' in label:
                        contract_data['successful_bidder'] = value
                    elif 'total contract price' in label:
                        contract_data['contract_price'] = value
                    elif 'date for display' in label:
                        contract_data['published_date'] = value
                    elif 'date for removal' in label:
                        contract_data['removal_date'] = value
        
        # Extract unsuccessful bidders
        unsuccessful_bidders = []
        unsuccessful_table = soup.find('h3', string='UNSUCCESSFUL BIDDERS')
        if unsuccessful_table:
            table = unsuccessful_table.find_next('table')
            if table:
                rows = table.find_all('tr')[1:]  # Skip header row
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 6:
                        bidder_data = {
                            'bidder_type': 'unsuccessful',
                            'bidder_name': cells[1].get_text(strip=True),
                            'bidder_price': cells[2].get_text(strip=True),
                            'bidder_rank': cells[3].get_text(strip=True),
                            'evaluation_stage': cells[4].get_text(strip=True),
                            'failure_reasons': cells[5].get_text(strip=True)
                        }
                        unsuccessful_bidders.append(bidder_data)
        
        # Extract authorization information
        auth_table = soup.find('h3', string=re.compile('AUTHORISED FOR DISPLAY'))
        if auth_table:
            auth_table_elem = auth_table.find_next('table')
            if auth_table_elem:
                auth_rows = auth_table_elem.find_all('tr')
                for row in auth_rows:
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        label = cells[0].get_text(strip=True).lower()
                        value = cells[1].get_text(strip=True)
                        
                        if 'published by' in label:
                            contract_data['published_by'] = value
                        elif 'published on' in label:
                            contract_data['published_on'] = value
                        elif 'signed by' in label:
                            contract_data['signed_by'] = value
        
        # Add successful bidder info
        if contract_data.get('successful_bidder'):
            successful_bidder = {
                'bidder_type': 'successful',
                'bidder_name': contract_data['successful_bidder'],
                'bidder_price': contract_data.get('contract_price', 'N/A'),
                'bidder_rank': '1',
                'evaluation_stage': 'Passed All Stages',
                'failure_reasons': 'N/A'
            }
            unsuccessful_bidders.insert(0, successful_bidder)
        
        contract_data['bidders'] = unsuccessful_bidders
        self.success_count += 1
        
        logger.info(f"✅ Successfully extracted full details for: {contract_data.get('subject', 'Unknown')}")
        return contract_data

    def _extract_fallback_data(self, contract_url, contract_data=None):
        """Extract fallback data when detail page fails"""
        logger.info(f"🔄 Using fallback data extraction for: {contract_url}")
        
        # If we have contract_data from main list, use it
        if contract_data:
            fallback_data = {
                'contract_url': contract_url,
                'extraction_timestamp': datetime.now().isoformat(),
                'data_source': 'main_list_fallback',
                'detail_extraction_failed': True,
                'subject': self.clean_html(contract_data.get('subject', '')),
                'reference_number': self.extract_reference_number(contract_data.get('subject', '')),
                'provider': self.clean_html(contract_data.get('provider', '')),
                'published_date': contract_data.get('published_date', ''),
                'contract_price': self.clean_price(contract_data.get('contract_price', '')),
                'status': self.clean_html(contract_data.get('status', '')),
                'procurement_entity': 'N/A',
                'method': 'N/A',
                'successful_bidder': self.clean_html(contract_data.get('provider', '')),
                'removal_date': 'N/A',
                'published_by': 'N/A',
                'published_on': 'N/A',
                'signed_by': 'N/A'
            }
            
            # Create basic bidder information
            bidders = []
            
            # Add successful bidder (from main list)
            if contract_data.get('provider'):
                successful_bidder = {
                    'bidder_type': 'successful',
                    'bidder_name': self.clean_html(contract_data.get('provider', '')),
                    'bidder_price': self.clean_price(contract_data.get('contract_price', '')),
                    'bidder_rank': '1',
                    'evaluation_stage': 'N/A',
                    'failure_reasons': 'N/A'
                }
                bidders.append(successful_bidder)
            
            # Try to extract additional bidder info from main list
            additional_bidders = self._extract_bidders_from_main_list(contract_data)
            bidders.extend(additional_bidders)
            
            fallback_data['bidders'] = bidders
            self.fallback_count += 1
            
            logger.info(f"✅ Fallback data extracted for: {fallback_data.get('subject', 'Unknown')}")
            return fallback_data
        
        # If no contract_data provided, create minimal fallback
        return {
            'contract_url': contract_url,
            'extraction_timestamp': datetime.now().isoformat(),
            'data_source': 'minimal_fallback',
            'detail_extraction_failed': True,
            'subject': 'N/A',
            'reference_number': 'N/A',
            'provider': 'N/A',
            'published_date': 'N/A',
            'contract_price': 'N/A',
            'status': 'N/A',
            'procurement_entity': 'N/A',
            'method': 'N/A',
            'successful_bidder': 'N/A',
            'removal_date': 'N/A',
            'published_by': 'N/A',
            'published_on': 'N/A',
            'signed_by': 'N/A',
            'bidders': [{
                'bidder_type': 'unknown',
                'bidder_name': 'N/A',
                'bidder_price': 'N/A',
                'bidder_rank': 'N/A',
                'evaluation_stage': 'N/A',
                'failure_reasons': 'N/A'
            }]
        }

    def _extract_bidders_from_main_list(self, contract_data):
        """Try to extract additional bidder information from main list"""
        bidders = []
        
        # Look for bidder count indicators in the data
        subject = contract_data.get('subject', '')
        provider = contract_data.get('provider', '')
        
        # Check if there are multiple bidders mentioned
        if 'bidders' in subject.lower() or 'bidders' in provider.lower():
            # Try to extract bidder names from text
            bidder_names = self._extract_bidder_names_from_text(subject + ' ' + provider)
            
            for i, name in enumerate(bidder_names):
                if i == 0:  # Skip first as it's usually the successful bidder
                    continue
                bidder = {
                    'bidder_type': 'unsuccessful',
                    'bidder_name': name,
                    'bidder_price': 'N/A',
                    'bidder_rank': str(i + 1),
                    'evaluation_stage': 'N/A',
                    'failure_reasons': 'N/A'
                }
                bidders.append(bidder)
        
        return bidders

    def _extract_bidder_names_from_text(self, text):
        """Extract potential bidder names from text"""
        # Simple pattern matching for company names
        # Look for patterns like "COMPANY NAME LTD" or "COMPANY NAME LIMITED"
        patterns = [
            r'([A-Z][A-Z\s&]+(?:LTD|LIMITED|CORP|CORPORATION|INC|INCORPORATED))',
            r'([A-Z][A-Z\s&]+(?:GROUP|SERVICES|SOLUTIONS|TECHNOLOGIES))'
        ]
        
        names = []
        for pattern in patterns:
            matches = re.findall(pattern, text)
            names.extend(matches)
        
        # Clean up names
        cleaned_names = []
        for name in names:
            name = name.strip()
            if len(name) > 5 and name not in cleaned_names:
                cleaned_names.append(name)
        
        return cleaned_names

    def scrape_all_contracts(self):
        """Main scraping function with enhanced error handling"""
        try:
            logger.info("🚀 Starting Enhanced EGP Uganda Post-Award Contract Scraping...")
            
            # Login first
            if not self.login():
                logger.error("❌ Login failed. Cannot proceed.")
                return False
            
            # Get contracts list
            contracts = self.get_contracts_list()
            if not contracts:
                logger.warning("⚠️ No contracts found")
                return False
            
            logger.info(f"📋 Processing {len(contracts)} contracts...")
            
            # Process each contract
            for i, contract in enumerate(contracts, 1):
                try:
                    logger.info(f"📄 Processing contract {i}/{len(contracts)}")
                    
                    # Extract details with fallback
                    contract_details = self.extract_contract_details_with_fallback(
                        contract['url'], 
                        contract
                    )
                    
                    if contract_details:
                        self.contracts_data.append(contract_details)
                        logger.info(f"✅ Contract {i} processed successfully")
                    else:
                        logger.warning(f"⚠️ Failed to process contract {i}")
                    
                    # Add delay to be respectful to the server
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"❌ Error processing contract {i}: {str(e)}")
                    continue
            
            # Save to CSV
            self.save_to_csv()
            
            # Print summary
            logger.info(f"🎉 Scraping completed!")
            logger.info(f"📊 Total contracts processed: {len(self.contracts_data)}")
            logger.info(f"✅ Successful extractions: {self.success_count}")
            logger.info(f"🔄 Fallback extractions: {self.fallback_count}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Scraping failed: {str(e)}")
            return False

    def save_to_csv(self):
        """Save extracted data to CSV file"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"enhanced_egp_post_award_contracts_{timestamp}.csv"
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'subject', 'provider', 'published_date', 'contract_price', 'status',
                    'contract_url', 'procurement_entity', 'reference_number', 'method',
                    'successful_bidder', 'removal_date', 'published_by', 'published_on',
                    'signed_by', 'extraction_timestamp', 'data_source', 'detail_extraction_failed',
                    'bidder_type', 'bidder_name', 'bidder_price', 'bidder_rank',
                    'evaluation_stage', 'failure_reasons'
                ]
                
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for contract in self.contracts_data:
                    # Write contract info
                    base_row = {
                        'subject': contract.get('subject', ''),
                        'provider': contract.get('provider', ''),
                        'published_date': contract.get('published_date', ''),
                        'contract_price': contract.get('contract_price', ''),
                        'status': contract.get('status', ''),
                        'contract_url': contract.get('contract_url', ''),
                        'procurement_entity': contract.get('procurement_entity', ''),
                        'reference_number': contract.get('reference_number', ''),
                        'method': contract.get('method', ''),
                        'successful_bidder': contract.get('successful_bidder', ''),
                        'removal_date': contract.get('removal_date', ''),
                        'published_by': contract.get('published_by', ''),
                        'published_on': contract.get('published_on', ''),
                        'signed_by': contract.get('signed_by', ''),
                        'extraction_timestamp': contract.get('extraction_timestamp', ''),
                        'data_source': contract.get('data_source', ''),
                        'detail_extraction_failed': contract.get('detail_extraction_failed', False)
                    }
                    
                    # Write bidder information
                    bidders = contract.get('bidders', [])
                    if bidders:
                        for bidder in bidders:
                            row = {**base_row, **bidder}
                            writer.writerow(row)
                    else:
                        # No bidder info, write base row with empty bidder fields
                        row = {**base_row, **{
                            'bidder_type': 'unknown',
                            'bidder_name': 'N/A',
                            'bidder_price': 'N/A',
                            'bidder_rank': 'N/A',
                            'evaluation_stage': 'N/A',
                            'failure_reasons': 'N/A'
                        }}
                        writer.writerow(row)
            
            logger.info(f"💾 Data saved to: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"❌ Error saving CSV: {str(e)}")
            return None

def main():
    """Main function to run the enhanced scraper"""
    username = "sebunyaronaldoo@gmail.com"
    password = "%#gFF7L*DcuxRF6"
    
    logger.info("🚀 Starting Enhanced EGP Post-Award Contract Scraper...")
    scraper = EnhancedEGPPostAwardScraper(username, password)
    
    if scraper.login():
        logger.info("✅ Successfully logged in.")
        if scraper.scrape_all_contracts():
            logger.info("🎉 Enhanced scraping complete!")
        else:
            logger.error("❌ Enhanced scraping failed.")
    else:
        logger.error("❌ Login failed. Please check credentials and try again.")

if __name__ == "__main__":
    main()
