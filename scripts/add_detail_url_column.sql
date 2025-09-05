-- Add detail_url column to contracts table
-- This script adds the detail_url field to store original EGP portal links

DO $$
BEGIN
    -- Add detail_url field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'detail_url'
    ) THEN
        ALTER TABLE contracts ADD COLUMN detail_url TEXT;
        RAISE NOTICE 'Added detail_url column to contracts table';
    ELSE
        RAISE NOTICE 'detail_url column already exists in contracts table';
    END IF;
END $$;

-- Add a comment to document the column purpose
COMMENT ON COLUMN contracts.detail_url IS 'Link to the original contract details on the procurement portal (e.g., EGP Uganda)';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' AND column_name = 'detail_url';
