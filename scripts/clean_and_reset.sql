-- CLEAN AND RESET FOR FRESH IMPORT
-- This script will safely delete existing contracts and reset the entity resolution system

-- 1. SHOW CURRENT STATE BEFORE DELETION
SELECT 
    'BEFORE DELETION - Current State:' as status,
    COUNT(*) as total_contracts,
    COUNT(CASE WHEN procuring_entity_resolved = true THEN 1 END) as resolved_entities,
    COUNT(CASE WHEN data_source = 'government_csv' THEN 1 END) as mowt_contracts
FROM contracts;

-- 2. SAFELY DELETE EXISTING CONTRACTS
-- First, delete related records to maintain referential integrity
DELETE FROM contract_lifecycle_events WHERE contract_id IN (
    SELECT id FROM contracts WHERE data_source = 'government_csv' OR data_source = 'historical'
);

DELETE FROM competitor_bids WHERE contract_id IN (
    SELECT id FROM contracts WHERE data_source = 'government_csv' OR data_source = 'historical'
);

DELETE FROM contract_performance WHERE contract_id IN (
    SELECT id FROM contracts WHERE data_source = 'government_csv' OR data_source = 'historical'
);

-- Now delete the contracts themselves
DELETE FROM contracts WHERE data_source = 'government_csv' OR data_source = 'historical';

-- 3. CLEAN UP ENTITY RESOLUTION DATA
DELETE FROM entity_resolution WHERE source_table = 'contracts';

-- 4. RESET ENTITY TABLES (optional - uncomment if you want to start fresh)
-- DELETE FROM awardees;
-- DELETE FROM procuring_entities;

-- 5. SHOW CLEAN STATE
SELECT 
    'AFTER DELETION - Clean State:' as status,
    COUNT(*) as remaining_contracts,
    COUNT(CASE WHEN procuring_entity_resolved = true THEN 1 END) as resolved_entities
FROM contracts;

-- 6. SHOW ENTITY COUNTS
SELECT 
    'Procuring Entities' as entity_type,
    COUNT(*) as count
FROM procuring_entities
UNION ALL
SELECT 
    'Awardees' as entity_type,
    COUNT(*) as count
FROM awardees;

-- 7. VERIFY TRIGGERS ARE STILL ACTIVE
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_resolve_contract_entities';

DO $$
BEGIN
    RAISE NOTICE 'Clean and reset completed successfully!';
    RAISE NOTICE 'You can now re-import your MOWT data.';
    RAISE NOTICE 'The entity resolution triggers will automatically process new contracts.';
    RAISE NOTICE 'Go to: Admin → Historical → Import to re-import your data.';
END $$;
