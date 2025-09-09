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
  team_size?: number;
  onboarding_completed?: boolean;
  subscription_status?: 'none' | 'active' | 'cancelled' | 'expired';
  subscription_id?: string;
  role?: 'user' | 'admin' | 'super_admin';
  // Notification preferences
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
  whatsapp_number?: string;
  notification_frequency?: 'real-time' | 'daily';
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  
  // 1. BASIC TENDER INFORMATION (19 variables)
  reference_number: string; // e.g., URSB/SUPLS/2025-2026/00011
  title: string; // Tender Title / Subject of Procurement
  short_description?: string; // Brief description/summary of the contract
  category: string; // supplies, services, works
  procurement_method: string; // open domestic bidding, restricted bidding, etc.
  estimated_value_min?: number; // Minimum estimated contract value
  estimated_value_max?: number; // Maximum estimated contract value
  currency: string; // Currency for all financial values
  bid_fee?: number; // Bid fee amount
  bid_security_amount?: number; // Bid Security Amount
  bid_security_type?: string; // e.g., bank guarantee, insurance bond
  margin_of_preference: boolean; // Margin of Preference Applicable?
  competition_level: 'low' | 'medium' | 'high' | 'very_high'; // Expected competition level
  
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
  submission_method?: string
  submission_format?: string; // e.g., sealed envelopes, electronic
  required_documents?: string[]; // Array of required documents & forms
  bid_attachments?: string[]; // Array of bid document URLs or file names
  
  // 4. ENHANCED STATUS & LIFECYCLE TRACKING
  status: 'draft' | 'open' | 'closed' | 'evaluating' | 'awarded' | 'cancelled' | 'completed';
  current_stage: 'draft' | 'published' | 'pre_bid_meeting' | 'site_visit' | 'submission_open' | 'submission_closed' | 'evaluation' | 'awarded' | 'contract_signed' | 'in_progress' | 'completed' | 'archived';
  publish_status: 'draft' | 'published' | 'archived'; // Controls client visibility
  published_at?: string; // When the contract was published
  published_by?: string; // Who published the contract
  
  // 5. BIDDING INTELLIGENCE
  total_bidders?: number; // Total number of companies that bid
  total_bids_received?: number; // Total bids actually received
  shortlisted_bidders?: number; // Number of bidders shortlisted
  evaluation_start_date?: string; // When evaluation began
  evaluation_end_date?: string; // When evaluation completed
  
  // 6. AWARD INFORMATION (Enhanced)
  awarded_to?: string; // Company name that won the contract
  awarded_value?: number; // Final awarded amount
  award_date?: string; // Date when contract was awarded
  contract_start_date?: string; // Contract start date
  contract_end_date?: string; // Contract end date
  completion_status?: 'on_track' | 'delayed' | 'completed' | 'terminated';
  performance_rating?: number; // Performance rating (1-5)
  winning_bid_value?: number; // Value of the winning bid
  technical_score?: number; // Technical evaluation score
  financial_score?: number; // Financial evaluation score
  
  // 7. ENTITY RELATIONSHIPS
  procuring_entity_id?: string; // Foreign key to procuring_entities table
  awarded_company_id?: string; // Foreign key to awardees table
  
  // 8. HISTORICAL DATA FIELDS
  data_source?: string; // 'manual', 'scraper', 'government_csv', 'api'
  source_file?: string; // Original file name if imported
  fiscal_year?: string; // Fiscal year for historical data
  import_date?: string; // When this record was imported
  detail_url?: string; // Link to original procurement portal
  
  // 9. AI PROCESSING FIELDS
  ai_summary_short?: string; // AI-generated short description
  ai_category?: string; // AI-suggested category classification
  ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  ai_processed_at?: string; // Timestamp when AI processing was completed
  
  // 10. SYSTEM FIELDS
  created_at: string;
  updated_at: string;
  
  // 11. RECOMMENDATION FIELDS (for display purposes)
  recommendationScore?: number;
  
  // 12. NESTED RELATIONSHIPS (for queries)
  awardees?: { company_name: string; };
  procuring_entities?: { entity_name: string; };
  competitor_bids?: CompetitorBid[];
  contract_performance?: ContractPerformance[];
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
  whatsapp_alerts: boolean;
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

// Competitive Intelligence Interfaces

export interface Awardee {
  id: string;
  company_name: string;
  registration_number?: string;
  business_type?: string;
  female_owned?: boolean;
  primary_categories?: string[];
  locations?: string[];
  team_size?: number;
  annual_revenue_range?: string;
  certifications?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_media?: any;
  notes?: string;
  is_active: boolean;
  data_source?: string;
  source_file?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcuringEntity {
  id: string;
  entity_name: string;
  entity_type?: string; // 'ministry', 'agency', 'department', 'parastatal'
  parent_entity_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  location?: string;
  annual_budget?: number;
  procurement_patterns?: any;
  preferred_suppliers?: string[];
  is_active: boolean;
  data_source?: string;
  source_file?: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitorBid {
  id: string;
  contract_id: string;
  awardee_id?: string;
  bidder_name: string; // Company name that bid
  bid_value: number;
  currency: string;
  bid_status: 'submitted' | 'shortlisted' | 'awarded' | 'rejected' | 'withdrawn';
  technical_score?: number;
  financial_score?: number;
  total_score?: number;
  ranking?: number;
  bid_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractPerformance {
  id: string;
  contract_id: string;
  reporting_period: string;
  progress_percentage?: number;
  quality_score?: number;
  timeline_adherence?: boolean;
  budget_adherence?: boolean;
  issues_raised?: string[];
  created_at: string;
  updated_at: string;
}

export interface AwardeeAnalysis {
  id: string;
  awardee_id: string;
  period_start: string;
  period_end: string;
  total_bids: number;
  wins: number;
  win_rate: number;
  average_bid_value: number;
  preferred_categories?: string[];
  preferred_procuring_entities?: string[];
  created_at: string;
  updated_at: string;
} 