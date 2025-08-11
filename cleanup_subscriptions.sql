-- Clean up any existing subscription data that shouldn't be there
-- This script will reset subscription status to ensure proper payment flow

-- 1. Reset all profiles subscription status to 'none' (no active subscriptions)
UPDATE profiles 
SET 
  subscription_status = 'none',
  subscription_id = NULL,
  trial_ends_at = NULL,
  updated_at = NOW()
WHERE subscription_status IN ('active', 'trial');

-- 2. Delete any existing subscriptions (these should only be created after payment)
DELETE FROM subscriptions 
WHERE status = 'active' 
  AND created_at < NOW() - INTERVAL '1 hour'; -- Only delete recent ones that shouldn't exist

-- 3. Delete any existing payments that aren't successful
DELETE FROM payments 
WHERE status != 'successful' 
  AND created_at < NOW() - INTERVAL '1 hour';

-- 4. Verify the cleanup
SELECT 
  'Profiles with active subscriptions:' as check_type,
  COUNT(*) as count
FROM profiles 
WHERE subscription_status IN ('active', 'trial')

UNION ALL

SELECT 
  'Active subscriptions in subscriptions table:' as check_type,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'active'

UNION ALL

SELECT 
  'Successful payments:' as check_type,
  COUNT(*) as count
FROM payments 
WHERE status = 'successful';

-- 5. Show current state
SELECT 
  id,
  email,
  subscription_status,
  subscription_id,
  trial_ends_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
