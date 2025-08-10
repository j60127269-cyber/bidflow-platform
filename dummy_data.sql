-- ========================================
-- DUMMY DATA FOR BIDFLOW PLATFORM
-- ========================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM bid_tracking;
-- DELETE FROM notifications;
-- DELETE FROM contracts;

-- ========================================
-- SAMPLE CONTRACTS
-- ========================================

INSERT INTO contracts (
  id,
  title,
  client,
  location,
  value,
  deadline,
  category,
  description,
  status,
  posted_date,
  requirements
) VALUES 
-- IT & Technology Contracts
(
  gen_random_uuid(),
  'Supply, Installation, Migration, and Commissioning of Unified Threat Management (Firewalls)',
  'Parliament of Uganda',
  'Kampala, Uganda',
  850000000,
  '2024-08-29',
  'Information Technology',
  'Supply, Installation, Migration, and Commissioning of Unified Threat Management (Firewalls) for Parliament of Uganda. This includes comprehensive cybersecurity infrastructure implementation with firewall systems, threat management, and security monitoring capabilities.',
  'open',
  '2024-08-04',
  ARRAY['Minimum 5 years experience in cybersecurity', 'Valid business registration certificate', 'Financial capacity to handle project', 'Technical team with relevant qualifications']
),
(
  gen_random_uuid(),
  'IT Infrastructure Upgrade for Government Offices',
  'Ministry of ICT',
  'Kampala, Uganda',
  120000000,
  '2024-02-28',
  'Information Technology',
  'Upgrade of IT infrastructure across 50 government offices including hardware, software, and network equipment.',
  'open',
  '2024-01-10',
  ARRAY['Experience with government IT projects', 'Certified IT professionals', 'Local support capability']
),
(
  gen_random_uuid(),
  'Digital Transformation Project',
  'Bank of Uganda',
  'Kampala, Uganda',
  450000000,
  '2024-03-15',
  'Information Technology',
  'Implementation of digital banking infrastructure and mobile payment systems for the central bank.',
  'open',
  '2024-01-15',
  ARRAY['Banking sector experience', 'Digital payment expertise', 'Regulatory compliance knowledge']
),

-- Construction Contracts
(
  gen_random_uuid(),
  'Road Construction - Kampala Expressway',
  'Uganda National Roads Authority',
  'Kampala, Uganda',
  8500000000,
  '2024-03-15',
  'Construction',
  'Construction of 15km expressway connecting Kampala to Entebbe International Airport with modern infrastructure.',
  'open',
  '2024-01-15',
  ARRAY['Class A construction license', 'Experience with road projects', 'Financial capacity for large projects']
),
(
  gen_random_uuid(),
  'Hospital Construction Project',
  'Ministry of Health',
  'Jinja, Uganda',
  3200000000,
  '2024-04-20',
  'Construction',
  'Construction of a 200-bed regional hospital with modern medical facilities and equipment.',
  'open',
  '2024-01-20',
  ARRAY['Healthcare construction experience', 'Medical equipment knowledge', 'Quality assurance systems']
),
(
  gen_random_uuid(),
  'School Building Construction',
  'Ministry of Education',
  'Gulu, Uganda',
  850000000,
  '2024-05-10',
  'Construction',
  'Construction of 5 primary schools with modern classrooms, libraries, and sports facilities.',
  'open',
  '2024-01-25',
  ARRAY['Educational facility experience', 'Child safety compliance', 'Local community engagement']
),

-- Agriculture Contracts
(
  gen_random_uuid(),
  'Agricultural Equipment Supply',
  'Ministry of Agriculture',
  'Jinja, Uganda',
  45000000,
  '2024-02-20',
  'Agriculture',
  'Supply of modern farming equipment and training for 200 farmers including tractors, irrigation systems, and farming tools.',
  'open',
  '2024-01-12',
  ARRAY['Agricultural equipment expertise', 'Training capability', 'After-sales support']
),
(
  gen_random_uuid(),
  'Food Processing Plant Equipment',
  'Uganda Investment Authority',
  'Mbarara, Uganda',
  180000000,
  '2024-03-30',
  'Agriculture',
  'Supply and installation of food processing equipment for a new agricultural processing facility.',
  'open',
  '2024-01-18',
  ARRAY['Food processing experience', 'Equipment installation capability', 'Quality certification']
),

-- Healthcare Contracts
(
  gen_random_uuid(),
  'Medical Equipment Supply',
  'Mulago National Referral Hospital',
  'Kampala, Uganda',
  280000000,
  '2024-04-15',
  'Healthcare',
  'Supply of advanced medical equipment including MRI machines, CT scanners, and laboratory equipment.',
  'open',
  '2024-01-22',
  ARRAY['Medical equipment certification', 'Installation and training', 'Maintenance support']
),
(
  gen_random_uuid(),
  'Pharmaceutical Supply Chain',
  'National Medical Stores',
  'Entebbe, Uganda',
  150000000,
  '2024-05-05',
  'Healthcare',
  'Supply of essential medicines and pharmaceutical products for government health facilities.',
  'open',
  '2024-01-28',
  ARRAY['Pharmaceutical license', 'Cold chain capability', 'Quality assurance systems']
),

-- Energy Contracts
(
  gen_random_uuid(),
  'Solar Power Installation',
  'Rural Electrification Agency',
  'Multiple Locations',
  320000000,
  '2024-06-20',
  'Energy',
  'Installation of solar power systems for 100 rural communities across Uganda.',
  'open',
  '2024-02-01',
  ARRAY['Solar installation experience', 'Rural project experience', 'Maintenance capability']
),
(
  gen_random_uuid(),
  'Hydroelectric Power Maintenance',
  'Uganda Electricity Generation Company',
  'Jinja, Uganda',
  180000000,
  '2024-07-15',
  'Energy',
  'Maintenance and upgrade of hydroelectric power generation equipment at Owen Falls Dam.',
  'open',
  '2024-02-05',
  ARRAY['Hydroelectric experience', 'Safety certification', 'Emergency response capability']
);

-- ========================================
-- SAMPLE BID TRACKING RECORDS
-- ========================================

-- Get some user IDs (you'll need to replace these with actual user IDs from your auth.users table)
-- For now, we'll create tracking records without user_id (they'll be created when users actually track)

-- ========================================
-- SAMPLE NOTIFICATIONS
-- ========================================

-- Note: Notifications will be created automatically when users track bids
-- These are just examples of what the system will generate

-- ========================================
-- VERIFY THE DATA
-- ========================================

-- Check how many contracts we have
SELECT 
  category,
  COUNT(*) as contract_count,
  SUM(value) as total_value
FROM contracts 
GROUP BY category 
ORDER BY total_value DESC;

-- Check contract status distribution
SELECT 
  status,
  COUNT(*) as count
FROM contracts 
GROUP BY status;

-- Show sample contracts
SELECT 
  id,
  title,
  client,
  category,
  value,
  deadline,
  status
FROM contracts 
ORDER BY posted_date DESC 
LIMIT 10;
