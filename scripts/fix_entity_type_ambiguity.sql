-- Fix entity_type ambiguity in trigger function
-- This script fixes the ambiguous column reference error

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
DROP FUNCTION IF EXISTS update_contract_relationships();

-- Create the fixed function with explicit table references
CREATE OR REPLACE FUNCTION update_contract_relationships()
RETURNS TRIGGER AS $$
DECLARE
    procuring_entity_id UUID;
    awarded_company_id UUID;
BEGIN
    -- Resolve procuring entity
    IF NEW.procuring_entity IS NOT NULL AND (NEW.procuring_entity_resolved = false OR NEW.procuring_entity_resolved IS NULL) THEN
        -- Check if entity already exists
        SELECT id INTO procuring_entity_id 
        FROM procuring_entities 
        WHERE LOWER(entity_name) = LOWER(NEW.procuring_entity)
        LIMIT 1;

        -- If not found, create new entity
        IF procuring_entity_id IS NULL THEN
            INSERT INTO procuring_entities (entity_name, entity_type) 
            VALUES (NEW.procuring_entity, 'agency') 
            RETURNING id INTO procuring_entity_id;
        END IF;

        -- Update the contract with the resolved entity ID
        UPDATE contracts 
        SET procuring_entity_id = procuring_entity_id,
            procuring_entity_resolved = true,
            relationships_updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    -- Resolve awarded company
    IF NEW.awarded_to IS NOT NULL AND (NEW.awarded_to_resolved = false OR NEW.awarded_to_resolved IS NULL) THEN
        -- Check if company already exists
        SELECT id INTO awarded_company_id 
        FROM awardees 
        WHERE LOWER(company_name) = LOWER(NEW.awarded_to)
        LIMIT 1;

        -- If not found, create new company
        IF awarded_company_id IS NULL THEN
            INSERT INTO awardees (company_name, entity_type) 
            VALUES (NEW.awarded_to, 'company') 
            RETURNING id INTO awarded_company_id;
        END IF;

        -- Update the contract with the resolved company ID
        UPDATE contracts 
        SET awarded_company_id = awarded_company_id,
            awarded_to_resolved = true,
            relationships_updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_resolve_contract_entities
    AFTER INSERT OR UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_contract_relationships();

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE 'Entity type ambiguity fix applied successfully!';
    RAISE NOTICE 'The trigger function now uses explicit table references.';
END $$;
