-- Fix bid_attachments display issue
-- Run this in your Supabase SQL Editor

-- First, let's see what we currently have
SELECT id, bid_attachments FROM contracts WHERE bid_attachments IS NOT NULL LIMIT 5;

-- Clean up any malformed data
UPDATE contracts 
SET bid_attachments = ARRAY[]::text[]
WHERE bid_attachments IS NULL OR bid_attachments = '{}' OR array_length(bid_attachments, 1) IS NULL;

-- Ensure the column has proper default
ALTER TABLE contracts 
ALTER COLUMN bid_attachments SET DEFAULT ARRAY[]::text[];

-- Update any contracts that might have empty arrays
UPDATE contracts 
SET bid_attachments = ARRAY[]::text[]
WHERE bid_attachments = '{}' OR bid_attachments IS NULL;
