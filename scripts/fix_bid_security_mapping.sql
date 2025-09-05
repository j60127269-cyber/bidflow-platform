-- Fix Bid Security Data Mapping
-- This script corrects the bid security data for existing contracts
-- where bid_security_type contains amounts instead of types

-- First, let's see what we're working with
SELECT 
    COUNT(*) as total_contracts,
    COUNT(CASE WHEN bid_security_type IS NOT NULL AND bid_security_type != '' THEN 1 END) as contracts_with_bid_security_type,
    COUNT(CASE WHEN bid_security_amount IS NOT NULL AND bid_security_amount > 0 THEN 1 END) as contracts_with_bid_security_amount
FROM contracts;

-- Show sample of current data
SELECT 
    reference_number,
    title,
    bid_security_type,
    bid_security_amount
FROM contracts 
WHERE bid_security_type IS NOT NULL AND bid_security_type != ''
LIMIT 10;

-- Create a function to parse bid security amount from text
CREATE OR REPLACE FUNCTION parse_bid_security_amount(security_text TEXT)
RETURNS NUMERIC AS $$
BEGIN
    IF security_text IS NULL OR security_text = '' THEN
        RETURN 0;
    END IF;
    
    -- Remove common prefixes and suffixes
    security_text := REPLACE(security_text, 'UGX', '');
    security_text := REPLACE(security_text, 'USD', '');
    security_text := REPLACE(security_text, '$', '');
    security_text := REPLACE(security_text, '/', '');
    security_text := REPLACE(security_text, '=', '');
    security_text := REPLACE(security_text, ',', '');
    security_text := TRIM(security_text);
    
    -- Extract numeric value using regex
    security_text := REGEXP_REPLACE(security_text, '[^0-9.]', '', 'g');
    
    -- Convert to numeric
    IF security_text ~ '^[0-9]+\.?[0-9]*$' THEN
        RETURN security_text::NUMERIC;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update contracts where bid_security_type contains amounts
-- Move the amount to bid_security_amount and set proper type
UPDATE contracts 
SET 
    bid_security_amount = parse_bid_security_amount(bid_security_type),
    bid_security_type = CASE 
        WHEN parse_bid_security_amount(bid_security_type) > 0 
        THEN 'Bank Guarantee or Letter of Credit or cashiers check or bank draft'
        ELSE NULL
    END
WHERE 
    bid_security_type IS NOT NULL 
    AND bid_security_type != ''
    AND bid_security_type ~ '[0-9]'  -- Contains numbers (likely an amount)
    AND (bid_security_amount IS NULL OR bid_security_amount = 0);

-- For contracts that have bid_security_type but no amount, set amount to 0
UPDATE contracts 
SET 
    bid_security_amount = 0,
    bid_security_type = NULL
WHERE 
    bid_security_type IS NOT NULL 
    AND bid_security_type != ''
    AND bid_security_type !~ '[0-9]'  -- Doesn't contain numbers (likely not an amount)
    AND (bid_security_amount IS NULL OR bid_security_amount = 0);

-- For contracts with no bid security information, set defaults
UPDATE contracts 
SET 
    bid_security_amount = 0,
    bid_security_type = NULL
WHERE 
    (bid_security_type IS NULL OR bid_security_type = '')
    AND (bid_security_amount IS NULL OR bid_security_amount = 0);

-- Show results after migration
SELECT 
    COUNT(*) as total_contracts,
    COUNT(CASE WHEN bid_security_type IS NOT NULL AND bid_security_type != '' THEN 1 END) as contracts_with_bid_security_type,
    COUNT(CASE WHEN bid_security_amount IS NOT NULL AND bid_security_amount > 0 THEN 1 END) as contracts_with_bid_security_amount
FROM contracts;

-- Show sample of corrected data
SELECT 
    reference_number,
    title,
    bid_security_type,
    bid_security_amount
FROM contracts 
WHERE bid_security_amount > 0 OR bid_security_type IS NOT NULL
LIMIT 10;

-- Clean up the function
DROP FUNCTION IF EXISTS parse_bid_security_amount(TEXT);

-- Show summary of changes
SELECT 
    'Bid Security Migration Complete' as status,
    COUNT(*) as total_contracts,
    COUNT(CASE WHEN bid_security_amount > 0 THEN 1 END) as contracts_with_bid_security,
    COUNT(CASE WHEN bid_security_amount = 0 THEN 1 END) as contracts_without_bid_security
FROM contracts;

