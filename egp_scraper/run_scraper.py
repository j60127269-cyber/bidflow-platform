#!/usr/bin/env python3
"""
Simple script to run the EGP Post-Award Contract Scraper
"""

import os
import sys
from egp_post_award_scraper import EGPPostAwardScraper

def main():
    print("🎯 EGP Uganda Post-Award Contract Scraper")
    print("=" * 50)
    
    # Get credentials from environment variables or user input
    username = os.getenv('EGP_USERNAME')
    password = os.getenv('EGP_PASSWORD')
    
    if not username:
        username = input("Enter your EGP Uganda email: ").strip()
    
    if not password:
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
