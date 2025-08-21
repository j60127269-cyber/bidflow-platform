#!/usr/bin/env python3
"""
Uganda eGP Portal Scraper
Scrapes bid notices from https://egpuganda.go.ug/ and exports to CSV
"""

import requests
import pandas as pd
import time
import re
from datetime import datetime
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Optional
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EGPScraper:
    def __init__(self, email: str, password: str):
        self.base_url = "https://egpuganda.go.ug"
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def login(self) -> bool:
        """Login to the eGP portal"""
        try:
            logger.info("Attempting to login to eGP portal...")
            
            # First, get the login page to extract CSRF token
            login_url = f"{self.base_url}/login"
            response = self.session.get(login_url)
            response.raise_for_status()
            
            # Parse the login page to extract CSRF token
            soup = BeautifulSoup(response.text, 'html.parser')
            csrf_token = soup.find('input', {'name': '_token'})
            
            if not csrf_token:
                logger.error("Could not find CSRF token on login page")
                return False
            
            csrf_value = csrf_token.get('value')
            logger.info(f"Extracted CSRF token: {csrf_value[:10]}...")
            
            # Prepare login data
            login_data = {
                '_token': csrf_value,
                'email': self.email,
                'password': self.password
            }
            
            # Perform login
            response = self.session.post(login_url, data=login_data)
            
            # Check if login was successful
            if response.status_code == 200:
                # Check for successful login indicators
                if 'dashboard' in response.url or 'logout' in response.text:
                    logger.info("Login successful!")
                    return True
                else:
                    # Check for error messages on the login page
                    soup = BeautifulSoup(response.text, 'html.parser')
                    error_messages = soup.find_all(class_='alert-danger') or soup.find_all(class_='error')
                    if error_messages:
                        logger.error(f"Login failed - error messages found: {[msg.get_text().strip() for msg in error_messages]}")
                    else:
                        logger.error("Login failed - could not determine success/failure")
                    return False
            else:
                logger.error(f"Login request failed with status code: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return False

    def get_bid_notices(self, category: str = "all", max_pages: int = 5) -> List[Dict]:
        """Get bid notices using the AJAX API endpoint"""
        try:
            logger.info(f"Fetching bid notices from API...")
            
            # The API endpoint for bid archives
            api_url = f"{self.base_url}/api/v1/public_bid_archives"
            
            contracts = []
            page = 1
            
            while page <= max_pages:
                logger.info(f"Fetching page {page}...")
                
                # Parameters for the DataTable API
                params = {
                    'draw': page,
                    'start': (page - 1) * 10,  # DataTable uses 10 records per page by default
                    'length': 10,
                    'order[0][column]': 1,  # Order by date column
                    'order[0][dir]': 'desc'  # Descending order
                }
                
                try:
                    response = self.session.get(api_url, params=params)
                    response.raise_for_status()
                    
                    # Parse JSON response
                    data = response.json()
                    
                    if not data or 'data' not in data:
                        logger.warning(f"No data found in API response for page {page}")
                        break
                    
                    # Extract contracts from the data
                    page_contracts = data['data']
                    
                    if not page_contracts:
                        logger.info(f"No more contracts found on page {page}")
                        break
                    
                    # Process each contract
                    for contract_data in page_contracts:
                        contract = self._extract_contract_data_from_api(contract_data)
                        if contract:
                            contracts.append(contract)
                    
                    logger.info(f"Found {len(page_contracts)} contracts on page {page}")
                    page += 1
                    
                    # Add a small delay to be respectful to the server
                    time.sleep(1)
                    
                except requests.exceptions.RequestException as e:
                    logger.error(f"Error fetching page {page}: {str(e)}")
                    break
                except json.JSONDecodeError as e:
                    logger.error(f"Error parsing JSON response for page {page}: {str(e)}")
                    break
            
            logger.info(f"Total contracts fetched: {len(contracts)}")
            return contracts
            
        except Exception as e:
            logger.error(f"Error in get_bid_notices: {str(e)}")
            return []

    def _extract_contract_data_from_api(self, contract_data: List) -> Optional[Dict]:
        """Extract contract data from API response"""
        try:
            # The API returns data as an array where each element corresponds to a table column
            # Based on the HTML structure, the columns are:
            # [0]: Procuring Entity (with image and name)
            # [1]: Procurement Method
            # [2]: Bid Details (title)
            # [3]: Status
            # [4]: Published Date
            # [5]: Deadline
            # [6]: Actions (View Details link)
            
            if len(contract_data) < 7:
                logger.warning(f"Invalid contract data structure: {contract_data}")
                return None
            
            # Extract procuring entity and reference number
            entity_html = contract_data[0]
            soup = BeautifulSoup(entity_html, 'html.parser')
            
            # Find the reference number link
            ref_link = soup.find('a', href=re.compile(r'/bid/notice/\d+/details'))
            if not ref_link:
                return None
            
            # Extract reference number from the link text
            reference_number = ref_link.get_text().strip()
            
            # Extract procuring entity name
            entity_name_elem = soup.find('div', class_='text-muted')
            procuring_entity = entity_name_elem.get_text().strip() if entity_name_elem else "Unknown"
            
            # Extract title
            title = contract_data[2].strip()
            
            # Extract procurement method
            procurement_method = contract_data[1].strip()
            
            # Extract status
            status = contract_data[3].strip()
            
            # Extract dates
            published_date = contract_data[4].strip()
            deadline = contract_data[5].strip()
            
            # Extract detail link
            actions_html = contract_data[6]
            actions_soup = BeautifulSoup(actions_html, 'html.parser')
            detail_link = actions_soup.find('a', href=re.compile(r'/bid/notice/\d+/details'))
            detail_url = f"{self.base_url}{detail_link['href']}" if detail_link else None
            
            # Parse dates
            published_parsed = self._parse_date(published_date)
            deadline_parsed = self._parse_date(deadline)
            
            contract = {
                'reference_number': reference_number,
                'title': title,
                'procuring_entity': procuring_entity,
                'procurement_method': procurement_method,
                'status': status,
                'published_date': published_parsed,
                'deadline': deadline_parsed,
                'detail_url': detail_url,
                'category': self._extract_category_from_title(title),
                'estimated_value_min': None,
                'estimated_value_max': None,
                'description': title  # Use title as description for now
            }
            
            return contract
            
        except Exception as e:
            logger.error(f"Error extracting contract data: {str(e)}")
            return None

    def _extract_contract_data(self, item) -> Optional[Dict]:
        """Legacy method - kept for compatibility but not used with API approach"""
        try:
            # Find the title/link element
            title_elem = item.find('a', href=re.compile(r'/bid/notice/\d+/details'))
            if not title_elem:
                return None
            
            title = title_elem.get_text().strip()
            if not title or title.lower() in ['navigation', 'menu', 'home', 'back']:
                return None
            
            # Extract reference number from URL or title
            href = title_elem.get('href', '')
            reference_number = self._extract_reference_from_url(href)
            
            # Extract other details
            procuring_entity = self._extract_procuring_entity(item)
            category = self._extract_category(item)
            published_date = self._extract_date(item)
            
            contract = {
                'reference_number': reference_number,
                'title': title,
                'procuring_entity': procuring_entity,
                'category': category,
                'published_date': published_date,
                'detail_url': f"{self.base_url}{href}" if href else None,
                'estimated_value_min': None,
                'estimated_value_max': None,
                'description': title
            }
            
            return contract
            
        except Exception as e:
            logger.error(f"Error extracting contract data: {str(e)}")
            return None

    def _extract_procuring_entity(self, item) -> str:
        """Extract procuring entity from item"""
        try:
            # Look for entity information in the item
            entity_elem = item.find(class_='text-muted') or item.find(class_='entity')
            if entity_elem:
                return entity_elem.get_text().strip()
            return "Unknown"
        except:
            return "Unknown"

    def _extract_reference_from_url(self, url: str) -> str:
        """Extract reference number from URL"""
        try:
            # Extract reference from URL like /bid/notice/123456/details
            match = re.search(r'/bid/notice/(\d+)/details', url)
            if match:
                return match.group(1)
            
            # If no match, try to extract from the URL path
            parts = url.split('/')
            for part in parts:
                if part.isdigit():
                    return part
            
            return "Unknown"
        except:
            return "Unknown"

    def _extract_category_from_title(self, title: str) -> str:
        """Extract category from contract title"""
        try:
            title_lower = title.lower()
            
            # Define category keywords
            categories = {
                'construction': ['construction', 'building', 'infrastructure', 'road', 'bridge', 'renovation'],
                'supplies': ['supply', 'delivery', 'procurement', 'purchase', 'equipment', 'materials'],
                'services': ['service', 'maintenance', 'consultancy', 'training', 'support'],
                'it': ['software', 'hardware', 'it', 'technology', 'system', 'digital'],
                'healthcare': ['medical', 'health', 'hospital', 'clinic', 'pharmaceutical'],
                'education': ['education', 'training', 'school', 'university', 'learning']
            }
            
            for category, keywords in categories.items():
                if any(keyword in title_lower for keyword in keywords):
                    return category
            
            return 'other'
        except:
            return 'other'

    def _extract_category(self, item) -> str:
        """Extract category from item"""
        try:
            title_elem = item.find('a')
            if title_elem:
                return self._extract_category_from_title(title_elem.get_text().strip())
            return 'other'
        except:
            return 'other'

    def _extract_date(self, item) -> str:
        """Extract date from item"""
        try:
            # Look for date elements
            date_elem = item.find(class_='date') or item.find('time') or item.find('span', class_='date')
            if date_elem:
                return self._parse_date(date_elem.get_text().strip())
            
            # Try to find any text that looks like a date
            text = item.get_text()
            date_pattern = r'\d{4}-\d{2}-\d{2}'
            match = re.search(date_pattern, text)
            if match:
                return self._parse_date(match.group())
            
            return "Unknown"
        except:
            return "Unknown"

    def _parse_date(self, date_str: str) -> str:
        """Parse and standardize date format"""
        try:
            if not date_str or date_str.lower() == 'unknown':
                return "Unknown"
            
            # Handle various date formats
            date_formats = [
                '%Y-%m-%d %H:%M:%S%p %Z',  # 2025-08-21 02:36:58pm EAT
                '%Y-%m-%d %H:%M:%S',      # 2025-08-21 02:36:58
                '%Y-%m-%d',               # 2025-08-21
                '%d-%m-%Y',               # 21-08-2025
                '%m-%d-%Y',               # 08-21-2025
                '%b-%d %Y',               # Sep-10 2025
            ]
            
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_str.strip(), fmt)
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    continue
            
            # If no format matches, return as is
            return date_str.strip()
            
        except Exception as e:
            logger.error(f"Error parsing date '{date_str}': {str(e)}")
            return date_str.strip()

    def _get_contract_details(self, link: str) -> Dict:
        """Get detailed contract information"""
        try:
            response = self.session.get(link)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract additional details from the contract page
            details = {}
            
            # Look for estimated value
            value_elem = soup.find(text=re.compile(r'estimated.*value', re.IGNORECASE))
            if value_elem:
                value_text = value_elem.find_next().get_text() if value_elem.find_next() else value_elem
                value_parsed = self._parse_estimated_value(value_text)
                details.update(value_parsed)
            
            return details
            
        except Exception as e:
            logger.error(f"Error getting contract details: {str(e)}")
            return {}

    def _parse_estimated_value(self, value_text: str) -> Dict:
        """Parse estimated value from text"""
        try:
            # Extract numbers from text like "UGX 1,000,000 - 2,000,000"
            numbers = re.findall(r'[\d,]+', value_text.replace(',', ''))
            if len(numbers) >= 2:
                return {
                    'estimated_value_min': float(numbers[0]),
                    'estimated_value_max': float(numbers[1])
                }
            elif len(numbers) == 1:
                return {
                    'estimated_value_min': float(numbers[0]),
                    'estimated_value_max': float(numbers[0])
                }
            return {}
        except:
            return {}

    def export_to_csv(self, contracts: List[Dict], filename: str = None) -> str:
        """Export contracts to CSV file"""
        try:
            if not filename:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f'egp_contracts_{timestamp}.csv'
            
            # Convert to DataFrame and export
            df = pd.DataFrame(contracts)
            df.to_csv(filename, index=False, encoding='utf-8')
            
            logger.info(f"Exported {len(contracts)} contracts to {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {str(e)}")
            return None
    
    def test_portal_structure(self):
        """Test the portal structure without login"""
        try:
            logger.info("Testing portal structure...")
            
            # Test main page
            response = self.session.get(self.base_url)
            logger.info(f"Main page status: {response.status_code}")
            
            # Test bid notices page
            bid_url = f"{self.base_url}/bid/notices"
            response = self.session.get(bid_url)
            logger.info(f"Bid notices page status: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Look for DataTable structure
                datatable = soup.find('table', id='bid-notices-archives')
                if datatable:
                    logger.info("Found DataTable structure")
                else:
                    logger.warning("DataTable not found")
                
                # Look for API endpoint references
                api_refs = soup.find_all(text=re.compile(r'public_bid_archives'))
                if api_refs:
                    logger.info("Found API endpoint references")
                else:
                    logger.warning("API endpoint references not found")
            
        except Exception as e:
            logger.error(f"Error testing portal structure: {str(e)}")

def main():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Initialize scraper
    email = "sebunyaronaldoo@gmail.com"
    password = "zHE-YZNc%5S8EFD"
    
    scraper = EGPScraper(email, password)
    
    # Test portal structure first
    scraper.test_portal_structure()
    
    # Try to login
    if not scraper.login():
        logger.error("Failed to login. Exiting.")
        return
    
    # Get bid notices
    contracts = scraper.get_bid_notices(max_pages=3)
    
    if contracts:
        # Export to CSV
        filename = scraper.export_to_csv(contracts)
        if filename:
            logger.info(f"Successfully exported {len(contracts)} contracts to {filename}")
        else:
            logger.error("Failed to export contracts")
    else:
        logger.warning("No contracts found")

if __name__ == "__main__":
    main()
