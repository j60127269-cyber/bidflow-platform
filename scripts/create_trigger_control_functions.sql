-- Create functions to control the trigger
-- This allows us to temporarily disable the trigger during bulk imports

-- Function to disable the trigger
CREATE OR REPLACE FUNCTION disable_trigger()
RETURNS void AS $$
BEGIN
    -- Drop the trigger temporarily
    DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
    RAISE NOTICE 'Trigger disabled successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to enable the trigger
CREATE OR REPLACE FUNCTION enable_trigger()
RETURNS void AS $$
BEGIN
    -- Recreate the trigger
    DROP TRIGGER IF EXISTS trigger_resolve_contract_entities ON contracts;
    CREATE TRIGGER trigger_resolve_contract_entities
        AFTER INSERT OR UPDATE ON contracts
        FOR EACH ROW EXECUTE FUNCTION update_contract_relationships();
    RAISE NOTICE 'Trigger enabled successfully';
END;
$$ LANGUAGE plpgsql;

-- Verify the functions were created
DO $$
BEGIN
    RAISE NOTICE 'Trigger control functions created successfully!';
    RAISE NOTICE 'You can now use disable_trigger() and enable_trigger() RPC calls.';
END $$;
