-- Update Contracts Table with Comprehensive 29-Variable Schema
-- Run this in your Supabase SQL Editor to update the contracts table

-- ============================================================================
-- UPDATE CONTRACTS TABLE SCHEMA
-- ============================================================================

-- First, let's backup existing data (if any)
CREATE TABLE IF NOT EXISTS contracts_backup AS SELECT * FROM contracts;

-- Drop existing contracts table
DROP TABLE IF EXISTS contracts CASCADE;

-- Create new contracts table with comprehensive schema
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 1. BASIC TENDER INFORMATION (15 variables)
  reference_number TEXT NOT NULL UNIQUE, -- e.g., URSB/SUPLS/2025-2026/00011
  title TEXT NOT NULL, -- Tender Title / Subject of Procurement
  category TEXT NOT NULL, -- supplies, services, works
  procurement_method TEXT NOT NULL, -- open domestic bidding, restricted bidding, etc.
  estimated_value_min NUMERIC, -- Minimum estimated contract value
  estimated_value_max NUMERIC, -- Maximum estimated contract value
  currency TEXT DEFAULT 'UGX', -- Currency for all financial values
  bid_security_amount NUMERIC, -- Bid Security Amount
  bid_security_type TEXT, -- e.g., bank guarantee, insurance bond
  margin_of_preference BOOLEAN DEFAULT false, -- Margin of Preference Applicable?
  
  -- Timeline dates
  publish_date DATE, -- a. Publish bid notice date
  pre_bid_meeting_date DATE, -- b. Pre-bid meeting date
  site_visit_date DATE, -- b. Site visit date (if applicable)
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL, -- c. Bid closing date & time
  bid_opening_date TIMESTAMP WITH TIME ZONE, -- Bid opening date & time
  
  -- 2. PROCURING ENTITY INFORMATION (3 variables)
  procuring_entity TEXT NOT NULL, -- Procuring client name
  contact_person TEXT, -- Client contact person
  contact_position TEXT, -- Client contact person position
  
  -- 3. ELIGIBILITY & REQUIRED DOCUMENTS (8 variables) - COMBINED!
  evaluation_methodology TEXT, -- e.g., Technical Compliance Selection
  
  -- Required certificates (5 boolean flags)
  requires_registration BOOLEAN DEFAULT false, -- Registration/Incorporation
  requires_trading_license BOOLEAN DEFAULT false, -- Trading License (FY-specific)
  requires_tax_clearance BOOLEAN DEFAULT false, -- Tax Clearance Certificate
  requires_nssf_clearance BOOLEAN DEFAULT false, -- NSSF Clearance
  requires_manufacturer_auth BOOLEAN DEFAULT false, -- Manufacturer's Authorization Needed?
  
  -- Submission details
  submission_method TEXT, -- e.g., physical, online, both
  submission_format TEXT, -- e.g., sealed envelopes, electronic
  required_documents TEXT[], -- Array of required documents & forms
  required_forms TEXT[], -- Array of mandatory forms to submit
  
  -- 4. STATUS & TRACKING (3 variables)
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'cancelled')),
  current_stage TEXT DEFAULT 'published', -- published, evaluation, awarded, completed
  award_information TEXT, -- Information about award if status is 'awarded'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies for contracts (public read access, admin write access)
CREATE POLICY "Anyone can view contracts" ON contracts
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert contracts" ON contracts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update contracts" ON contracts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete contracts" ON contracts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_category ON contracts(category);
CREATE INDEX idx_contracts_deadline ON contracts(submission_deadline);
CREATE INDEX idx_contracts_reference ON contracts(reference_number);
CREATE INDEX idx_contracts_entity ON contracts(procuring_entity);

-- Insert sample data with new schema
INSERT INTO contracts (
  reference_number,
  title,
  category,
  procurement_method,
  estimated_value_min,
  estimated_value_max,
  currency,
  bid_security_amount,
  bid_security_type,
  margin_of_preference,
  publish_date,
  pre_bid_meeting_date,
  site_visit_date,
  submission_deadline,
  bid_opening_date,
  procuring_entity,
  contact_person,
  contact_position,
  evaluation_methodology,
  requires_registration,
  requires_trading_license,
  requires_tax_clearance,
  requires_nssf_clearance,
  requires_manufacturer_auth,
  submission_method,
  submission_format,
  required_documents,
  required_forms,
  status,
  current_stage
) VALUES 
(
  'URSB/SUPLS/2025-2026/00001',
  'Supply of Office Equipment and Furniture',
  'supplies',
  'open domestic bidding',
  50000000,
  100000000,
  'UGX',
  5000000,
  'bank guarantee',
  false,
  '2025-01-15',
  '2025-01-25',
  NULL,
  '2025-02-15 17:00:00+00',
  '2025-02-16 10:00:00+00',
  'Uganda Registration Services Bureau',
  'John Doe',
  'Procurement Officer',
  'Technical Compliance Selection',
  true,
  true,
  true,
  true,
  false,
  'physical',
  'sealed envelopes',
  ARRAY['Company Registration Certificate', 'Trading License', 'Tax Clearance Certificate', 'NSSF Clearance Certificate'],
  ARRAY['Bid Submission Sheet', 'Price Schedule', 'Code of Ethical Conduct'],
  'open',
  'published'
),
(
  'MOH/WORKS/2025-2026/00002',
  'Construction of Health Center III',
  'works',
  'open domestic bidding',
  200000000,
  500000000,
  'UGX',
  20000000,
  'bank guarantee',
  true,
  '2025-01-20',
  '2025-01-30',
  '2025-02-05',
  '2025-03-01 17:00:00+00',
  '2025-03-02 10:00:00+00',
  'Ministry of Health',
  'Jane Smith',
  'Senior Procurement Officer',
  'Technical and Financial Evaluation',
  true,
  true,
  true,
  true,
  false,
  'physical',
  'sealed envelopes',
  ARRAY['Company Registration Certificate', 'Trading License', 'Tax Clearance Certificate', 'NSSF Clearance Certificate', 'Construction License'],
  ARRAY['Bid Submission Sheet', 'Price Schedule', 'Technical Proposal', 'Code of Ethical Conduct'],
  'open',
  'published'
),
(
  'ICT/SERVICES/2025-2026/00003',
  'IT System Development and Maintenance Services',
  'services',
  'restricted bidding',
  100000000,
  300000000,
  'UGX',
  10000000,
  'insurance bond',
  false,
  '2025-01-25',
  '2025-02-05',
  NULL,
  '2025-03-15 17:00:00+00',
  '2025-03-16 10:00:00+00',
  'Ministry of ICT and National Guidance',
  'Robert Johnson',
  'ICT Procurement Manager',
  'Technical Compliance and Financial Evaluation',
  true,
  true,
  true,
  true,
  false,
  'online',
  'electronic submission',
  ARRAY['Company Registration Certificate', 'Trading License', 'Tax Clearance Certificate', 'NSSF Clearance Certificate', 'Software Development License'],
  ARRAY['Bid Submission Sheet', 'Price Schedule', 'Technical Proposal', 'Code of Ethical Conduct'],
  'open',
  'published'
);

-- Update the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Contracts table updated successfully with 29-variable comprehensive schema!' as message;
