import { supabase } from './supabase';
import { EmailService } from './email-service';

export interface ImmediateNotificationData {
  contractId: string;
  contractTitle: string;
  procuringEntity: string;
  industry: string;
  category: string;
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  submissionDeadline?: string;
}

/**
 * Immediate Notification Service for new contract matches
 * Sends instant notifications when new contracts match user preferences
 */
export class ImmediateNotificationService {
  /**
   * Process immediate notifications for a new contract
   */
  static async processNewContract(contractData: any): Promise<void> {
    try {
      console.log('Processing immediate notifications for new contract:', contractData.id);
      
      // Get all users who might be interested in this contract
      const interestedUsers = await this.getInterestedUsers(contractData);
      console.log(`Found ${interestedUsers.length} users interested in contract ${contractData.id}`);
      
      // Send immediate notifications to each user
      for (const user of interestedUsers) {
        try {
          await this.sendImmediateNotification(user, contractData);
          console.log(`Immediate notification sent to user: ${user.email}`);
        } catch (error) {
          console.error(`Error sending immediate notification to user ${user.email}:`, error);
        }
      }
      
      console.log('Immediate notification processing completed');
    } catch (error) {
      console.error('Error in processNewContract:', error);
      throw error;
    }
  }

  /**
   * Get users who might be interested in this contract
   */
  private static async getInterestedUsers(contractData: any): Promise<any[]> {
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        industry_preferences,
        location_preferences,
        contract_type_preferences
      `)
      .not('email', 'is', null);

    if (error) {
      console.error('Error fetching users for immediate notification:', error);
      throw error;
    }

    // Filter users based on their preferences
    return users.filter(user => {
      const matchesIndustry = !user.industry_preferences || 
        user.industry_preferences.length === 0 || 
        user.industry_preferences.includes(contractData.industry);
      
      const matchesLocation = !user.location_preferences || 
        user.location_preferences.length === 0 || 
        user.location_preferences.includes(contractData.location);
      
      const matchesContractType = !user.contract_type_preferences || 
        user.contract_type_preferences.length === 0 || 
        user.contract_type_preferences.includes(contractData.category);

      return matchesIndustry || matchesLocation || matchesContractType;
    });
  }

  /**
   * Send immediate notification to a user
   */
  private static async sendImmediateNotification(user: any, contractData: any): Promise<void> {
    const emailData = EmailService.generateImmediateNotificationEmail(contractData, user.email);
    await EmailService.sendEmail(emailData);
  }
}
