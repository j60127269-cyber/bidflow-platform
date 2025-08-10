-- ========================================
-- INSERT SAMPLE PROFILE
-- ========================================

-- First, get your user ID (replace 'your-email@example.com' with your actual email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert the profile (replace 'YOUR-USER-ID-HERE' with the ID from above)
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
  'YOUR-USER-ID-HERE', -- Replace with your actual user ID
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

-- Verify the profile was created
SELECT * FROM profiles;
