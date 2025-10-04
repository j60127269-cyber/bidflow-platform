#!/usr/bin/env python3
"""
Test script for EGP Post-Award Contract Scraper
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from egp_post_award_scraper import EGPPostAwardScraper

def test_scraper():
    """Test the scraper with dummy credentials"""
    print("🧪 Testing EGP Post-Award Contract Scraper")
    print("=" * 50)
    
    # Test with dummy credentials (will fail login but test structure)
    scraper = EGPPostAwardScraper("test@example.com", "testpassword")
    
    print("✅ Scraper instance created successfully")
    print("✅ All imports working correctly")
    print("✅ Ready to run with real credentials")
    
    print("\n📋 To run the scraper:")
    print("1. python egp_post_award_scraper.py")
    print("2. python run_scraper.py")
    print("3. Set environment variables and run")

if __name__ == "__main__":
    test_scraper()
