// TypeScript interfaces for bidder tracking system
// Based on real procurement data structure

export interface ContractBidder {
  id: string;
  contract_id: string;
  company_name: string;
  bid_amount: number; // Decimal for amounts like 67,260.00
  currency: string;
  rank: number; // 1st, 2nd, 3rd, etc. (0 for unsuccessful bidders)
  bid_status: 'submitted' | 'shortlisted' | 'awarded' | 'rejected' | 'disqualified' | 'withdrawn';
  evaluation_stage?: string; // preliminary, detailed, financial
  evaluation_result?: string; // compliant, non_compliant, responsive, failed
  technical_score?: number; // e.g., 85.5
  financial_score?: number; // e.g., 90.0
  total_score?: number; // combined score
  reason_for_failure?: string; // Detailed reasons
  preliminary_evaluation?: 'compliant' | 'non_compliant';
  detailed_evaluation?: 'responsive' | 'failed';
  financial_evaluation?: 'passed' | 'failed';
  bid_date: string;
  evaluation_date?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  company_registration_number?: string;
  is_winner: boolean;
  is_runner_up: boolean; // For 2nd BEB, 3rd BEB, etc.
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BidderAnalytics {
  contract_id: string;
  contract_title: string;
  procuring_entity: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  total_bidders: number;
  winners: number;
  losers: number;
  average_bid_amount: number;
  lowest_bid: number;
  highest_bid: number;
  average_technical_score?: number;
  average_financial_score?: number;
}

export interface CompetitiveAnalysis {
  company_name: string;
  bid_amount: number;
  rank: number;
  bid_status: string;
  technical_score?: number;
  financial_score?: number;
  total_score?: number;
  reason_for_failure?: string;
  is_winner: boolean;
  bid_date: string;
}

// Form data interface for adding/editing bidders
export interface BidderFormData {
  company_name: string;
  bid_amount: string; // String for form input
  rank: string;
  bid_status: string;
  preliminary_evaluation: string;
  detailed_evaluation: string;
  financial_evaluation: string;
  reason_for_failure: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  company_registration_number: string;
  is_winner: boolean;
  is_runner_up: boolean;
  notes: string;
}

// Evaluation stage options
export const EVALUATION_STAGES = [
  'preliminary',
  'detailed', 
  'financial'
] as const;

// Evaluation result options
export const EVALUATION_RESULTS = [
  'compliant',
  'non_compliant',
  'responsive',
  'failed'
] as const;

// Bid status options
export const BID_STATUSES = [
  'submitted',
  'shortlisted',
  'awarded',
  'rejected',
  'disqualified',
  'withdrawn'
] as const;

// Evaluation options for each stage
export const PRELIMINARY_EVALUATION_OPTIONS = [
  'compliant',
  'non_compliant'
] as const;

export const DETAILED_EVALUATION_OPTIONS = [
  'responsive',
  'failed'
] as const;

export const FINANCIAL_EVALUATION_OPTIONS = [
  'passed',
  'failed'
] as const;
