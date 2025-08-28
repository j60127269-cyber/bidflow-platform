-- Combined Database Setup Script
-- This script creates the enhanced schema and populates sample data

-- =============================================
-- 1. ENHANCE CONTRACT SCHEMA
-- =============================================

-- Add new columns to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS awarded_to TEXT,
ADD COLUMN IF NOT EXISTS awarded_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS award_date DATE,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS completion_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS performance_rating DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS total_bidders INTEGER,
ADD COLUMN IF NOT EXISTS winning_bid_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS technical_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS financial_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS procuring_entity_id UUID REFERENCES procuring_entities(id),
ADD COLUMN IF NOT EXISTS awarded_company_id UUID REFERENCES awardees(id);

-- Create awardees table
CREATE TABLE IF NOT EXISTS awardees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    registration_number TEXT,
    business_type TEXT,
    primary_categories TEXT[],
    locations TEXT[],
    team_size INTEGER,
    annual_revenue_range TEXT,
    certifications TEXT[],
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create procuring_entities table
CREATE TABLE IF NOT EXISTS procuring_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL,
    entity_type TEXT,
    parent_entity_id TEXT,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    location TEXT,
    annual_budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitor_bids table
CREATE TABLE IF NOT EXISTS competitor_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    competitor_id UUID REFERENCES awardees(id),
    bid_value DECIMAL(15,2),
    technical_score DECIMAL(5,2),
    financial_score DECIMAL(5,2),
    bid_status TEXT DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contract_performance table
CREATE TABLE IF NOT EXISTS contract_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    performance_date DATE,
    milestone TEXT,
    completion_percentage DECIMAL(5,2),
    quality_rating DECIMAL(3,1),
    on_schedule BOOLEAN,
    within_budget BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create awardee_analysis table
CREATE TABLE IF NOT EXISTS awardee_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    awardee_id UUID REFERENCES awardees(id) ON DELETE CASCADE,
    analysis_date DATE,
    total_contracts INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    win_rate DECIMAL(5,2),
    avg_contract_value DECIMAL(15,2),
    top_categories TEXT[],
    performance_trend TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_procuring_entity_id ON contracts(procuring_entity_id);
