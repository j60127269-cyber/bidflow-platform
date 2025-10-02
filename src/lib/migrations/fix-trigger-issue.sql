-- Quick fix for trigger already exists error
-- Run this BEFORE running the main notification queue migration

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trg_contract_version_increment ON contracts;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS trigger_increment_contract_version();

-- Now you can run the main notification-queue-system-fixed.sql migration
-- This will create the trigger and function fresh without conflicts
