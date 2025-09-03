-- PROCESS EXISTING CONTRACTS FOR ENTITY RESOLUTION
-- This script will process all existing contracts and resolve their entities

-- 1. FIRST, LET'S PROCESS ALL EXISTING CONTRACTS
DO $$
DECLARE
    contract_record RECORD;
    procuring_entity_id UUID;
    awarded_company_id UUID;
    processed_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting to process existing contracts for entity resolution...';
    
    -- Loop through all contracts that haven't been resolved yet
    FOR contract_record IN 
        SELECT id, procuring_entity, awarded_to, procuring_entity_resolved, awarded_to_resolved
        FROM contracts 
        WHERE (procuring_entity_resolved = false OR procuring_entity_resolved IS NULL)
           OR (awarded_to_resolved = false OR awarded_to_resolved IS NULL)
    LOOP
        -- Process procuring entity if not resolved
        IF (contract_record.procuring_entity_resolved = false OR contract_record.procuring_entity_resolved IS NULL) 
           AND contract_record.procuring_entity IS NOT NULL THEN
            
            -- Try to find existing procuring entity first
            SELECT id INTO procuring_entity_id 
            FROM procuring_entities 
            WHERE LOWER(entity_name) = LOWER(contract_record.procuring_entity)
            LIMIT 1;
            
            -- If not found, create new one
            IF procuring_entity_id IS NULL THEN
                INSERT INTO procuring_entities (entity_name) 
                VALUES (contract_record.procuring_entity) 
                RETURNING id INTO procuring_entity_id;
            END IF;
            
            -- Update contract with resolved entity
            UPDATE contracts 
            SET procuring_entity_id = procuring_entity_id,
                procuring_entity_resolved = true,
                relationships_updated_at = NOW()
            WHERE id = contract_record.id;
        END IF;
        
        -- Process awarded company if not resolved
        IF (contract_record.awarded_to_resolved = false OR contract_record.awarded_to_resolved IS NULL) 
           AND contract_record.awarded_to IS NOT NULL 
           AND contract_record.awarded_to != 'Not awarded' THEN
            
            -- Try to find existing awardee first
            SELECT id INTO awarded_company_id 
            FROM awardees 
            WHERE LOWER(company_name) = LOWER(contract_record.awarded_to)
            LIMIT 1;
            
            -- If not found, create new one
            IF awarded_company_id IS NULL THEN
                INSERT INTO awardees (company_name) 
                VALUES (contract_record.awarded_to) 
                RETURNING id INTO awarded_company_id;
            END IF;
            
            -- Update contract with resolved entity
            UPDATE contracts 
            SET awarded_company_id = awarded_company_id,
                awarded_to_resolved = true,
                relationships_updated_at = NOW()
            WHERE id = contract_record.id;
        END IF;
        
        processed_count := processed_count + 1;
        
        -- Log progress every 50 contracts
        IF processed_count % 50 = 0 THEN
            RAISE NOTICE 'Processed % contracts...', processed_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Finished processing % contracts for entity resolution', processed_count;
END $$;

-- 2. UPDATE DATA QUALITY SCORES FOR ALL CONTRACTS
UPDATE contracts 
SET data_quality_score = CASE 
    WHEN procuring_entity IS NOT NULL 
         AND reference_number IS NOT NULL 
         AND title IS NOT NULL 
         AND procuring_entity_resolved = true 
         AND (awarded_to IS NULL OR awarded_to_resolved = true) THEN 1.0
    WHEN procuring_entity IS NOT NULL 
         AND reference_number IS NOT NULL 
         AND title IS NOT NULL THEN 0.8
    WHEN procuring_entity IS NOT NULL 
         AND title IS NOT NULL THEN 0.6
    ELSE 0.4
END
WHERE data_quality_score IS NULL OR data_quality_score = 0;

-- 3. SHOW SUMMARY STATISTICS
SELECT 
    COUNT(*) as total_contracts,
    COUNT(CASE WHEN procuring_entity_resolved = true THEN 1 END) as procuring_entities_resolved,
    COUNT(CASE WHEN awarded_to_resolved = true THEN 1 END) as awardees_resolved,
    COUNT(CASE WHEN procuring_entity_resolved = true AND awarded_to_resolved = true THEN 1 END) as fully_resolved,
    COUNT(CASE WHEN procuring_entity_resolved = true AND (awarded_to IS NULL OR awarded_to_resolved = true) THEN 1 END) as effectively_resolved,
    ROUND(AVG(data_quality_score) * 100, 1) as avg_quality_score_percent
FROM contracts;

-- 4. SHOW ENTITY STATISTICS
SELECT 
    'Procuring Entities' as entity_type,
    COUNT(*) as total_entities,
    COUNT(DISTINCT entity_name) as unique_entities
FROM procuring_entities
UNION ALL
SELECT 
    'Awardees' as entity_type,
    COUNT(*) as total_entities,
    COUNT(DISTINCT company_name) as unique_entities
FROM awardees;

-- 5. SHOW SAMPLE RESOLVED CONTRACTS
SELECT 
    reference_number,
    title,
    procuring_entity,
    procuring_entity_resolved,
    awarded_to,
    awarded_to_resolved,
    data_quality_score,
    relationships_updated_at
FROM contracts 
WHERE procuring_entity_resolved = true 
   OR awarded_to_resolved = true
ORDER BY relationships_updated_at DESC
LIMIT 10;

DO $$
BEGIN
    RAISE NOTICE 'Entity resolution processing completed!';
    RAISE NOTICE 'Check the summary statistics above to see the results.';
    RAISE NOTICE 'Refresh your Data Management dashboard to see updated metrics.';
END $$;
