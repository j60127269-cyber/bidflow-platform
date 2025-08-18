-- Flutterwave Payment Integration Setup for BidFlow Platform
-- Run this in your Supabase SQL Editor

-- 1. Create subscription_plans table
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

-- 2. Create subscriptions table
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

-- 3. Create payments table
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

-- 4. Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify subscription plans" ON subscription_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 6. Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create RLS policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Add subscription-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trial', 'active', 'cancelled', 'expired'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

-- 9. Insert the Professional plan
INSERT INTO subscription_plans (name, description, price, currency, billing_interval, features) 
VALUES (
  'Professional',
  'Complete access to all BidFlow features for small to medium businesses',
  50000,
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

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_flutterwave_transaction_id ON payments(flutterwave_transaction_id);

-- 11. Create function to update subscription status in profiles
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

-- 12. Create trigger for subscription status updates
DROP TRIGGER IF EXISTS trigger_update_profile_subscription_status ON subscriptions;
CREATE TRIGGER trigger_update_profile_subscription_status
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_subscription_status();

-- 13. Create function to get user's active subscription
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
