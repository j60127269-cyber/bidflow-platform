-- IMPROVED DATA RELATIONSHIPS AND ENTITY MANAGEMENT
-- This script enhances data connections and creates better entity resolution

-- 1. CREATE ENTITY RESOLUTION TABLE
CREATE TABLE IF NOT EXISTS entity_resolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'procuring_entity', 'awardee', 'company'
    original_name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    canonical_entity_id UUID, -- Links to the main entity record
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    resolution_method VARCHAR(50), -- 'exact_match', 'fuzzy_match', 'manual', 'import'
    source_table VARCHAR(50), -- Which table this came from
    source_record_id UUID, -- ID of the source record
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE ENTITY ALIASES TABLE
CREATE TABLE IF NOT EXISTS entity_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    canonical_entity_id UUID NOT NULL,
    alias_name VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50), -- 'abbreviation', 'legal_name', 'trading_name', 'common_name'
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENHANCE CONTRACTS TABLE WITH BETTER RELATIONSHIPS
DO $$
BEGIN
    -- Add entity resolution tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'procuring_entity_resolved'
    ) THEN
        ALTER TABLE contracts ADD COLUMN procuring_entity_resolved BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'awarded_to_resolved'
    ) THEN
        ALTER TABLE contracts ADD COLUMN awarded_to_resolved BOOLEAN DEFAULT false;
    END IF;

    -- Add data quality indicators
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'data_quality_score'
    ) THEN
        ALTER TABLE contracts ADD COLUMN data_quality_score DECIMAL(3,2) DEFAULT 1.0;
    END IF;

    -- Add relationship tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'relationships_updated_at'
    ) THEN
        ALTER TABLE contracts ADD COLUMN relationships_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. CREATE ENTITY RESOLUTION FUNCTIONS
CREATE OR REPLACE FUNCTION normalize_entity_name(entity_name TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Remove common prefixes/suffixes
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(entity_name, '^(Ltd|Limited|Inc|Corp|Corporation|Company|Co\.?)\s*', '', 'gi'),
                    '\s+(Ltd|Limited|Inc|Corp|Corporation|Company|Co\.?)$', '', 'gi'
                ),
                '[^\w\s]', '', 'g'
            ),
            '\s+', ' ', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE FUNCTION TO RESOLVE ENTITIES
CREATE OR REPLACE FUNCTION resolve_entity(
    entity_name TEXT,
    entity_type VARCHAR(50),
    source_table VARCHAR(50),
    source_record_id UUID
)
RETURNS UUID AS $$
DECLARE
    normalized_name TEXT;
    existing_entity_id UUID;
    new_entity_id UUID;
    confidence DECIMAL(3,2);
BEGIN
    -- Normalize the entity name
    normalized_name := normalize_entity_name(entity_name);
    
    -- Check for exact match in entity resolution table
    SELECT canonical_entity_id INTO existing_entity_id
    FROM entity_resolution
    WHERE entity_type = resolve_entity.entity_type
    AND normalized_name = entity_resolution.normalized_name
    AND is_active = true
    ORDER BY confidence_score DESC
    LIMIT 1;
    
    -- If found, return the canonical entity ID
    IF existing_entity_id IS NOT NULL THEN
        -- Log this resolution
        INSERT INTO entity_resolution (
            entity_type, original_name, normalized_name, canonical_entity_id,
            confidence_score, resolution_method, source_table, source_record_id
        ) VALUES (
            resolve_entity.entity_type, entity_name, normalized_name, existing_entity_id,
            1.0, 'exact_match', source_table, source_record_id
        );
        
        RETURN existing_entity_id;
    END IF;
    
    -- Check for fuzzy match (similarity > 0.8)
    SELECT canonical_entity_id INTO existing_entity_id
    FROM entity_resolution
    WHERE entity_type = resolve_entity.entity_type
    AND is_active = true
    AND similarity(normalized_name, entity_resolution.normalized_name) > 0.8
    ORDER BY similarity(normalized_name, entity_resolution.normalized_name) DESC, confidence_score DESC
    LIMIT 1;
    
    IF existing_entity_id IS NOT NULL THEN
        confidence := similarity(normalized_name, 
            (SELECT normalized_name FROM entity_resolution WHERE canonical_entity_id = existing_entity_id LIMIT 1)
        );
        
        -- Log this resolution
        INSERT INTO entity_resolution (
            entity_type, original_name, normalized_name, canonical_entity_id,
            confidence_score, resolution_method, source_table, source_record_id
        ) VALUES (
            resolve_entity.entity_type, entity_name, normalized_name, existing_entity_id,
            confidence, 'fuzzy_match', source_table, source_record_id
        );
        
        RETURN existing_entity_id;
    END IF;
    
    -- Create new entity if no match found
    IF entity_type = 'procuring_entity' THEN
        INSERT INTO procuring_entities (entity_name) VALUES (entity_name) RETURNING id INTO new_entity_id;
    ELSIF entity_type = 'awardee' THEN
        INSERT INTO awardees (company_name) VALUES (entity_name) RETURNING id INTO new_entity_id;
    END IF;
    
    -- Log the new entity
    INSERT INTO entity_resolution (
        entity_type, original_name, normalized_name, canonical_entity_id,
        confidence_score, resolution_method, source_table, source_record_id
    ) VALUES (
        resolve_entity.entity_type, entity_name, normalized_name, new_entity_id,
        1.0, 'new_entity', source_table, source_record_id
    );
    
    RETURN new_entity_id;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE FUNCTION TO UPDATE CONTRACT RELATIONSHIPS
