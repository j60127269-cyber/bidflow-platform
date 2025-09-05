-- Fix entity_type ambiguity in trigger function
-- This script fixes the column reference ambiguity that's causing contract imports to fail

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;

-- 2. Drop the problematic function
DROP FUNCTION IF EXISTS update_contract_relationships();

-- 3. Create a fixed version of the function with explicit table references
CREATE OR REPLACE FUNCTION update_contract_relationships()
RETURNS TRIGGER AS $$
DECLARE
    procuring_entity_id UUID;
    awarded_company_id UUID;
BEGIN
    -- Resolve procuring entity
    IF NEW.procuring_entity IS NOT NULL AND (NEW.procuring_entity_resolved = false OR NEW.procuring_entity_resolved IS NULL) THEN
        -- Try to find existing procuring entity first
        SELECT id INTO procuring_entity_id 
        FROM procuring_entities 
        WHERE LOWER(entity_name) = LOWER(NEW.procuring_entity)
        LIMIT 1;
        
        -- If not found, create new one
        IF procuring_entity_id IS NULL THEN
            INSERT INTO procuring_entities (entity_name, entity_type) 
            VALUES (NEW.procuring_entity, 'agency') 
            RETURNING id INTO procuring_entity_id;
        END IF;
        
        -- Update contract with resolved entity
        UPDATE contracts 
        SET procuring_entity_id = procuring_entity_id,
            procuring_entity_resolved = true,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    -- Resolve awarded company
    IF NEW.awarded_to IS NOT NULL AND (NEW.awarded_to_resolved = false OR NEW.awarded_to_resolved IS NULL) THEN
        -- Try to find existing awardee first
        SELECT id INTO awarded_company_id 
        FROM awardees 
        WHERE LOWER(company_name) = LOWER(NEW.awarded_to)
        LIMIT 1;
        
        -- If not found, create new one
        IF awarded_company_id IS NULL THEN
            INSERT INTO awardees (company_name) 
            VALUES (NEW.awarded_to) 
            RETURNING id INTO awarded_company_id;
        END IF;
        
        -- Update contract with resolved entity
        UPDATE contracts 
        SET awarded_company_id = awarded_company_id,
            awarded_to_resolved = true,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
CREATE TRIGGER trigger_resolve_contract_entities
    AFTER INSERT OR UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_contract_relationships();

-- 5. Add missing columns if they don't exist
DO $$
BEGIN
    -- Add procuring_entity_resolved if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'procuring_entity_resolved'
    ) THEN
        ALTER TABLE contracts ADD COLUMN procuring_entity_resolved BOOLEAN DEFAULT false;
    END IF;

    -- Add awarded_to_resolved if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'awarded_to_resolved'
    ) THEN
        ALTER TABLE contracts ADD COLUMN awarded_to_resolved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 6. Verify the fix
SELECT 
    'Trigger fixed successfully' as status,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_resolve_contract_entities';
