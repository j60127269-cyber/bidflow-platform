import { supabase } from './supabase';
import { NotificationService } from './notificationService';
import { Contract } from '@/types/database';

export class PreferenceNotificationService {
  // Check if a new contract matches user preferences and send notification
  static async checkAndNotifyNewContract(contract: Contract): Promise<void> {
    try {
      // Get all users with preferences
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .not('preferred_categories', 'is', null);

      if (usersError) {
        console.error('Error fetching users for preference notifications:', usersError);
        return;
      }

      if (!users || users.length === 0) {
        console.log('No users with preferences found');
        return;
      }

      // Check each user's preferences against the new contract
      for (const user of users) {
        const shouldNotify = await this.shouldNotifyUser(user, contract);
        
        if (shouldNotify) {
          await this.sendPreferenceMatchNotification(user.id, contract);
        }
      }
    } catch (error) {
      console.error('Error in checkAndNotifyNewContract:', error);
    }
  }

  // Determine if a user should be notified about a contract based on their preferences
  private static async shouldNotifyUser(user: any, contract: Contract): Promise<boolean> {
    try {
      // Check category match
      const categoryMatch = this.checkCategoryMatch(user.preferred_categories, contract.category);
      if (!categoryMatch) return false;

      // Check value range match
      const valueMatch = this.checkValueRangeMatch(
        user.min_contract_value,
        user.max_contract_value,
        contract.estimated_value_min || contract.estimated_value_max || 0
      );
      if (!valueMatch) return false;

      // Check business type match (optional)
      const businessTypeMatch = this.checkBusinessTypeMatch(user.business_type, contract);
      
      // User should be notified if category and value match, business type is bonus
      return categoryMatch && valueMatch;
    } catch (error) {
      console.error('Error checking user preferences:', error);
      return false;
    }
  }

  // Check if contract category matches user's preferred categories
  private static checkCategoryMatch(preferredCategories: string[], contractCategory: string): boolean {
    if (!preferredCategories || preferredCategories.length === 0) return true;
    
    return preferredCategories.some(prefCategory => {
      // Handle "All Categories" preference
      if (prefCategory === "All Categories") return true;
      
      // Direct category match
      if (prefCategory === contractCategory) return true;
      
      // Partial match for broader categories
      return contractCategory.toLowerCase().includes(prefCategory.toLowerCase()) ||
             prefCategory.toLowerCase().includes(contractCategory.toLowerCase());
    });
  }

  // Check if contract value falls within user's preferred range
  private static checkValueRangeMatch(
    userMinValue: number,
    userMaxValue: number,
    contractValue: number
  ): boolean {
    if (!contractValue || contractValue === 0) return true; // No value specified, allow it
    
    return contractValue >= userMinValue && contractValue <= userMaxValue;
  }

  // Check if contract matches user's business type
  private static checkBusinessTypeMatch(userBusinessType: string, contract: Contract): boolean {
    if (!userBusinessType || userBusinessType === "General") return true;
    
    const allText = [
      contract.title,
      contract.short_description,
      contract.evaluation_methodology,
      ...(contract.required_documents || [])
    ].join(' ').toLowerCase();
    
    return allText.includes(userBusinessType.toLowerCase());
  }

  // Send notification to user about matching contract
  private static async sendPreferenceMatchNotification(userId: string, contract: Contract): Promise<void> {
    try {
      const contractValue = contract.estimated_value_min || contract.estimated_value_max || 0;
      const valueText = contractValue > 0 ? ` (${this.formatValue(contractValue)})` : '';
      
      const notification = {
        title: "New Contract Matches Your Preferences",
        message: `A new ${contract.category} contract from ${contract.procuring_entity} matches your preferences${valueText}. Check it out!`,
        type: 'info' as const
      };

      // Create in-app notification
      await NotificationService.createNotification(userId, notification);
      
      // TODO: Add email/WhatsApp notifications based on user's notification preferences
      // This would require checking user's notification settings from the profiles table
      
      console.log(`Preference notification sent to user ${userId} for contract ${contract.id}`);
    } catch (error) {
      console.error('Error sending preference notification:', error);
    }
  }

  // Format contract value for display
  private static formatValue(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K UGX`;
    } else {
      return `${value} UGX`;
    }
  }

  // Send deadline reminders for contracts matching user preferences
  static async sendPreferenceBasedDeadlineReminders(): Promise<void> {
    try {
      // Get all users with preferences
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .not('preferred_categories', 'is', null);

      if (usersError) {
        console.error('Error fetching users for deadline reminders:', usersError);
        return;
      }

      if (!users || users.length === 0) return;

      // Get contracts with deadlines in the next 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .gte('submission_deadline', new Date().toISOString().split('T')[0])
        .lte('submission_deadline', threeDaysFromNow.toISOString().split('T')[0])
        .neq('status', 'awarded')
        .neq('status', 'completed');

      if (contractsError) {
        console.error('Error fetching contracts for deadline reminders:', contractsError);
        return;
      }

      if (!contracts || contracts.length === 0) return;

      // Check each user against each contract
      for (const user of users) {
        for (const contract of contracts) {
          const shouldNotify = await this.shouldNotifyUser(user, contract);
          
          if (shouldNotify) {
            await this.sendDeadlineReminderNotification(user.id, contract);
          }
        }
      }
    } catch (error) {
      console.error('Error in sendPreferenceBasedDeadlineReminders:', error);
    }
  }

  // Send deadline reminder notification
  private static async sendDeadlineReminderNotification(userId: string, contract: Contract): Promise<void> {
    try {
      const deadline = new Date(contract.submission_deadline);
      const now = new Date();
      const timeDiff = deadline.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      const timeText = daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;
      const contractValue = contract.estimated_value_min || contract.estimated_value_max || 0;
      const valueText = contractValue > 0 ? ` (${this.formatValue(contractValue)})` : '';
      
      const notification = {
        title: "Contract Deadline Approaching",
        message: `The ${contract.category} contract from ${contract.procuring_entity}${valueText} closes ${timeText}. Don't miss out!`,
        type: 'warning' as const
      };

      await NotificationService.createNotification(userId, notification);
      
      console.log(`Deadline reminder sent to user ${userId} for contract ${contract.id}`);
    } catch (error) {
      console.error('Error sending deadline reminder:', error);
    }
  }

  // Get personalized contract recommendations for a user
  static async getPersonalizedRecommendations(userId: string, limit = 10): Promise<Contract[]> {
    try {
      // Get user preferences
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user preferences:', userError);
        return [];
      }

      // Get all active contracts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .neq('status', 'awarded')
        .neq('status', 'completed')
        .gte('submission_deadline', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error('Error fetching contracts:', contractsError);
        return [];
      }

      if (!contracts || contracts.length === 0) return [];

      // Score and filter contracts based on user preferences
      const scoredContracts = contracts.map(contract => {
        let score = 0;
        
        // Category match (50% weight)
        if (this.checkCategoryMatch(user.preferred_categories, contract.category)) {
          score += 50;
        }
        
        // Value range match (30% weight)
        const contractValue = contract.estimated_value_min || contract.estimated_value_max || 0;
        if (this.checkValueRangeMatch(user.min_contract_value, user.max_contract_value, contractValue)) {
          score += 30;
        }
        
        // Business type match (20% weight)
        if (this.checkBusinessTypeMatch(user.business_type, contract)) {
          score += 20;
        }
        
        return { ...contract, recommendationScore: score };
      });

      // Sort by score and return top recommendations
      return scoredContracts
        .filter(contract => contract.recommendationScore > 0)
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
}
