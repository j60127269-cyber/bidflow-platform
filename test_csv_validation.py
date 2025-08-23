#!/usr/bin/env python3

import pandas as pd
import json

def test_csv_validation():
    """Test the CSV file to identify validation issues"""
    
    # Read the CSV file
    df = pd.read_csv('bidflow_import_20250823_114939.csv')
    
    print("=== CSV Validation Test ===")
    print(f"Total rows: {len(df)}")
    print(f"Total columns: {len(df.columns)}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Check required fields
    required_fields = ['reference_number', 'title', 'category', 'procurement_method', 'submission_deadline', 'procuring_entity']
    
    print("\n=== Required Fields Check ===")
    for field in required_fields:
        if field in df.columns:
            # Check for empty values
            empty_count = df[field].isna().sum()
            whitespace_count = (df[field].astype(str).str.strip() == '').sum()
            total_issues = empty_count + whitespace_count
            
            print(f"{field}:")
            print(f"  - Empty (NaN): {empty_count}")
            print(f"  - Whitespace only: {whitespace_count}")
            print(f"  - Total issues: {total_issues}")
            
            if total_issues > 0:
                print(f"  - Sample problematic values:")
                problematic = df[df[field].isna() | (df[field].astype(str).str.strip() == '')]
                for idx, row in problematic.head(3).iterrows():
                    print(f"    Row {idx+1}: '{row[field]}'")
        else:
            print(f"{field}: MISSING COLUMN")
    
    # Check first few rows in detail
    print("\n=== First 3 Rows Detail ===")
    for i in range(min(3, len(df))):
        print(f"\nRow {i+1}:")
        row = df.iloc[i]
        for field in required_fields:
            if field in df.columns:
                value = row[field]
                print(f"  {field}: '{value}' (type: {type(value)})")
    
    # Test JSON serialization (like the web app would do)
    print("\n=== JSON Serialization Test ===")
    try:
        # Convert to list of dicts like the web app would
        contracts = df.to_dict('records')
        json_str = json.dumps(contracts[:2], indent=2)  # First 2 contracts
        print("✅ JSON serialization successful")
        print("Sample JSON:")
        print(json_str[:500] + "..." if len(json_str) > 500 else json_str)
    except Exception as e:
        print(f"❌ JSON serialization failed: {e}")
    
    # Check for any special characters or encoding issues
    print("\n=== Character Analysis ===")
    for field in required_fields:
        if field in df.columns:
            sample_values = df[field].dropna().head(3)
            print(f"\n{field} sample values:")
            for i, value in enumerate(sample_values):
                print(f"  {i+1}: '{value}' (length: {len(str(value))})")
                # Check for non-printable characters
                non_printable = [c for c in str(value) if not c.isprintable()]
                if non_printable:
                    print(f"    ⚠️ Non-printable characters: {non_printable}")

if __name__ == "__main__":
    test_csv_validation()