CREATE OR REPLACE FUNCTION update_contract_relationships()
RETURNS TRIGGER AS $$
DECLARE
    procuring_entity_id UUID;
    awarded_company_id UUID;
BEGIN
    -- Resolve procuring entity
    IF NEW.procuring_entity IS NOT NULL AND NEW.procuring_entity_resolved = false THEN
        procuring_entity_id := resolve_entity(
            NEW.procuring_entity, 
            'procuring_entity', 
            'contracts', 
            NEW.id
        );
        
        UPDATE contracts 
        SET procuring_entity_id = procuring_entity_id,
            procuring_entity_resolved = true,
            relationships_updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    -- Resolve awarded company
    IF NEW.awarded_to IS NOT NULL AND NEW.awarded_to_resolved = false THEN
        awarded_company_id := resolve_entity(
            NEW.awarded_to, 
            'awardee', 
            'contracts', 
            NEW.id
        );
        
        UPDATE contracts 
        SET awarded_company_id = awarded_company_id,
            awarded_to_resolved = true,
            relationships_updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE TRIGGER TO AUTO-RESOLVE ENTITIES
DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
CREATE TRIGGER trigger_resolve_contract_entities
    AFTER INSERT OR UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_contract_relationships();

-- 8. CREATE VIEW FOR ENTITY RELATIONSHIPS
DROP VIEW IF EXISTS entity_relationships_view;
CREATE OR REPLACE VIEW entity_relationships_view AS
SELECT 
    c.id as contract_id,
    c.reference_number,
    c.title,
    c.procuring_entity,
    c.procuring_entity_id,
    pe.entity_name as resolved_procuring_entity,
    c.awarded_to,
    c.awarded_company_id,
    a.company_name as resolved_awardee,
    c.procuring_entity_resolved,
    c.awarded_to_resolved,
    c.data_quality_score,
    c.relationships_updated_at
FROM contracts c
LEFT JOIN procuring_entities pe ON c.procuring_entity_id = pe.id
LEFT JOIN awardees a ON c.awarded_company_id = a.id;

-- 9. CREATE VIEW FOR COMPETITIVE INTELLIGENCE
DROP VIEW IF EXISTS competitive_intelligence_view;
CREATE OR REPLACE VIEW competitive_intelligence_view AS
SELECT 
    c.id as contract_id,
    c.reference_number,
    c.title,
    c.procuring_entity,
    c.awarded_to,
    c.awarded_value,
    c.total_bidders,
    c.total_bids_received,
    COUNT(cb.id) as actual_bids,
    COUNT(CASE WHEN cb.bid_status = 'awarded' THEN 1 END) as winning_bids,
    COUNT(CASE WHEN cb.bid_status = 'rejected' THEN 1 END) as rejected_bids,
    MIN(cb.bid_value) as lowest_bid,
    MAX(cb.bid_value) as highest_bid,
    AVG(cb.bid_value) as average_bid_value,
    c.awarded_value - MIN(cb.bid_value) as savings_vs_lowest,
    (MAX(cb.bid_value) - c.awarded_value) / NULLIF(MAX(cb.bid_value), 0) * 100 as savings_percentage
FROM contracts c
LEFT JOIN competitor_bids cb ON c.id = cb.contract_id
WHERE c.status IN ('awarded', 'completed')
GROUP BY c.id, c.reference_number, c.title, c.procuring_entity, c.awarded_to,
         c.awarded_value, c.total_bidders, c.total_bids_received;

-- 10. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_entity_resolution_entity_type ON entity_resolution(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_resolution_normalized_name ON entity_resolution(normalized_name);
CREATE INDEX IF NOT EXISTS idx_entity_resolution_canonical_id ON entity_resolution(canonical_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_canonical_id ON entity_aliases(canonical_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_alias_name ON entity_aliases(alias_name);

-- 11. CREATE RLS POLICIES
ALTER TABLE entity_resolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_aliases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read entity_resolution" ON entity_resolution;
DROP POLICY IF EXISTS "Allow authenticated users to read entity_aliases" ON entity_aliases;
DROP POLICY IF EXISTS "Allow admins to manage entity_resolution" ON entity_resolution;
DROP POLICY IF EXISTS "Allow admins to manage entity_aliases" ON entity_aliases;

-- Allow all authenticated users to read entity resolution data
CREATE POLICY "Allow authenticated users to read entity_resolution" ON entity_resolution
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read entity_aliases" ON entity_aliases
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage entity resolution data
CREATE POLICY "Allow admins to manage entity_resolution" ON entity_resolution
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Allow admins to manage entity_aliases" ON entity_aliases
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

-- 12. CREATE TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_entity_resolution_updated_at ON entity_resolution;
CREATE TRIGGER update_entity_resolution_updated_at 
    BEFORE UPDATE ON entity_resolution 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE 'Improved data relationships and entity management system created successfully!';
    RAISE NOTICE 'Entity resolution will now automatically link contracts to proper entities.';
    RAISE NOTICE 'Use the entity_relationships_view to see all connections.';
    RAISE NOTICE 'Use the competitive_intelligence_view for bidding analysis.';
END $$;