CREATE INDEX IF NOT EXISTS idx_contracts_awarded_company_id ON contracts(awarded_company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_award_date ON contracts(award_date);
CREATE INDEX IF NOT EXISTS idx_awardees_company_name ON awardees(company_name);
CREATE INDEX IF NOT EXISTS idx_procuring_entities_entity_name ON procuring_entities(entity_name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then recreate them
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
DROP TRIGGER IF EXISTS update_awardees_updated_at ON awardees;
DROP TRIGGER IF EXISTS update_procuring_entities_updated_at ON procuring_entities;

-- Create triggers for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_awardees_updated_at BEFORE UPDATE ON awardees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procuring_entities_updated_at BEFORE UPDATE ON procuring_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. POPULATE SAMPLE DATA
-- =============================================

-- Insert sample awardees (only if they don't exist)
INSERT INTO awardees (company_name, registration_number, business_type, primary_categories, locations, team_size, annual_revenue_range, certifications, contact_email, contact_phone, website, is_active) 
SELECT * FROM (VALUES
    ('Higher Gov Ltd', 'URSB/2020/001', 'Limited Company', ARRAY['Information Technology', 'Construction'], ARRAY['Kampala', 'Nairobi'], 150, 'UGX 500M - 1B', ARRAY['ISO 9001', 'ISO 27001'], 'info@highergov.com', '+256-700-123-456', 'https://highergov.com', true),
    ('Tech Solutions Uganda', 'URSB/2019/045', 'Limited Company', ARRAY['Information Technology', 'Software Development'], ARRAY['Kampala'], 75, 'UGX 200M - 500M', ARRAY['ISO 9001'], 'contact@techsolutions.ug', '+256-700-234-567', 'https://techsolutions.ug', true),
    ('ABC Construction Ltd', 'URSB/2018/123', 'Limited Company', ARRAY['Construction & Engineering', 'Infrastructure'], ARRAY['Kampala', 'Mbarara', 'Gulu'], 200, 'UGX 1B - 2B', ARRAY['ISO 9001', 'OHSAS 18001'], 'info@abcconstruction.com', '+256-700-345-678', 'https://abcconstruction.com', true),
    ('Medical Supplies Co', 'URSB/2021/078', 'Limited Company', ARRAY['Healthcare & Medical', 'Supplies'], ARRAY['Kampala', 'Jinja'], 45, 'UGX 100M - 200M', ARRAY['ISO 13485'], 'sales@medsupplies.co.ug', '+256-700-456-789', 'https://medsupplies.co.ug', true),
    ('Digital Innovations', 'URSB/2022/156', 'Limited Company', ARRAY['Information Technology', 'Digital Services'], ARRAY['Kampala'], 60, 'UGX 150M - 300M', ARRAY['ISO 9001'], 'hello@digitalinnovations.ug', '+256-700-567-890', 'https://digitalinnovations.ug', true)
) AS v(company_name, registration_number, business_type, primary_categories, locations, team_size, annual_revenue_range, certifications, contact_email, contact_phone, website, is_active)
WHERE NOT EXISTS (SELECT 1 FROM awardees WHERE awardees.company_name = v.company_name);

-- Insert sample procuring entities (only if they don't exist)
INSERT INTO procuring_entities (entity_name, entity_type, contact_person, contact_email, contact_phone, website, location, annual_budget, is_active)
SELECT * FROM (VALUES
    ('Ministry of Health', 'ministry', 'Dr. Sarah Nakimera', 'procurement@health.go.ug', '+256-414-123-456', 'https://health.go.ug', 'Kampala', 50000000000, true),
    ('Uganda Registration Services Bureau', 'agency', 'Mustapher Ntale', 'procurement@ursb.go.ug', '+256-414-234-567', 'https://ursb.go.ug', 'Kampala', 15000000000, true),
    ('Ministry of Works and Transport', 'ministry', 'Eng. John Muwonge', 'procurement@works.go.ug', '+256-414-345-678', 'https://works.go.ug', 'Kampala', 80000000000, true),
    ('National Information Technology Authority', 'agency', 'Ms. Grace Nalukenge', 'procurement@nita.go.ug', '+256-414-456-789', 'https://nita.go.ug', 'Kampala', 25000000000, true),
    ('Kampala Capital City Authority', 'agency', 'Mr. David Luyimbazi', 'procurement@kcca.go.ug', '+256-414-567-890', 'https://kcca.go.ug', 'Kampala', 35000000000, true)
) AS v(entity_name, entity_type, contact_person, contact_email, contact_phone, website, location, annual_budget, is_active)
WHERE NOT EXISTS (SELECT 1 FROM procuring_entities WHERE procuring_entities.entity_name = v.entity_name);

-- Update existing contracts with award information (only if not already updated)
UPDATE contracts 
SET 
    awarded_to = 'Higher Gov Ltd',
    awarded_value = 50000000,
    award_date = '2024-01-15',
    contract_start_date = '2024-02-01',
    contract_end_date = '2024-08-01',
    completion_status = 'on_track',
    performance_rating = 4.2,
    total_bidders = 8,
    winning_bid_value = 50000000,
    technical_score = 85.5,
    financial_score = 92.0,
    awarded_company_id = (SELECT id FROM awardees WHERE company_name = 'Higher Gov Ltd' LIMIT 1),
    procuring_entity_id = (SELECT id FROM procuring_entities WHERE entity_name = 'Uganda Registration Services Bureau' LIMIT 1)
WHERE reference_number = 'URSB/SUPLS/2025-2026/00011' AND awarded_to IS NULL;

UPDATE contracts 
SET 
    awarded_to = 'Tech Solutions Uganda',
    awarded_value = 75000000,
    award_date = '2024-01-20',
    contract_start_date = '2024-02-15',
    contract_end_date = '2024-09-15',
    completion_status = 'on_track',
    performance_rating = 4.0,
    total_bidders = 12,
    winning_bid_value = 75000000,
    technical_score = 88.0,
    financial_score = 89.5,
    awarded_company_id = (SELECT id FROM awardees WHERE company_name = 'Tech Solutions Uganda' LIMIT 1),
    procuring_entity_id = (SELECT id FROM procuring_entities WHERE entity_name = 'Ministry of Health' LIMIT 1)
WHERE reference_number = 'MOH/SUPLS/2025-2026/00012' AND awarded_to IS NULL;

-- Add more sample contracts with award information (only if they don't exist)
INSERT INTO contracts (
    reference_number, title, short_description, category, procurement_method, 
    estimated_value_min, estimated_value_max, currency, procuring_entity, 
    submission_deadline, status, current_stage, publish_status,
    awarded_to, awarded_value, award_date, contract_start_date, contract_end_date,
    completion_status, performance_rating, total_bidders, winning_bid_value,
    technical_score, financial_score, awarded_company_id, procuring_entity_id
) 
SELECT * FROM (VALUES
    (
        'NITA/IT/2024/001', 'Digital Government Services Platform', 
        'Development of integrated digital services platform for government agencies',
        'Information Technology', 'Open Domestic Bidding', 200000000, 300000000, 'UGX',
        'National Information Technology Authority', '2024-02-15'::timestamp with time zone, 'awarded', 'awarded', 'published',
        'Digital Innovations', 250000000, '2024-02-20'::date, '2024-03-01'::date, '2024-12-01'::date,
        'on_track', 4.1, 10, 250000000, 86.0, 89.0, 
        (SELECT id FROM awardees WHERE company_name = 'Digital Innovations' LIMIT 1),
        (SELECT id FROM procuring_entities WHERE entity_name = 'National Information Technology Authority' LIMIT 1)
    ),
    (
        'KCCA/CONST/2024/002', 'Road Rehabilitation Project', 
        'Rehabilitation of major roads in Kampala Central Division',
        'Construction & Engineering', 'Open Domestic Bidding', 500000000, 800000000, 'UGX',
        'Kampala Capital City Authority', '2024-01-30'::timestamp with time zone, 'awarded', 'awarded', 'published',
        'ABC Construction Ltd', 650000000, '2024-02-05'::date, '2024-03-01'::date, '2024-11-01'::date,
        'on_track', 4.5, 15, 650000000, 90.0, 92.0, 
        (SELECT id FROM awardees WHERE company_name = 'ABC Construction Ltd' LIMIT 1),
        (SELECT id FROM procuring_entities WHERE entity_name = 'Kampala Capital City Authority' LIMIT 1)
    ),
    (
        'MOH/MED/2024/003', 'Medical Equipment Supply', 
        'Supply of advanced medical equipment for regional hospitals',
        'Healthcare & Medical', 'Open Domestic Bidding', 150000000, 250000000, 'UGX',
        'Ministry of Health', '2024-02-20'::timestamp with time zone, 'awarded', 'awarded', 'published',
        'Medical Supplies Co', 180000000, '2024-02-25'::date, '2024-03-15'::date, '2024-08-15'::date,
        'on_track', 4.3, 8, 180000000, 87.0, 91.0, 
        (SELECT id FROM awardees WHERE company_name = 'Medical Supplies Co' LIMIT 1),
        (SELECT id FROM procuring_entities WHERE entity_name = 'Ministry of Health' LIMIT 1)
    )
) AS v(reference_number, title, short_description, category, procurement_method, 
        estimated_value_min, estimated_value_max, currency, procuring_entity, 
        submission_deadline, status, current_stage, publish_status,
        awarded_to, awarded_value, award_date, contract_start_date, contract_end_date,
        completion_status, performance_rating, total_bidders, winning_bid_value,
        technical_score, financial_score, awarded_company_id, procuring_entity_id)
WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contracts.reference_number = v.reference_number);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Created tables: awardees, procuring_entities, competitor_bids, contract_performance, awardee_analysis';
    RAISE NOTICE 'Added 5 awardees, 5 procuring entities, and updated contracts with award information.';
    RAISE NOTICE 'You can now test the agency page at: http://localhost:3003/test-agencies';
END $$;
