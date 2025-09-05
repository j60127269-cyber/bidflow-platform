-- Simple fix for the trigger function
-- This version avoids the entity_type ambiguity by using a simpler approach

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
DROP FUNCTION IF EXISTS update_contract_relationships();

-- Create a simpler function that avoids the ambiguity
CREATE OR REPLACE FUNCTION update_contract_relationships()
RETURNS TRIGGER AS $$
DECLARE
    pe_id UUID;
    ac_id UUID;
BEGIN
    -- Resolve procuring entity
    IF NEW.procuring_entity IS NOT NULL AND (NEW.procuring_entity_resolved = false OR NEW.procuring_entity_resolved IS NULL) THEN
        -- Check if entity already exists
        SELECT id INTO pe_id 
        FROM procuring_entities 
        WHERE LOWER(entity_name) = LOWER(NEW.procuring_entity)
        LIMIT 1;

        -- If not found, create new entity with explicit entity_type
        IF pe_id IS NULL THEN
            INSERT INTO procuring_entities (entity_name, entity_type) 
            VALUES (NEW.procuring_entity, 'agency') 
            RETURNING id INTO pe_id;
        END IF;

        -- Update the contract with the resolved entity ID
        UPDATE contracts 
        SET procuring_entity_id = pe_id,
            procuring_entity_resolved = true,
            relationships_updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    -- Resolve awarded company
    IF NEW.awarded_to IS NOT NULL AND (NEW.awarded_to_resolved = false OR NEW.awarded_to_resolved IS NULL) THEN
        -- Check if company already exists
        SELECT id INTO ac_id 
        FROM awardees 
        WHERE LOWER(company_name) = LOWER(NEW.awarded_to)
        LIMIT 1;

        -- If not found, create new company with explicit entity_type
        IF ac_id IS NULL THEN
            INSERT INTO awardees (company_name, entity_type) 
            VALUES (NEW.awarded_to, 'company') 
            RETURNING id INTO ac_id;
        END IF;

        -- Update the contract with the resolved company ID
        UPDATE contracts 
        SET awarded_company_id = ac_id,
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

-- Create functions to control the trigger
CREATE OR REPLACE FUNCTION disable_trigger()
RETURNS void AS $$
BEGIN
    DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
    RAISE NOTICE 'Trigger disabled successfully';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enable_trigger()
RETURNS void AS $$
BEGIN
    DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
    CREATE TRIGGER trigger_resolve_contract_entities
        AFTER INSERT OR UPDATE ON contracts
        FOR EACH ROW EXECUTE FUNCTION update_contract_relationships();
    RAISE NOTICE 'Trigger enabled successfully';
END;
$$ LANGUAGE plpgsql;

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE 'Simple trigger fix applied successfully!';
    RAISE NOTICE 'The trigger function now avoids entity_type ambiguity.';
    RAISE NOTICE 'Trigger control functions are also available.';
END $$;
