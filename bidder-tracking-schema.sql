-- Database schema for tracking all bidders (winners and losers)
-- This will provide comprehensive competitive intelligence

-- 1. Create a comprehensive bidders table matching real procurement data
CREATE TABLE IF NOT EXISTS contract_bidders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    bid_amount DECIMAL(15,2) NOT NULL, -- Changed to decimal to handle amounts like 67,260.00
    currency VARCHAR(3) DEFAULT 'UGX',
    rank INTEGER, -- 1st, 2nd, 3rd, etc. (0 for unsuccessful bidders)
    bid_status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- submitted, shortlisted, awarded, rejected, disqualified, withdrawn
    evaluation_stage VARCHAR(50), -- preliminary, detailed, financial
    evaluation_result VARCHAR(50), -- compliant, non_compliant, responsive, failed
    technical_score DECIMAL(5,2), -- e.g., 85.5
    financial_score DECIMAL(5,2), -- e.g., 90.0
    total_score DECIMAL(5,2), -- combined score
    reason_for_failure TEXT, -- Detailed reasons like "Did not buy required standards and the Audited books of Accounts was not signed"
    preliminary_evaluation VARCHAR(20), -- compliant, non_compliant
    detailed_evaluation VARCHAR(20), -- responsive, failed
    financial_evaluation VARCHAR(20), -- passed, failed
    bid_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluation_date TIMESTAMP WITH TIME ZONE,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_registration_number VARCHAR(100),
    is_winner BOOLEAN DEFAULT FALSE,
    is_runner_up BOOLEAN DEFAULT FALSE, -- For 2nd BEB, 3rd BEB, etc.
    notes TEXT, -- Additional notes about the bidder
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contract_bidders_contract_id ON contract_bidders(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_bidders_company_name ON contract_bidders(company_name);
CREATE INDEX IF NOT EXISTS idx_contract_bidders_bid_status ON contract_bidders(bid_status);
CREATE INDEX IF NOT EXISTS idx_contract_bidders_rank ON contract_bidders(rank);
CREATE INDEX IF NOT EXISTS idx_contract_bidders_is_winner ON contract_bidders(is_winner);

-- 3. Create a view for easy querying of bidder statistics
CREATE OR REPLACE VIEW bidder_analytics AS
SELECT 
    cb.contract_id,
    c.title as contract_title,
    c.procuring_entity,
    c.estimated_value_min,
    c.estimated_value_max,
    COUNT(cb.id) as total_bidders,
    COUNT(CASE WHEN cb.is_winner = true THEN 1 END) as winners,
    COUNT(CASE WHEN cb.is_winner = false THEN 1 END) as losers,
    AVG(cb.bid_amount) as average_bid_amount,
    MIN(cb.bid_amount) as lowest_bid,
    MAX(cb.bid_amount) as highest_bid,
    AVG(cb.technical_score) as average_technical_score,
    AVG(cb.financial_score) as average_financial_score
FROM contract_bidders cb
JOIN contracts c ON cb.contract_id = c.id
GROUP BY cb.contract_id, c.title, c.procuring_entity, c.estimated_value_min, c.estimated_value_max;

-- 4. Create a function to automatically update the winner flag
CREATE OR REPLACE FUNCTION update_winner_flag()
RETURNS TRIGGER AS $$
BEGIN
    -- If this bidder is marked as winner, unmark all other bidders for this contract
    IF NEW.is_winner = true THEN
        UPDATE contract_bidders 
        SET is_winner = false 
        WHERE contract_id = NEW.contract_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically manage winner flags
CREATE TRIGGER trigger_update_winner_flag
    BEFORE INSERT OR UPDATE ON contract_bidders
    FOR EACH ROW
    EXECUTE FUNCTION update_winner_flag();

-- 6. Add RLS (Row Level Security) policies
ALTER TABLE contract_bidders ENABLE ROW LEVEL SECURITY;

-- Allow users to view bidders for published contracts
CREATE POLICY "Users can view bidders for published contracts" ON contract_bidders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE id = contract_bidders.contract_id 
            AND publish_status = 'published'
        )
    );

-- Allow admins to manage all bidders
CREATE POLICY "Admins can manage all bidders" ON contract_bidders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Create a function to get competitive analysis for a contract
CREATE OR REPLACE FUNCTION get_contract_competitive_analysis(contract_uuid UUID)
RETURNS TABLE (
    company_name VARCHAR(255),
    bid_amount BIGINT,
    rank INTEGER,
    bid_status VARCHAR(50),
    technical_score DECIMAL(5,2),
    financial_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    reason_for_failure TEXT,
    is_winner BOOLEAN,
    bid_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cb.company_name,
        cb.bid_amount,
        cb.rank,
        cb.bid_status,
        cb.technical_score,
        cb.financial_score,
        cb.total_score,
        cb.reason_for_failure,
        cb.is_winner,
        cb.bid_date
    FROM contract_bidders cb
    WHERE cb.contract_id = contract_uuid
    ORDER BY cb.rank ASC, cb.bid_amount ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Sample data matching real procurement examples
-- Example based on your images:
-- INSERT INTO contract_bidders (
--     contract_id, 
--     company_name, 
--     bid_amount, 
--     rank, 
--     bid_status, 
--     preliminary_evaluation,
--     detailed_evaluation,
--     financial_evaluation,
--     is_winner, 
--     is_runner_up,
--     reason_for_failure
-- ) VALUES 
--     -- Winner: MY MAKA GROUP LIMITED
--     ('your-contract-id', 'MY MAKA GROUP LIMITED', 67260.00, 1, 'awarded', 'compliant', 'responsive', 'passed', true, false, NULL),
--     
--     -- Runner-up: SUPER TASTE LIMITED (2nd BEB)
--     ('your-contract-id', 'SUPER TASTE LIMITED', 68400.01, 2, 'rejected', 'compliant', 'responsive', 'failed', false, true, 'Failed financial evaluation'),
--     
--     -- Unsuccessful bidders
--     ('your-contract-id', 'CRYSTAL SUITES & APARTMENTS LIMITED', 85720.03, 0, 'rejected', 'non_compliant', 'failed', 'failed', false, false, 'Did not buy required standards and the Audited books of Accounts was not signed'),
--     
--     ('your-contract-id', 'FAIRWAY LTD CHANGED TO FAIRWAY HOTEL LTD', 236000.00, 0, 'rejected', 'non_compliant', 'failed', 'failed', false, false, 'Did not buy the standards, Audited books of Accounts were not signed by the Directors, Suitability of premises cert expired in 2021 contrary to required Dec 2025, lack workman compensation policy, lack log book for the delivery van'),
--     
--     ('your-contract-id', 'KEMBABAZI CATERING CENTRE LTD', 171000.00, 0, 'rejected', 'non_compliant', 'failed', 'failed', false, false, 'Certificate of suitability of premises expired in Dec 2020 contrary to required Dec 2025, Income Tax clearance certificate addressed CAA contrary to required to UNBS');

SELECT 'Bidder tracking schema created successfully!' as status;
