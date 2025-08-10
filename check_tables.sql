-- ========================================
-- CHECK EXISTING TABLES AND DIAGNOSE ISSUES
-- ========================================

-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_table_exists;

-- Check auth.users table
SELECT COUNT(*) as user_count FROM auth.users;

-- Show sample users (first 3)
SELECT id, email, created_at 
FROM auth.users 
LIMIT 3;
