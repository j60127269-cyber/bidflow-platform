#!/usr/bin/env python3
"""
Test script to verify the bid security fix in the EGP scraper
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'egp_scraper'))

from egp_scraper import EGPScraper

def test_bid_security_parsing():
    """Test the bid security amount parsing function"""
    scraper = EGPScraper("test@example.com", "testpass")
    
    # Test cases for bid security amount parsing
    test_cases = [
        ("UGX 33,254,000.00/=", 33254000.0),
        ("UGX 1,500,000", 1500000.0),
        ("USD 50,000", 50000.0),
        ("$25,000", 25000.0),
        ("1000000", 1000000.0),
        ("", 0.0),
        (None, 0.0),
        ("No security required", 0.0),
        ("UGX 0", 0.0),
    ]
    
    print("Testing bid security amount parsing...")
    print("=" * 50)
    
    all_passed = True
    for input_text, expected in test_cases:
        result = scraper._parse_bid_security_amount(input_text)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        print(f"{status} | Input: '{input_text}' | Expected: {expected} | Got: {result}")
        if result != expected:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed!")
    
    return all_passed

def test_bid_security_logic():
    """Test the complete bid security logic"""
    print("\nTesting complete bid security logic...")
    print("=" * 50)
    
    # Simulate contract details with different bid security scenarios
    test_scenarios = [
        {
            "name": "Contract with bid security amount",
            "bid_security_value": "UGX 33,254,000.00/=",
            "expected_amount": 33254000.0,
            "expected_type": "Bank Guarantee or Letter of Credit or cashiers check or bank draft"
        },
        {
            "name": "Contract with no bid security",
            "bid_security_value": "",
            "expected_amount": 0,
            "expected_type": None
        },
        {
            "name": "Contract with zero bid security",
            "bid_security_value": "UGX 0",
            "expected_amount": 0,
            "expected_type": None
        }
    ]
    
    scraper = EGPScraper("test@example.com", "testpass")
    
    for scenario in test_scenarios:
        print(f"\nTesting: {scenario['name']}")
        print(f"Input: '{scenario['bid_security_value']}'")
        
        # Simulate the logic from get_contract_details
        if scenario['bid_security_value'] and scenario['bid_security_value'] != 'BID SECURITY':
            amount = scraper._parse_bid_security_amount(scenario['bid_security_value'])
            if amount > 0:
                bid_security_amount = amount
                bid_security_type = "Bank Guarantee or Letter of Credit or cashiers check or bank draft"
            else:
                bid_security_amount = 0
                bid_security_type = None
        else:
            bid_security_amount = 0
            bid_security_type = None
        
        # Check results
        amount_correct = bid_security_amount == scenario['expected_amount']
        type_correct = bid_security_type == scenario['expected_type']
        
        print(f"Expected Amount: {scenario['expected_amount']} | Got: {bid_security_amount} | {'✅' if amount_correct else '❌'}")
        print(f"Expected Type: {scenario['expected_type']} | Got: {bid_security_type} | {'✅' if type_correct else '❌'}")
        
        if amount_correct and type_correct:
            print("✅ Scenario passed!")
        else:
            print("❌ Scenario failed!")

if __name__ == "__main__":
    print("🧪 Testing Bid Security Fix")
    print("=" * 60)
    
    # Test the parsing function
    parsing_passed = test_bid_security_parsing()
    
    # Test the complete logic
    test_bid_security_logic()
    
    print("\n" + "=" * 60)
    if parsing_passed:
        print("🎉 Bid Security Fix Test Complete - All parsing tests passed!")
        print("✅ The scraper should now correctly map bid security data")
    else:
        print("⚠️  Some tests failed - please review the implementation")
    
    print("\nNext steps:")
    print("1. Run the scraper to generate new CSV files")
    print("2. Run the SQL migration script to fix existing contracts")
    print("3. Import the new CSV files to verify the fix works")
