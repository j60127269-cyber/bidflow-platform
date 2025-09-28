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
      .from('profiles')
      .select(`
        id,
        email,
        industry_preferences,
        location_preferences,
        contract_type_preferences
      `)
      .not('email', 'is', null); // Get all users with email addresses

    if (error) {
      console.error('Error fetching users for daily digest:', error);
      throw error;
    }

    return users.map(user => ({
      id: user.id,
      email: user.email,
      preferences: {
        industries: user.industry_preferences || [],
        locations: user.location_preferences || [],
        contract_types: user.contract_type_preferences || []
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
        category
      `)
      .gte('submission_deadline', today.toISOString())
      .lte('submission_deadline', thirtyDaysFromNow.toISOString())
      .eq('publish_status', 'published')
      .order('submission_deadline', { ascending: true })
      .limit(10);

    // Apply industry filter if user has preferences (using category field)
    if (user.preferences.industries.length > 0) {
      // Use flexible matching for categories
      const industryConditions = user.preferences.industries.map(industry => {
        const keywords = this.getIndustryKeywords(industry);
        return keywords.map(keyword => `category.ilike.%${keyword}%`).join(',');
      });
      // For now, just get all contracts and filter in code
    }

    // Apply location filter if user has preferences (using procuring_entity)
    if (user.preferences.locations.length > 0) {
      // Use flexible matching for locations in procuring_entity
      const locationConditions = user.preferences.locations.map(location => {
        return `procuring_entity.ilike.%${location}%`;
      });
      // For now, just get all contracts and filter in code
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error('Error fetching user opportunities:', error);
      throw error;
    }

    if (!contracts || contracts.length === 0) {
      return [];
    }

    // Filter contracts based on user preferences
    const filteredContracts = contracts.filter(contract => {
      return this.matchesUserPreferences(contract, user.preferences);
    });

    // Transform contracts to opportunities with matching data
    return filteredContracts.map(contract => {
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

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('id, category, procuring_entity')
      .gte('submission_deadline', today.toISOString())
      .lte('submission_deadline', thirtyDaysFromNow.toISOString())
      .eq('publish_status', 'published');

    if (error) {
      console.error('Error getting total matches:', error);
      return 0;
    }

    if (!contracts) return 0;

    // Filter contracts based on user preferences
    const filteredContracts = contracts.filter(contract => {
      return this.matchesUserPreferences(contract, user.preferences);
    });

    return filteredContracts.length;
  }

  /**
   * Check if contract matches user preferences
   */
  private static matchesUserPreferences(contract: any, preferences: any): boolean {
    // If no preferences set, match all contracts
    if (preferences.industries.length === 0 && preferences.locations.length === 0 && preferences.contract_types.length === 0) {
      return true;
    }

    let hasMatch = false;

    // Check industry match (using category field)
    if (preferences.industries.length > 0) {
      for (const industry of preferences.industries) {
        const keywords = this.getIndustryKeywords(industry);
        for (const keyword of keywords) {
          if (contract.category.toLowerCase().includes(keyword.toLowerCase())) {
            hasMatch = true;
            break;
          }
        }
        if (hasMatch) break;
      }
    }

    // Check location match (using procuring_entity field)
    if (preferences.locations.length > 0) {
      for (const location of preferences.locations) {
        if (contract.procuring_entity.toLowerCase().includes(location.toLowerCase())) {
          hasMatch = true;
          break;
        }
      }
    }

    // Check contract type match (using category field)
    if (preferences.contract_types.length > 0) {
      for (const contractType of preferences.contract_types) {
        if (contract.category.toLowerCase().includes(contractType.toLowerCase())) {
          hasMatch = true;
          break;
        }
      }
    }

    return hasMatch;
  }

  /**
   * Get industry keywords for flexible matching
   */
  private static getIndustryKeywords(industry: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'Information Technology': ['ict', 'computer', 'software', 'technology', 'it', 'digital'],
      'Construction': ['construction', 'building', 'infrastructure', 'civil'],
      'Healthcare': ['health', 'medical', 'hospital', 'clinic'],
      'Education': ['education', 'school', 'university', 'learning'],
      'Transportation': ['transport', 'logistics', 'shipping', 'delivery']
    };
    
    return keywordMap[industry] || [industry.toLowerCase()];
  }

  /**
   * Get matching keywords for display
   */
  private static getMatchingKeywords(contract: any, preferences: any): string {
    const matches = [];
    
    // Check industry matches
    if (preferences.industries.length > 0) {
      for (const industry of preferences.industries) {
        const keywords = this.getIndustryKeywords(industry);
        for (const keyword of keywords) {
          if (contract.category.toLowerCase().includes(keyword.toLowerCase())) {
            matches.push(industry);
            break;
          }
        }
      }
    }
    
    // Check contract type matches
    if (preferences.contract_types.length > 0) {
      for (const contractType of preferences.contract_types) {
        if (contract.category.toLowerCase().includes(contractType.toLowerCase())) {
          matches.push(contractType);
        }
      }
    }

    return matches.join(', ');
  }

  /**
   * Get matching location for display
   */
  private static getMatchingLocation(contract: any, preferences: any): string {
    if (preferences.locations.length > 0) {
      for (const location of preferences.locations) {
        if (contract.procuring_entity.toLowerCase().includes(location.toLowerCase())) {
          return location;
        }
      }
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
      for (const industry of preferences.industries) {
        const keywords = this.getIndustryKeywords(industry);
        for (const keyword of keywords) {
          if (contract.category.toLowerCase().includes(keyword.toLowerCase())) {
            score++;
            break;
          }
        }
      }
    }

    // Location match
    if (preferences.locations.length > 0) {
      totalChecks++;
      for (const location of preferences.locations) {
        if (contract.procuring_entity.toLowerCase().includes(location.toLowerCase())) {
          score++;
          break;
        }
      }
    }

    // Contract type match
    if (preferences.contract_types.length > 0) {
      totalChecks++;
      for (const contractType of preferences.contract_types) {
        if (contract.category.toLowerCase().includes(contractType.toLowerCase())) {
          score++;
          break;
        }
      }
    }

    // Calculate score (1-5 scale)
    if (totalChecks === 0) return 3; // Default score if no preferences
    return Math.max(1, Math.min(5, Math.round((score / totalChecks) * 5)));
  }
}
