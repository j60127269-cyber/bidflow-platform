-- Update Professional plan price to 50,000 UGX
UPDATE subscription_plans 
SET 
  price = 50000,
  updated_at = NOW()
WHERE name = 'Professional';

-- Verify the update
SELECT 
  name,
  price,
  currency,
  billing_interval,
  updated_at
FROM subscription_plans 
WHERE name = 'Professional';

