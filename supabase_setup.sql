-- Create bid_tracking table
CREATE TABLE IF NOT EXISTS bid_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  email_alerts BOOLEAN DEFAULT true,
  whatsapp_alerts BOOLEAN DEFAULT false,
  push_alerts BOOLEAN DEFAULT true,
  tracking_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bid_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bid_tracking
CREATE POLICY "Users can view own bid tracking" ON bid_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bid tracking" ON bid_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bid tracking" ON bid_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bid tracking" ON bid_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create contracts table if it doesn't exist (for reference)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  location TEXT NOT NULL,
  value NUMERIC NOT NULL,
  deadline DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded')),
  posted_date DATE DEFAULT CURRENT_DATE,
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contracts
CREATE POLICY "Anyone can view contracts" ON contracts
  FOR SELECT USING (true);
