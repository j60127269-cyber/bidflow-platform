-- Enhance Database Schema for Historical Data Processing
-- This script adds fields needed for government CSV imports and historical data

-- =============================================
-- 1. ENHANCE AWARDEES TABLE
-- =============================================

-- Add business classification fields
ALTER TABLE awardees 
ADD COLUMN IF NOT EXISTS female_owned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_classification TEXT;

-- Add index for business classification
CREATE INDEX IF NOT EXISTS idx_awardees_business_classification ON awardees(business_classification);
CREATE INDEX IF NOT EXISTS idx_awardees_female_owned ON awardees(female_owned);

-- =============================================
-- 2. ENHANCE CONTRACTS TABLE
-- =============================================

-- Add data source tracking fields
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_file TEXT,
ADD COLUMN IF NOT EXISTS fiscal_year TEXT,
ADD COLUMN IF NOT EXISTS import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for data source tracking
CREATE INDEX IF NOT EXISTS idx_contracts_data_source ON contracts(data_source);
CREATE INDEX IF NOT EXISTS idx_contracts_fiscal_year ON contracts(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_contracts_import_date ON contracts(import_date);

-- =============================================
-- 3. ENHANCE PROCURING_ENTITIES TABLE
-- =============================================

-- Add data source tracking
ALTER TABLE procuring_entities 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_file TEXT;

-- Add index for data source tracking
CREATE INDEX IF NOT EXISTS idx_procuring_entities_data_source ON procuring_entities(data_source);

-- =============================================
-- 4. CREATE DATA IMPORT LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS data_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_type TEXT NOT NULL, -- 'government_csv', 'manual', 'scraper'
    source_file TEXT,
    fiscal_year TEXT,
    total_records INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    errors JSONB,
    import_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for import logs
CREATE INDEX IF NOT EXISTS idx_data_import_logs_import_type ON data_import_logs(import_type);
CREATE INDEX IF NOT EXISTS idx_data_import_logs_fiscal_year ON data_import_logs(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_data_import_logs_status ON data_import_logs(import_status);

-- =============================================
-- 5. CREATE ENTITY MAPPING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS entity_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'awardee', 'procuring_entity'
    source_name TEXT NOT NULL, -- Name from source (e.g., CSV)
    mapped_id UUID NOT NULL, -- ID in our database
    confidence_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    mapping_method TEXT DEFAULT 'exact', -- 'exact', 'fuzzy', 'manual'
    source_file TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for entity mappings
CREATE INDEX IF NOT EXISTS idx_entity_mappings_entity_type ON entity_mappings(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_mappings_source_name ON entity_mappings(source_name);
CREATE INDEX IF NOT EXISTS idx_entity_mappings_mapped_id ON entity_mappings(mapped_id);

-- Add trigger for updated_at
CREATE TRIGGER update_entity_mappings_updated_at 
    BEFORE UPDATE ON entity_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. ADD RLS POLICIES FOR NEW TABLES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE data_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_mappings ENABLE ROW LEVEL SECURITY;

-- Data import logs - only admins can view
CREATE POLICY "Admins can view data import logs" ON data_import_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can insert data import logs" ON data_import_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update data import logs" ON data_import_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Entity mappings - only admins can view
CREATE POLICY "Admins can view entity mappings" ON entity_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can insert entity mappings" ON entity_mappings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update entity mappings" ON entity_mappings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- 7. NOTIFICATION
-- =============================================

DO $$ 
BEGIN
    RAISE NOTICE 'Enhanced database schema for historical data processing created successfully!';
    RAISE NOTICE 'Added fields:';
    RAISE NOTICE '- awardees: female_owned, business_classification';
    RAISE NOTICE '- contracts: data_source, source_file, fiscal_year, import_date';
    RAISE NOTICE '- procuring_entities: data_source, source_file';
    RAISE NOTICE '- New tables: data_import_logs, entity_mappings';
END $$;
