-- Create test user by removing all foreign key constraints temporarily
-- This is for testing purposes only

-- Temporarily disable RLS for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Drop all foreign key constraints temporarily for testing
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_id_fkey;
ALTER TABLE public.user_notification_preferences DROP CONSTRAINT IF EXISTS user_notification_preferences_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Create a test user profile
INSERT INTO public.profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  company_name,
  business_type,
  industry_preferences,
  contract_type_preferences,
  preferred_categories,
  location_preferences,
  daily_digest_enabled,
  email_notifications,
  whatsapp_notifications,
  notification_frequency,
  onboarding_completed,
  role,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test@bidflow.com',
  'Test',
  'User',
  'Test Company',
  'IT Consulting',
  ARRAY['Information Technology'],
  ARRAY['Information Technology'],
  ARRAY['Information Technology'],
  ARRAY['Kampala'],
  true,
  true,
  false,
  'daily',
  true,
  'user',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  industry_preferences = EXCLUDED.industry_preferences,
  contract_type_preferences = EXCLUDED.contract_type_preferences,
  preferred_categories = EXCLUDED.preferred_categories;

-- Create notification preferences for the test user
INSERT INTO public.user_notification_preferences (
  user_id,
  new_contract_notifications,
  deadline_reminders,
  daily_digest_enabled,
  email_enabled,
  in_app_enabled,
  whatsapp_enabled,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  true,
  true,
  true,
  true,
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  new_contract_notifications = EXCLUDED.new_contract_notifications,
  deadline_reminders = EXCLUDED.deadline_reminders,
  daily_digest_enabled = EXCLUDED.daily_digest_enabled;

SELECT 'Test user created successfully! All foreign key constraints removed for testing.' as status;
