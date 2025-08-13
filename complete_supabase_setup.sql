-- Complete Supabase Setup for BidFlow Platform
-- Run this in your Supabase SQL Editor to set up all tables and functions

-- ============================================================================
-- 1. PROFILES TABLE (User profiles with subscription info)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  business_type TEXT,
  experience_years INTEGER,
  preferred_categories TEXT[],
  preferred_locations TEXT[],
  min_contract_value NUMERIC,
  max_contract_value NUMERIC,
  certifications TEXT[],

  phone TEXT,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trial', 'active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. CONTRACTS TABLE (Tender/Contract data)
-- ============================================================================

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

-- RLS policies for contracts (public read access)
CREATE POLICY "Anyone can view contracts" ON contracts
  FOR SELECT USING (true);

-- ============================================================================
-- 3. BID TRACKING TABLE (User bid tracking preferences)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bid_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  email_alerts BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  push_alerts BOOLEAN DEFAULT true,
  tracking_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contract_id)
);

-- Enable RLS on bid_tracking
ALTER TABLE bid_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for bid_tracking
CREATE POLICY "Users can view own bid tracking" ON bid_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bid tracking" ON bid_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bid tracking" ON bid_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bid tracking" ON bid_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. NOTIFICATIONS TABLE (In-app notifications)
-- ============================================================================

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

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 5. SUBSCRIPTION PLANS TABLE (Available subscription plans)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'UGX',
  billing_interval TEXT DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- 6. SUBSCRIPTIONS TABLE (User subscriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  flutterwave_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. PAYMENTS TABLE (Payment records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'UGX',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  payment_method TEXT,
  flutterwave_transaction_id TEXT UNIQUE,
  flutterwave_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 8. INSERT DEFAULT DATA
-- ============================================================================

-- Insert the Professional subscription plan
INSERT INTO subscription_plans (name, description, price, currency, billing_interval, features) 
VALUES (
  'Professional',
  'Complete access to all BidFlow features for small to medium businesses',
  20000,
  'UGX',
  'month',
  '{
    "unlimited_tender_alerts": true,
    "advanced_search_filtering": true,
    "unlimited_saved_tenders": true,
    "document_storage_gb": 1,
    "email_support": true,
    "real_time_notifications": true,
    "bid_tracking": true,
    "analytics_dashboard": true,
    "recommendations": true
  }'
) ON CONFLICT (name) DO UPDATE SET 
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_contracts_category ON contracts(category);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline ON contracts(deadline);
CREATE INDEX IF NOT EXISTS idx_bid_tracking_user_id ON bid_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_tracking_contract_id ON bid_tracking(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_flutterwave_transaction_id ON payments(flutterwave_transaction_id);

-- ============================================================================
-- 10. CREATE FUNCTIONS
-- ============================================================================

-- Function to update profile subscription status
CREATE OR REPLACE FUNCTION update_profile_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles 
    SET 
      subscription_status = NEW.status,
      subscription_id = NEW.id,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET 
      subscription_status = 'none',
      subscription_id = NULL,
      updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_active_subscription(user_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  plan_price NUMERIC,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    sp.name,
    sp.price,
    s.status,
    s.current_period_end
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. CREATE TRIGGERS
-- ============================================================================

-- Trigger for subscription status updates
DROP TRIGGER IF EXISTS trigger_update_profile_subscription_status ON subscriptions;
CREATE TRIGGER trigger_update_profile_subscription_status
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_subscription_status();

-- ============================================================================
-- 12. SAMPLE CONTRACT DATA (Optional - for testing)
-- ============================================================================

-- Insert sample contracts for testing
INSERT INTO contracts (title, client, location, value, deadline, category, description, requirements) VALUES
('Road Construction Project', 'Ministry of Works', 'Kampala', 500000000, '2024-03-15', 'Construction', 'Construction of 10km road in Kampala metropolitan area', ARRAY['Civil Engineering License', '5+ years experience', 'Financial capacity']),
('IT Infrastructure Upgrade', 'Bank of Uganda', 'Kampala', 200000000, '2024-02-28', 'Technology', 'Upgrade of banking IT infrastructure and security systems', ARRAY['IT Security Certification', 'Banking experience', 'ISO 27001']),
('Medical Supplies Procurement', 'Mulago Hospital', 'Kampala', 150000000, '2024-03-10', 'Healthcare', 'Procurement of medical equipment and supplies', ARRAY['Medical Supplies License', 'WHO Standards', 'Cold chain capacity']),
('Agricultural Equipment Supply', 'Ministry of Agriculture', 'Jinja', 80000000, '2024-02-20', 'Agriculture', 'Supply of modern farming equipment for rural farmers', ARRAY['Agricultural License', 'Equipment warranty', 'Training capacity']),
('School Construction', 'Ministry of Education', 'Mbarara', 300000000, '2024-04-01', 'Construction', 'Construction of primary school with 20 classrooms', ARRAY['Construction License', 'Educational facility experience', 'Safety standards'])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify setup by checking tables
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'bid_tracking', COUNT(*) FROM bid_tracking
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
