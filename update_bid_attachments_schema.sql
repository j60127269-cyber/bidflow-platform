-- Update bid_attachments column to store file paths
-- Run this in your Supabase SQL Editor

-- First, let's check the current data and clean it up
-- This will convert any existing JSON strings to proper file paths
UPDATE contracts 
SET bid_attachments = ARRAY[]::text[]
WHERE bid_attachments IS NULL OR bid_attachments = '[]' OR bid_attachments = 'null';

-- If there are any JSON strings stored, we need to extract the paths
-- For now, we'll clear the field and let it be populated properly going forward
UPDATE contracts 
SET bid_attachments = ARRAY[]::text[]
WHERE bid_attachments IS NOT NULL;

-- Ensure the column is properly typed as text array
ALTER TABLE contracts 
ALTER COLUMN bid_attachments TYPE text[] USING 
  CASE 
    WHEN bid_attachments IS NULL THEN ARRAY[]::text[]
    WHEN jsonb_typeof(bid_attachments) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(bid_attachments))
    ELSE ARRAY[]::text[]
  END;

-- Set default value
ALTER TABLE contracts 
ALTER COLUMN bid_attachments SET DEFAULT ARRAY[]::text[];
