-- Update Contracts Table with Additional Fields
-- Run this in your Supabase SQL Editor to add the new fields

-- ============================================================================
-- ADD NEW FIELDS TO CONTRACTS TABLE
-- ============================================================================

-- Add new columns to the existing contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS bid_fee NUMERIC,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS bid_attachments TEXT[], -- Array of file URLs/names
ADD COLUMN IF NOT EXISTS competition_level TEXT DEFAULT 'medium' CHECK (competition_level IN ('low', 'medium', 'high', 'very_high'));

-- Add comments for documentation
COMMENT ON COLUMN contracts.bid_fee IS 'Bid fee amount in the specified currency';
COMMENT ON COLUMN contracts.short_description IS 'Brief description/summary of the contract';
COMMENT ON COLUMN contracts.bid_attachments IS 'Array of bid document URLs or file names';
COMMENT ON COLUMN contracts.competition_level IS 'Expected competition level: low, medium, high, very_high';

-- Update sample data with new fields
UPDATE contracts SET 
  bid_fee = 100000,
  short_description = 'Supply of office equipment and furniture for Uganda Registration Services Bureau headquarters',
  bid_attachments = ARRAY['tender_document.pdf', 'technical_specifications.pdf', 'bill_of_quantities.xlsx'],
  competition_level = 'high'
WHERE reference_number = 'URSB/SUPLS/2025-2026/00001';

UPDATE contracts SET 
  bid_fee = 200000,
  short_description = 'Construction of a new Health Center III facility in rural Uganda',
  bid_attachments = ARRAY['construction_drawings.pdf', 'site_plans.pdf', 'technical_specifications.pdf', 'bill_of_quantities.xlsx'],
  competition_level = 'medium'
WHERE reference_number = 'MOH/WORKS/2025-2026/00002';

UPDATE contracts SET 
  bid_fee = 150000,
  short_description = 'Development and maintenance of IT systems for the Ministry of ICT',
  bid_attachments = ARRAY['technical_requirements.pdf', 'system_architecture.pdf', 'maintenance_schedule.pdf'],
  competition_level = 'very_high'
WHERE reference_number = 'ICT/SERVICES/2025-2026/00003';

-- Create index for competition level for better filtering
CREATE INDEX IF NOT EXISTS idx_contracts_competition_level ON contracts(competition_level);

-- Success message
SELECT 'Additional fields added successfully! New fields: bid_fee, short_description, bid_attachments, competition_level' as message;
