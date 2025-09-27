import { supabase } from './supabase';
import { EmailService } from './email-service';

export interface DailyDigestOpportunity {
  id: string;
  title: string;
  procuring_entity: string;
  submission_deadline: string;
  matching_keywords?: string;
  matching_location?: string;
  match_score: number;
  days_remaining: number;
  category: string;
}

export interface UserDigestData {
  id: string;
  email: string;
  preferences: {
    industries: string[];
    locations: string[];
    contract_types: string[];
  };
  opportunities: DailyDigestOpportunity[];
  total_matches: number;
}

/**
 * Daily Digest Service for sending daily opportunity emails
 */
export class DailyDigestService {
  /**
   * Process daily digest for all users
   */
  static async processDailyDigest(): Promise<void> {
    try {
      console.log('Starting daily digest processing...');
      
      // Get all users with daily digest enabled
      const users = await this.getUsersWithDailyDigest();
      console.log(`Found ${users.length} users for daily digest`);
      
      // Process each user's digest
      for (const user of users) {
        try {
          await this.processUserDigest(user);
          console.log(`Daily digest sent to user: ${user.email}`);
        } catch (error) {
          console.error(`Error processing digest for user ${user.email}:`, error);
        }
      }
      
      console.log('Daily digest processing completed');
    } catch (error) {
      console.error('Error in processDailyDigest:', error);
      throw error;
    }
  }

  /**
   * Get users who have daily digest enabled (MANDATORY for all users)
   */
  private static async getUsersWithDailyDigest(): Promise<UserDigestData[]> {
    const { data: users, error } = await supabase
      .from('user_notification_preferences')
      .select(`
        user_id,
        daily_digest_enabled,
        user_profiles!inner(
          id,
          email,
          industry_preferences,
          location_preferences,
          contract_type_preferences
        )
      `)
      .eq('daily_digest_enabled', true); // MANDATORY - All users must have this enabled

    if (error) {
      console.error('Error fetching users with daily digest:', error);
      throw error;
    }

    return users.map(user => ({
      id: user.user_id,
      email: user.user_profiles.email,
      preferences: {
        industries: user.user_profiles.industry_preferences || [],
        locations: user.user_profiles.location_preferences || [],
        contract_types: user.user_profiles.contract_type_preferences || []
      },
      opportunities: [],
      total_matches: 0
    }));
  }

  /**
   * Process digest for a single user
   */
  private static async processUserDigest(user: UserDigestData): Promise<void> {
    // Get opportunities for this user
    const opportunities = await this.getUserOpportunities(user);
    
    if (opportunities.length === 0) {
      console.log(`No opportunities found for user: ${user.email}`);
      return;
    }

    // Get total matches for context
    const totalMatches = await this.getTotalMatches(user);
    
    // Generate and send email
    const emailData = EmailService.generateDailyDigestEmail(
      opportunities,
      user.email,
      totalMatches
    );

    await EmailService.sendEmail(emailData);
  }

  /**
   * Get opportunities for a specific user
   */
  private static async getUserOpportunities(user: UserDigestData): Promise<DailyDigestOpportunity[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    // Build query based on user preferences
    let query = supabase
      .from('contracts')
      .select(`
        id,
        title,
        procuring_entity,
        submission_deadline,
        category,
        industry,
        location
      `)
      .gte('submission_deadline', today.toISOString())
      .lte('submission_deadline', thirtyDaysFromNow.toISOString())
      .eq('publish_status', 'published')
      .order('submission_deadline', { ascending: true })
      .limit(10);

    // Apply industry filter if user has preferences
    if (user.preferences.industries.length > 0) {
      query = query.in('industry', user.preferences.industries);
    }

    // Apply location filter if user has preferences
    if (user.preferences.locations.length > 0) {
      query = query.in('location', user.preferences.locations);
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error('Error fetching user opportunities:', error);
      throw error;
    }

    if (!contracts || contracts.length === 0) {
      return [];
    }

    // Transform contracts to opportunities with matching data
    return contracts.map(contract => {
      const deadline = new Date(contract.submission_deadline);
      const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: contract.id,
        title: contract.title,
        procuring_entity: contract.procuring_entity,
        submission_deadline: contract.submission_deadline,
        matching_keywords: this.getMatchingKeywords(contract, user.preferences),
        matching_location: this.getMatchingLocation(contract, user.preferences),
        match_score: this.calculateMatchScore(contract, user.preferences),
        days_remaining: daysRemaining,
        category: contract.category
      };
    });
  }

  /**
   * Get total matches for user context
   */
  private static async getTotalMatches(user: UserDigestData): Promise<number> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    let query = supabase
      .from('contracts')
      .select('id', { count: 'exact' })
      .gte('submission_deadline', today.toISOString())
      .lte('submission_deadline', thirtyDaysFromNow.toISOString())
      .eq('publish_status', 'published');

    // Apply same filters as opportunities
    if (user.preferences.industries.length > 0) {
      query = query.in('industry', user.preferences.industries);
    }

    if (user.preferences.locations.length > 0) {
      query = query.in('location', user.preferences.locations);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error getting total matches:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get matching keywords for display
   */
  private static getMatchingKeywords(contract: any, preferences: any): string {
    const matches = [];
    
    if (preferences.industries.includes(contract.industry)) {
      matches.push(contract.industry);
    }
    
    if (preferences.contract_types.includes(contract.category)) {
      matches.push(contract.category);
    }

    return matches.join(', ');
  }

  /**
   * Get matching location for display
   */
  private static getMatchingLocation(contract: any, preferences: any): string {
    if (preferences.locations.includes(contract.location)) {
      return contract.location;
    }
    return '';
  }

  /**
   * Calculate match score (1-5)
   */
  private static calculateMatchScore(contract: any, preferences: any): number {
    let score = 0;
    let totalChecks = 0;

    // Industry match
    if (preferences.industries.length > 0) {
      totalChecks++;
      if (preferences.industries.includes(contract.industry)) {
        score++;
      }
    }

    // Location match
    if (preferences.locations.length > 0) {
      totalChecks++;
      if (preferences.locations.includes(contract.location)) {
        score++;
      }
    }

    // Contract type match
    if (preferences.contract_types.length > 0) {
      totalChecks++;
      if (preferences.contract_types.includes(contract.category)) {
        score++;
      }
    }

    // Calculate score (1-5 scale)
    if (totalChecks === 0) return 3; // Default score if no preferences
    return Math.max(1, Math.min(5, Math.round((score / totalChecks) * 5)));
  }
}
