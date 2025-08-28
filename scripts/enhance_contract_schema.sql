-- Enhanced Contract Schema and Competitive Intelligence Tables
-- This script should be run in your Supabase SQL editor

-- 1. ENHANCE EXISTING CONTRACTS TABLE
-- Add new fields to existing contracts table for award information

DO $$
BEGIN
    -- Add awarded_to field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'awarded_to'
    ) THEN
        ALTER TABLE contracts ADD COLUMN awarded_to VARCHAR(255);
        RAISE NOTICE 'Added awarded_to column to contracts table';
    END IF;

    -- Add awarded_value field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'awarded_value'
    ) THEN
        ALTER TABLE contracts ADD COLUMN awarded_value DECIMAL(15,2);
        RAISE NOTICE 'Added awarded_value column to contracts table';
    END IF;

    -- Add award_date field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'award_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN award_date DATE;
        RAISE NOTICE 'Added award_date column to contracts table';
    END IF;

    -- Add contract_start_date field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'contract_start_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN contract_start_date DATE;
        RAISE NOTICE 'Added contract_start_date column to contracts table';
    END IF;

    -- Add contract_end_date field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'contract_end_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN contract_end_date DATE;
        RAISE NOTICE 'Added contract_end_date column to contracts table';
    END IF;

    -- Add completion_status field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'completion_status'
    ) THEN
        ALTER TABLE contracts ADD COLUMN completion_status VARCHAR(50);
        RAISE NOTICE 'Added completion_status column to contracts table';
    END IF;

    -- Add performance_rating field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'performance_rating'
    ) THEN
        ALTER TABLE contracts ADD COLUMN performance_rating DECIMAL(3,2);
        RAISE NOTICE 'Added performance_rating column to contracts table';
    END IF;

    -- Add total_bidders field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'total_bidders'
    ) THEN
        ALTER TABLE contracts ADD COLUMN total_bidders INTEGER;
        RAISE NOTICE 'Added total_bidders column to contracts table';
    END IF;

    -- Add winning_bid_value field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'winning_bid_value'
    ) THEN
        ALTER TABLE contracts ADD COLUMN winning_bid_value DECIMAL(15,2);
        RAISE NOTICE 'Added winning_bid_value column to contracts table';
    END IF;

    -- Add technical_score field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'technical_score'
    ) THEN
        ALTER TABLE contracts ADD COLUMN technical_score DECIMAL(5,2);
        RAISE NOTICE 'Added technical_score column to contracts table';
    END IF;

    -- Add financial_score field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'financial_score'
    ) THEN
        ALTER TABLE contracts ADD COLUMN financial_score DECIMAL(5,2);
        RAISE NOTICE 'Added financial_score column to contracts table';
    END IF;

    -- Add procuring_entity_id field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'procuring_entity_id'
    ) THEN
        ALTER TABLE contracts ADD COLUMN procuring_entity_id UUID;
        RAISE NOTICE 'Added procuring_entity_id column to contracts table';
    END IF;

    -- Add awarded_company_id field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'awarded_company_id'
    ) THEN
        ALTER TABLE contracts ADD COLUMN awarded_company_id UUID;
        RAISE NOTICE 'Added awarded_company_id column to contracts table';
    END IF;

END $$;

-- 2. CREATE AWARDEES TABLE
CREATE TABLE IF NOT EXISTS awardees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    business_type VARCHAR(100),
    primary_categories TEXT[],
    locations TEXT[],
    team_size INTEGER,
    annual_revenue_range VARCHAR(50),
    certifications TEXT[],
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    social_media JSONB,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CREATE PROCURING ENTITIES TABLE
CREATE TABLE IF NOT EXISTS procuring_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50), -- 'ministry', 'agency', 'department', 'parastatal'
    parent_entity_id UUID REFERENCES procuring_entities(id),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    location VARCHAR(255),
    annual_budget DECIMAL(15,2),
    procurement_patterns JSONB,
    preferred_suppliers TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREATE COMPETITOR BIDS TABLE
CREATE TABLE IF NOT EXISTS competitor_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    awardee_id UUID REFERENCES awardees(id),
    bid_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'UGX',
    bid_status VARCHAR(50), -- 'submitted', 'shortlisted', 'awarded', 'rejected'
    technical_score DECIMAL(5,2),
    financial_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    ranking INTEGER,
    bid_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. CREATE CONTRACT PERFORMANCE TABLE
CREATE TABLE IF NOT EXISTS contract_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    reporting_period DATE,
    progress_percentage DECIMAL(5,2),
    quality_score DECIMAL(3,2),
    timeline_adherence BOOLEAN,
    budget_adherence BOOLEAN,
    issues_raised TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. CREATE AWARDEE ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS awardee_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    awardee_id UUID REFERENCES awardees(id),
    period_start DATE,
    period_end DATE,
    total_bids INTEGER,
    wins INTEGER,
    win_rate DECIMAL(5,2),
    average_bid_value DECIMAL(15,2),
    preferred_categories TEXT[],
    preferred_procuring_entities TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contracts_awarded_to ON contracts(awarded_to);
CREATE INDEX IF NOT EXISTS idx_contracts_award_date ON contracts(award_date);
CREATE INDEX IF NOT EXISTS idx_contracts_procuring_entity_id ON contracts(procuring_entity_id);
CREATE INDEX IF NOT EXISTS idx_contracts_awarded_company_id ON contracts(awarded_company_id);
CREATE INDEX IF NOT EXISTS idx_awardees_company_name ON awardees(company_name);
CREATE INDEX IF NOT EXISTS idx_procuring_entities_entity_name ON procuring_entities(entity_name);
CREATE INDEX IF NOT EXISTS idx_competitor_bids_contract_id ON competitor_bids(contract_id);
CREATE INDEX IF NOT EXISTS idx_competitor_bids_awardee_id ON competitor_bids(awardee_id);
CREATE INDEX IF NOT EXISTS idx_contract_performance_contract_id ON contract_performance(contract_id);
CREATE INDEX IF NOT EXISTS idx_awardee_analysis_awardee_id ON awardee_analysis(awardee_id);

-- 8. CREATE UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. CREATE TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_awardees_updated_at BEFORE UPDATE ON awardees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procuring_entities_updated_at BEFORE UPDATE ON procuring_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_bids_updated_at BEFORE UPDATE ON competitor_bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_performance_updated_at BEFORE UPDATE ON contract_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_awardee_analysis_updated_at BEFORE UPDATE ON awardee_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. CREATE ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE awardees ENABLE ROW LEVEL SECURITY;
ALTER TABLE procuring_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE awardee_analysis ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read awardees
CREATE POLICY "Allow authenticated users to read awardees" ON awardees
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read procuring entities
CREATE POLICY "Allow authenticated users to read procuring_entities" ON procuring_entities
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read competitor bids
CREATE POLICY "Allow authenticated users to read competitor_bids" ON competitor_bids
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read contract performance
CREATE POLICY "Allow authenticated users to read contract_performance" ON contract_performance
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read awardee analysis
CREATE POLICY "Allow authenticated users to read awardee_analysis" ON awardee_analysis
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to insert/update/delete
CREATE POLICY "Allow admins to manage awardees" ON awardees
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Allow admins to manage procuring_entities" ON procuring_entities
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Allow admins to manage competitor_bids" ON competitor_bids
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Allow admins to manage contract_performance" ON contract_performance
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Allow admins to manage awardee_analysis" ON awardee_analysis
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

DO $$
BEGIN
    RAISE NOTICE 'Enhanced contract schema and competitive intelligence tables created successfully!';
END $$;
