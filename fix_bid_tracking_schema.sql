-- Fix bid_tracking table schema mismatch
-- Rename sms_alerts to whatsapp_alerts to match the TypeScript code

-- First, check if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bid_tracking' 
        AND column_name = 'sms_alerts'
    ) THEN
        -- Rename sms_alerts to whatsapp_alerts
        ALTER TABLE bid_tracking RENAME COLUMN sms_alerts TO whatsapp_alerts;
        RAISE NOTICE 'Renamed sms_alerts to whatsapp_alerts';
    ELSE
        RAISE NOTICE 'sms_alerts column does not exist, checking for whatsapp_alerts';
    END IF;
    
    -- Check if whatsapp_alerts column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bid_tracking' 
        AND column_name = 'whatsapp_alerts'
    ) THEN
        -- Add whatsapp_alerts column if it doesn't exist
        ALTER TABLE bid_tracking ADD COLUMN whatsapp_alerts BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added whatsapp_alerts column';
    ELSE
        RAISE NOTICE 'whatsapp_alerts column already exists';
    END IF;
END $$;

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bid_tracking' 
ORDER BY ordinal_position;
