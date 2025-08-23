-- Add publish_status fields to contracts table
-- This enables admin control over contract visibility to clients

ALTER TABLE contracts 
ADD COLUMN publish_status VARCHAR(20) DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published', 'archived')),
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN published_by UUID REFERENCES profiles(id);

-- Create index for better query performance on publish_status
CREATE INDEX idx_contracts_publish_status ON contracts(publish_status);

-- Create index for published contracts (most common query)
CREATE INDEX idx_contracts_published ON contracts(publish_status) WHERE publish_status = 'published';

-- Update existing contracts to 'published' status (so they remain visible)
-- You can change this to 'draft' if you want to review all existing contracts first
UPDATE contracts SET publish_status = 'published' WHERE publish_status IS NULL;

-- Add comment to the table
COMMENT ON COLUMN contracts.publish_status IS 'Controls visibility to clients: draft (admin only), published (visible to clients), archived (hidden)';
COMMENT ON COLUMN contracts.published_at IS 'Timestamp when contract was published';
COMMENT ON COLUMN contracts.published_by IS 'Admin user who published the contract';
