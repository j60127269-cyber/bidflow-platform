-- Enhanced Contract Lifecycle and Bidding Intelligence Schema
-- This script adds comprehensive lifecycle tracking and bidding intelligence

-- 1. CREATE CONTRACT LIFECYCLE EVENTS TABLE
CREATE TABLE IF NOT EXISTS contract_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'status_change', 'stage_change', 'bid_received', 'evaluation_started', 'awarded', 'completed'
    previous_value TEXT,
    new_value TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENHANCE COMPETITOR_BIDS TABLE
ALTER TABLE competitor_bids ADD COLUMN IF NOT EXISTS bidder_name VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE competitor_bids ADD COLUMN IF NOT EXISTS technical_proposal TEXT;
ALTER TABLE competitor_bids ADD COLUMN IF NOT EXISTS financial_proposal TEXT;
ALTER TABLE competitor_bids ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- 3. ADD NEW COLUMNS TO CONTRACTS TABLE FOR LIFECYCLE TRACKING
DO $$
BEGIN
    -- Add total_bids_received if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'total_bids_received'
    ) THEN
        ALTER TABLE contracts ADD COLUMN total_bids_received INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_bids_received column to contracts table';
    END IF;

    -- Add shortlisted_bidders if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'shortlisted_bidders'
    ) THEN
        ALTER TABLE contracts ADD COLUMN shortlisted_bidders INTEGER DEFAULT 0;
        RAISE NOTICE 'Added shortlisted_bidders column to contracts table';
    END IF;

    -- Add evaluation_start_date if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'evaluation_start_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN evaluation_start_date DATE;
        RAISE NOTICE 'Added evaluation_start_date column to contracts table';
    END IF;

    -- Add evaluation_end_date if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracts' AND column_name = 'evaluation_end_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN evaluation_end_date DATE;
        RAISE NOTICE 'Added evaluation_end_date column to contracts table';
    END IF;

    -- Update status enum to include new values
    ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
    ALTER TABLE contracts ADD CONSTRAINT contracts_status_check 
        CHECK (status IN ('draft', 'open', 'closed', 'evaluating', 'awarded', 'cancelled', 'completed'));

    -- Update current_stage enum to include new values
    ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_current_stage_check;
    ALTER TABLE contracts ADD CONSTRAINT contracts_current_stage_check 
        CHECK (current_stage IN ('draft', 'published', 'pre_bid_meeting', 'site_visit', 'submission_open', 'submission_closed', 'evaluation', 'awarded', 'contract_signed', 'in_progress', 'completed', 'archived'));

END $$;

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_events_contract_id ON contract_lifecycle_events(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_events_event_date ON contract_lifecycle_events(event_date);
CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_events_event_type ON contract_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_competitor_bids_bidder_name ON competitor_bids(bidder_name);
CREATE INDEX IF NOT EXISTS idx_competitor_bids_bid_status ON competitor_bids(bid_status);

-- 5. CREATE RLS POLICIES FOR NEW TABLE
ALTER TABLE contract_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read lifecycle events
CREATE POLICY "Allow authenticated users to read contract_lifecycle_events" ON contract_lifecycle_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to insert/update/delete lifecycle events
CREATE POLICY "Allow admins to manage contract_lifecycle_events" ON contract_lifecycle_events
    FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

-- 6. CREATE TRIGGER FOR UPDATED_AT
CREATE TRIGGER update_contract_lifecycle_events_updated_at 
    BEFORE UPDATE ON contract_lifecycle_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. CREATE VIEW FOR CONTRACT LIFECYCLE SUMMARY
CREATE OR REPLACE VIEW contract_lifecycle_summary AS
SELECT 
    c.id,
    c.reference_number,
    c.title,
    c.status,
    c.current_stage,
    c.procuring_entity,
    c.awarded_to,
    c.awarded_value,
    c.total_bidders,
    c.total_bids_received,
    c.award_date,
    c.contract_start_date,
    c.contract_end_date,
    c.completion_status,
    c.performance_rating,
    COUNT(cb.id) as total_competitor_bids,
    COUNT(CASE WHEN cb.bid_status = 'awarded' THEN 1 END) as winning_bids,
    COUNT(CASE WHEN cb.bid_status = 'rejected' THEN 1 END) as rejected_bids,
    MIN(cb.bid_value) as lowest_bid,
    MAX(cb.bid_value) as highest_bid,
    AVG(cb.bid_value) as average_bid_value
FROM contracts c
LEFT JOIN competitor_bids cb ON c.id = cb.contract_id
GROUP BY c.id, c.reference_number, c.title, c.status, c.current_stage, 
         c.procuring_entity, c.awarded_to, c.awarded_value, c.total_bidders, 
         c.total_bids_received, c.award_date, c.contract_start_date, 
         c.contract_end_date, c.completion_status, c.performance_rating;

-- 8. CREATE FUNCTION TO UPDATE BIDDING STATISTICS
CREATE OR REPLACE FUNCTION update_contract_bidding_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_bids_received count
    UPDATE contracts 
    SET total_bids_received = (
        SELECT COUNT(*) 
        FROM competitor_bids 
        WHERE contract_id = NEW.contract_id
    )
    WHERE id = NEW.contract_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE TRIGGER TO AUTO-UPDATE BIDDING STATS
CREATE TRIGGER trigger_update_bidding_stats
    AFTER INSERT OR UPDATE OR DELETE ON competitor_bids
    FOR EACH ROW EXECUTE FUNCTION update_contract_bidding_stats();

DO $$
BEGIN
    RAISE NOTICE 'Enhanced contract lifecycle and bidding intelligence schema created successfully!';
END $$;
