-- ========================================
-- PROFILES TABLE SETUP FOR RECOMMENDATIONS
-- ========================================

-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  business_type TEXT,
  experience_years INTEGER DEFAULT 0,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  max_contract_value BIGINT DEFAULT 1000000000,
  min_contract_value BIGINT DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  team_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insert sample profile data (replace with actual user ID)
-- You'll need to replace 'your-user-id-here' with your actual user ID from auth.users
INSERT INTO profiles (
  id,
  company_name,
  business_type,
  experience_years,
  preferred_categories,
  preferred_locations,
  max_contract_value,
  min_contract_value,
  certifications,
  team_size
) VALUES (
  'your-user-id-here', -- Replace this with your actual user ID
  'Tech Solutions Uganda',
  'Technology',
  5,
  ARRAY['Information Technology', 'Construction'],
  ARRAY['Kampala', 'Jinja'],
  1000000000,
  50000000,
  ARRAY['ISO 9001', 'CMMI Level 3'],
  25
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  business_type = EXCLUDED.business_type,
  experience_years = EXCLUDED.experience_years,
  preferred_categories = EXCLUDED.preferred_categories,
  preferred_locations = EXCLUDED.preferred_locations,
  max_contract_value = EXCLUDED.max_contract_value,
  min_contract_value = EXCLUDED.min_contract_value,
  certifications = EXCLUDED.certifications,
  team_size = EXCLUDED.team_size,
  updated_at = NOW();

-- To find your user ID, run this query in Supabase:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Verify the profiles table
SELECT * FROM profiles;
