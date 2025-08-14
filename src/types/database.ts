export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  business_type?: string;
  experience_years?: number;
  preferred_categories?: string[];
  preferred_locations?: string[];
  min_contract_value?: number;
  max_contract_value?: number;
  certifications?: string[];

  subscription_status?: 'none' | 'active' | 'cancelled' | 'expired';
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  title: string;
  client: string;
  location: string;
  value: number;
  deadline: string;
  category: string;
  description?: string;
  status: 'open' | 'closed' | 'awarded';
  posted_date: string;
  requirements?: string[];
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  user_id: string;
  contract_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'awarded' | 'rejected';
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}

export interface BidTracking {
  id: string;
  user_id: string;
  contract_id: string;
  email_alerts: boolean;
  sms_alerts: boolean;
  push_alerts: boolean;
  tracking_active: boolean;
  created_at: string;
  updated_at: string;
}

// New payment and subscription interfaces
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_interval: 'month' | 'year';
  features: {
    unlimited_tender_alerts?: boolean;
    advanced_search_filtering?: boolean;
    unlimited_saved_tenders?: boolean;
    document_storage_gb?: number;
    email_support?: boolean;
    real_time_notifications?: boolean;
    bid_tracking?: boolean;
    analytics_dashboard?: boolean;
    recommendations?: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  flutterwave_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  payment_method?: string;
  flutterwave_transaction_id?: string;
  flutterwave_reference?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface UserActiveSubscription {
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'none';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  planName?: string;
  trialEnded?: boolean;
  trialEndedAt?: string;
  // Legacy properties for backward compatibility
  subscription_id?: string;
  plan_name?: string;
  plan_price?: number;
  current_period_end?: string;
} 