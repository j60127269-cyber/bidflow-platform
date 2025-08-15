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
  
  // 1. BASIC TENDER INFORMATION (15 variables)
  reference_number: string; // e.g., URSB/SUPLS/2025-2026/00011
  title: string; // Tender Title / Subject of Procurement
  category: string; // supplies, services, works
  procurement_method: string; // open domestic bidding, restricted bidding, etc.
  estimated_value_min?: number; // Minimum estimated contract value
  estimated_value_max?: number; // Maximum estimated contract value
  currency: string; // Currency for all financial values
  bid_security_amount?: number; // Bid Security Amount
  bid_security_type?: string; // e.g., bank guarantee, insurance bond
  margin_of_preference: boolean; // Margin of Preference Applicable?
  
  // Timeline dates
  publish_date?: string; // a. Publish bid notice date
  pre_bid_meeting_date?: string; // b. Pre-bid meeting date
  site_visit_date?: string; // b. Site visit date (if applicable)
  submission_deadline: string; // c. Bid closing date & time
  bid_opening_date?: string; // Bid opening date & time
  
  // 2. PROCURING ENTITY INFORMATION (3 variables)
  procuring_entity: string; // Procuring client name
  contact_person?: string; // Client contact person
  contact_position?: string; // Client contact person position
  
  // 3. ELIGIBILITY & REQUIRED DOCUMENTS (8 variables) - COMBINED!
  evaluation_methodology?: string; // e.g., Technical Compliance Selection
  
  // Required certificates (5 boolean flags)
  requires_registration: boolean; // Registration/Incorporation
  requires_trading_license: boolean; // Trading License (FY-specific)
  requires_tax_clearance: boolean; // Tax Clearance Certificate
  requires_nssf_clearance: boolean; // NSSF Clearance
  requires_manufacturer_auth: boolean; // Manufacturer's Authorization Needed?
  
  // Submission details
  submission_method?: string; // e.g., physical, online, both
  submission_format?: string; // e.g., sealed envelopes, electronic
  required_documents?: string[]; // Array of required documents & forms
  required_forms?: string[]; // Array of mandatory forms to submit
  
  // 4. STATUS & TRACKING (3 variables)
  status: 'open' | 'closed' | 'awarded' | 'cancelled';
  current_stage: string; // published, evaluation, awarded, completed
  award_information?: string; // Information about award if status is 'awarded'
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Recommendation fields (for display purposes)
  recommendationScore?: number;
  recommendationReasons?: string[];
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