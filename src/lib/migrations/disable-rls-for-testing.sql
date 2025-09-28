-- Temporarily disable RLS for testing purposes
-- WARNING: This should only be used for testing, not in production!

-- Disable RLS on profiles table temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_notification_preferences table temporarily  
ALTER TABLE public.user_notification_preferences DISABLE ROW LEVEL SECURITY;

-- Disable RLS on notifications table temporarily
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Create a test user profile manually
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
) ON CONFLICT (id) DO NOTHING;

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
) ON CONFLICT (user_id) DO NOTHING;

SELECT 'Test user created successfully! RLS temporarily disabled for testing.' as status;
