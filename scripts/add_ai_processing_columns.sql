-- Add AI processing columns to contracts table
-- This script adds columns for AI-generated summaries and category classification

-- Add AI processing columns to contracts table
DO $$ 
BEGIN
    -- Add ai_summary_short column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'ai_summary_short'
    ) THEN
        ALTER TABLE contracts ADD COLUMN ai_summary_short TEXT;
    END IF;

    -- Add ai_category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'ai_category'
    ) THEN
        ALTER TABLE contracts ADD COLUMN ai_category TEXT;
    END IF;

    -- Add ai_processing_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'ai_processing_status'
    ) THEN
        ALTER TABLE contracts ADD COLUMN ai_processing_status TEXT DEFAULT 'pending';
    END IF;

    -- Add ai_processed_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'ai_processed_at'
    ) THEN
        ALTER TABLE contracts ADD COLUMN ai_processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add comments to the new columns
COMMENT ON COLUMN contracts.ai_summary_short IS 'AI-generated short description of the contract';
COMMENT ON COLUMN contracts.ai_category IS 'AI-suggested category classification';
COMMENT ON COLUMN contracts.ai_processing_status IS 'Status of AI processing: pending, processing, completed, failed';
COMMENT ON COLUMN contracts.ai_processed_at IS 'Timestamp when AI processing was completed';

-- Create index for AI processing status
CREATE INDEX IF NOT EXISTS idx_contracts_ai_processing_status 
ON contracts(ai_processing_status);

-- Create index for AI processed date
CREATE INDEX IF NOT EXISTS idx_contracts_ai_processed_at 
ON contracts(ai_processed_at);

-- Update RLS policies to allow access to AI processing columns
-- (Assuming existing RLS policies already cover the contracts table)

-- Add a function to update AI processing status
CREATE OR REPLACE FUNCTION update_ai_processing_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the processed timestamp when AI processing is completed
    IF NEW.ai_processing_status = 'completed' AND OLD.ai_processing_status != 'completed' THEN
        NEW.ai_processed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for AI processing status updates
DROP TRIGGER IF EXISTS trigger_update_ai_processing_status ON contracts;
CREATE TRIGGER trigger_update_ai_processing_status
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_processing_status();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON contracts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

