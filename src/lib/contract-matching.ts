import { supabase } from './supabase';
import { NotificationService } from './notifications';

export interface Contract {
  id: string;
  title: string;
  category: string;
  procuring_entity: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  submission_deadline?: string;
  status: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  preferred_categories: string[];
  business_type: string;
}

/**
 * Contract Matching Service
 * Handles matching new contracts with user preferences
 */
export class ContractMatchingService {
  /**
   * Find users who should be notified about a new contract
   */
  static async findMatchingUsers(contract: Contract): Promise<string[]> {
    try {
      // Get all users who have the contract's category in their preferences
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, preferred_categories')
        .not('preferred_categories', 'is', null);

      if (error) {
        console.error('Error fetching user profiles:', error);
        return [];
      }

      if (!profiles) return [];

      // Filter users whose preferences match the contract category
      const matchingUserIds = profiles
        .filter(profile => {
          if (!profile.preferred_categories || !Array.isArray(profile.preferred_categories)) {
            return false;
          }
          return profile.preferred_categories.includes(contract.category);
        })
        .map(profile => profile.id);

      return matchingUserIds;
    } catch (error) {
      console.error('Error finding matching users:', error);
      return [];
    }
  }

  /**
   * Create notifications for users when a new contract matches their preferences
   */
  static async createContractMatchNotifications(contract: Contract): Promise<void> {
    try {
      console.log(`🔍 Checking contract matches for: ${contract.title}`);
      
      // Find users who should be notified
      const matchingUserIds = await this.findMatchingUsers(contract);
      
      if (matchingUserIds.length === 0) {
        console.log('No matching users found for this contract');
        return;
      }

      console.log(`Found ${matchingUserIds.length} matching users`);

      // Create notifications for each matching user
      for (const userId of matchingUserIds) {
        // Get user email for email notifications
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        // Check user's notification preferences
        const preferences = await NotificationService.getUserPreferences(userId);
        
        if (!preferences?.new_contract_notifications) {
          console.log(`User ${userId} has disabled new contract notifications`);
          continue;
        }

        // Create the notification
        const title = `New Contract Match: ${contract.title}`;
        const message = this.generateContractMatchMessage(contract);
        const data = {
          contract_id: contract.id,
          contract_title: contract.title,
          contract_category: contract.category,
          procuring_entity: contract.procuring_entity,
          estimated_value_min: contract.estimated_value_min,
          estimated_value_max: contract.estimated_value_max,
          submission_deadline: contract.submission_deadline,
          contract_url: `/dashboard/contracts/${contract.id}`,
          user_email: userProfile?.email,
          contract: contract
        };

        // Determine notification channels based on user preferences
        const channels: ('email' | 'in_app')[] = [];
        if (preferences.email_enabled) channels.push('email');
        if (preferences.in_app_enabled) channels.push('in_app');

        // Create notification for each channel
        for (const channel of channels) {
          await NotificationService.createNotification(
            userId,
            'new_contract_match',
            title,
            message,
            data,
            channel,
            'medium'
          );
        }

        console.log(`Created notifications for user ${userId}`);
      }

      console.log(`✅ Created notifications for ${matchingUserIds.length} users`);
    } catch (error) {
      console.error('Error creating contract match notifications:', error);
    }
  }

  /**
   * Generate notification message for contract match
   */
  private static generateContractMatchMessage(contract: Contract): string {
    const deadline = contract.submission_deadline 
      ? new Date(contract.submission_deadline).toLocaleDateString()
      : 'Not specified';
    
    const valueRange = contract.estimated_value_min && contract.estimated_value_max
      ? `${this.formatCurrency(contract.estimated_value_min)} - ${this.formatCurrency(contract.estimated_value_max)}`
      : contract.estimated_value_min
      ? `From ${this.formatCurrency(contract.estimated_value_min)}`
      : contract.estimated_value_max
      ? `Up to ${this.formatCurrency(contract.estimated_value_max)}`
      : 'Not specified';

    return `A new contract matching your preferences has been published:

• Title: ${contract.title}
• Agency: ${contract.procuring_entity}
• Category: ${contract.category}
• Value: ${valueRange}
• Deadline: ${deadline}

View the full contract details to submit your bid.`;
  }

  /**
   * Format currency for display
   */
  private static formatCurrency(amount: number): string {
    if (amount >= 1000000000) {
      return `UGX ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `UGX ${(amount / 1000).toFixed(1)}K`;
    }
    return `UGX ${amount.toLocaleString()}`;
  }

  /**
   * Process all new contracts and create notifications
   * This should be called when new contracts are added to the system
   */
  static async processNewContracts(): Promise<void> {
    try {
      console.log('🔄 Processing new contracts for notifications...');
      
      // Get contracts created in the last hour that haven't been processed
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .gte('created_at', oneHourAgo)
        .eq('publish_status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching new contracts:', error);
        return;
      }

      if (!contracts || contracts.length === 0) {
        console.log('No new contracts found');
        return;
      }

      console.log(`Found ${contracts.length} new contracts to process`);

      // Process each contract
      for (const contract of contracts) {
        await this.createContractMatchNotifications(contract);
      }

      console.log('✅ Finished processing new contracts');
    } catch (error) {
      console.error('Error processing new contracts:', error);
    }
  }
}
