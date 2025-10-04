#!/usr/bin/env python3
"""
EGP Uganda Post-Award Contract Scraper
Scrapes Best Evaluated Bidders and detailed contract information
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('egp_post_award_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EGPPostAwardScraper:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.base_url = "https://egpuganda.go.ug"
        self.csrf_token = None
        self.contracts_data = []
        
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

    def get_csrf_token_from_page(self, url):
        """Extract CSRF token from a specific page"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            csrf_input = soup.find('input', {'name': '_token'})
            if csrf_input:
                self.csrf_token = csrf_input.get('value')
                logger.info(f"✅ CSRF token updated: {self.csrf_token[:20]}...")
                return self.csrf_token
            else:
                logger.warning("⚠️ No CSRF token found on page")
                return None
        except Exception as e:
            logger.error(f"❌ Failed to get CSRF token: {str(e)}")
            return None

    def get_contracts_list(self):
        """Get list of contracts from Best Evaluated Bidders page"""
        try:
            logger.info("📋 Fetching contracts list from Best Evaluated Bidders...")
            
            # Get the BEB page to extract CSRF token
            beb_url = f"{self.base_url}/best-evaluated-bidders"
            response = self.session.get(beb_url)
            response.raise_for_status()
            
            # Extract CSRF token from the page
            self.get_csrf_token_from_page(beb_url)
            
            if not self.csrf_token:
                logger.error("❌ No CSRF token available")
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
                'columns[1][data]': 'provider',
                'columns[1][name]': '',
                'columns[1][searchable]': True,
                'columns[1][orderable]': True,
                'columns[2][data]': 'published_date',
                'columns[2][name]': '',
                'columns[2][searchable]': True,
                'columns[2][orderable]': True,
                'columns[3][data]': 'contract_price',
                'columns[3][name]': '',
                'columns[3][searchable]': True,
                'columns[3][orderable]': True,
                'columns[4][data]': 'status_state',
                'columns[4][name]': '',
                'columns[4][searchable]': True,
                'columns[4][orderable]': True,
                'columns[5][data]': 'action_links',
                'columns[5][name]': '',
                'columns[5][searchable]': False,
                'columns[5][orderable]': False,
                '_token': self.csrf_token
            }
            
            # Set headers for AJAX request
            ajax_headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': beb_url
            }
            
            response = self.session.post(ajax_url, data=ajax_data, headers=ajax_headers)
            response.raise_for_status()
            
            # Parse JSON response
            data = response.json()
            
            if 'data' in data:
                contracts = data['data']
                logger.info(f"✅ Found {len(contracts)} contracts")
                return contracts
            else:
                logger.warning("⚠️ No data found in AJAX response")
                return []
                
        except Exception as e:
            logger.error(f"❌ Failed to get contracts list: {str(e)}")
            return []

    def extract_contract_details(self, contract_url):
        """Extract detailed information from a contract page"""
        try:
            logger.info(f"🔍 Extracting details from: {contract_url}")
            
            response = self.session.get(contract_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Initialize contract data
            contract_data = {
                'contract_url': contract_url,
                'extraction_timestamp': datetime.now().isoformat()
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
                # Find the table after the heading
                table = unsuccessful_table.find_next('table')
                if table:
                    rows = table.find_all('tr')[1:]  # Skip header row
                    for row in rows:
                        cells = row.find_all('td')
                        if len(cells) >= 6:
                            bidder_data = {
                                'number': cells[0].get_text(strip=True),
                                'name': cells[1].get_text(strip=True),
                                'price': cells[2].get_text(strip=True),
                                'rank': cells[3].get_text(strip=True),
                                'evaluation_stage': cells[4].get_text(strip=True),
                                'failure_reasons': cells[5].get_text(strip=True)
                            }
                            unsuccessful_bidders.append(bidder_data)
            
            contract_data['unsuccessful_bidders'] = unsuccessful_bidders
            
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
            
            logger.info(f"✅ Extracted details for contract: {contract_data.get('subject', 'Unknown')}")
            return contract_data
            
        except Exception as e:
            logger.error(f"❌ Failed to extract contract details: {str(e)}")
            return None

    def scrape_all_contracts(self):
        """Main scraping function"""
        try:
            logger.info("🚀 Starting EGP Uganda Post-Award Contract Scraping...")
            
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
                    
                    # Extract basic info from the list
                    basic_data = {
                        'subject': contract.get('procurement_subject', ''),
                        'provider': contract.get('provider', ''),
                        'published_date': contract.get('published_date', ''),
                        'contract_price': contract.get('contract_price', ''),
                        'status': contract.get('status_state', ''),
                        'action_links': contract.get('action_links', '')
                    }
                    
                    # Extract detail URL from action_links
                    detail_url = None
                    if basic_data['action_links']:
                        # Parse the action_links HTML to find the detail URL
                        soup = BeautifulSoup(basic_data['action_links'], 'html.parser')
                        link = soup.find('a')
                        if link and link.get('href'):
                            detail_url = urljoin(self.base_url, link.get('href'))
                    
                    if detail_url:
                        # Get detailed information
                        detailed_data = self.extract_contract_details(detail_url)
                        if detailed_data:
                            # Merge basic and detailed data
                            contract_data = {**basic_data, **detailed_data}
                            self.contracts_data.append(contract_data)
                        else:
                            # If detail extraction fails, still save basic data
                            self.contracts_data.append(basic_data)
                    else:
                        # No detail URL available, save basic data
                        self.contracts_data.append(basic_data)
                    
                    # Add delay to avoid overwhelming the server
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"❌ Error processing contract {i}: {str(e)}")
                    continue
            
            logger.info(f"✅ Scraping completed. Found {len(self.contracts_data)} contracts with details")
            return True
            
        except Exception as e:
            logger.error(f"❌ Scraping failed: {str(e)}")
            return False

    def save_to_csv(self, filename=None):
        """Save scraped data to CSV file"""
        if not self.contracts_data:
            logger.warning("⚠️ No data to save")
            return False
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"egp_post_award_contracts_{timestamp}.csv"
        
        try:
            logger.info(f"💾 Saving data to {filename}...")
            
            # Flatten the data for CSV
            flattened_data = []
            for contract in self.contracts_data:
                # Basic contract info
                row = {
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
                    'extraction_timestamp': contract.get('extraction_timestamp', '')
                }
                
                # Add unsuccessful bidders as separate rows
                unsuccessful_bidders = contract.get('unsuccessful_bidders', [])
                if unsuccessful_bidders:
                    for bidder in unsuccessful_bidders:
                        bidder_row = row.copy()
                        bidder_row.update({
                            'bidder_type': 'unsuccessful',
                            'bidder_name': bidder.get('name', ''),
                            'bidder_price': bidder.get('price', ''),
                            'bidder_rank': bidder.get('rank', ''),
                            'evaluation_stage': bidder.get('evaluation_stage', ''),
                            'failure_reasons': bidder.get('failure_reasons', '')
                        })
                        flattened_data.append(bidder_row)
                else:
                    # No unsuccessful bidders, just add the main contract
                    row['bidder_type'] = 'successful_only'
                    flattened_data.append(row)
            
            # Write to CSV
            if flattened_data:
                fieldnames = [
                    'subject', 'provider', 'published_date', 'contract_price', 'status',
                    'contract_url', 'procurement_entity', 'reference_number', 'method',
                    'successful_bidder', 'removal_date', 'published_by', 'published_on',
                    'signed_by', 'extraction_timestamp', 'bidder_type', 'bidder_name',
                    'bidder_price', 'bidder_rank', 'evaluation_stage', 'failure_reasons'
                ]
                
                with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(flattened_data)
                
                logger.info(f"✅ Data saved to {filename}")
                return True
            else:
                logger.warning("⚠️ No data to write to CSV")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to save CSV: {str(e)}")
            return False

def main():
    """Main function to run the scraper"""
    print("🎯 EGP Uganda Post-Award Contract Scraper")
    print("=" * 50)
    
    # Get credentials
    username = input("Enter your EGP Uganda email: ").strip()
    password = input("Enter your EGP Uganda password: ").strip()
    
    if not username or not password:
        print("❌ Username and password are required!")
        return
    
    # Create scraper instance
    scraper = EGPPostAwardScraper(username, password)
    
    # Run scraping
    if scraper.scrape_all_contracts():
        # Save to CSV
        if scraper.save_to_csv():
            print(f"✅ Scraping completed successfully!")
            print(f"📊 Total contracts processed: {len(scraper.contracts_data)}")
            print(f"📁 Data saved to CSV file")
        else:
            print("❌ Failed to save data to CSV")
    else:
        print("❌ Scraping failed")

if __name__ == "__main__":
    main()
