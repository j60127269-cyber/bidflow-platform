import { supabase } from './supabase';
import { NotificationService } from './notifications';

export interface TrackedContract {
  id: string;
  user_id: string;
  contract_id: string;
  contract_title: string;
  submission_deadline: string;
  status: string;
  email_alerts: boolean;
  whatsapp_alerts: boolean;
}

/**
 * Deadline Reminder Service
 * Handles sending deadline reminders for tracked contracts
 */
export class DeadlineReminderService {
  /**
   * Check for contracts due in 2 days and create reminder notifications
   */
  static async checkDeadlineReminders(): Promise<void> {
    try {
      console.log('🔔 Checking deadline reminders...');
      
      // Calculate date 2 days from now
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      
      // Get start and end of the target day
      const startOfDay = new Date(twoDaysFromNow);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(twoDaysFromNow);
      endOfDay.setHours(23, 59, 59, 999);

      // Find tracked contracts due in 2 days
      const { data: trackedContracts, error } = await supabase
        .from('bid_tracking')
        .select(`
          id,
          user_id,
          contract_id,
          email_alerts,
          whatsapp_alerts,
          contracts!inner(
            id,
            title,
            submission_deadline,
            publish_status,
            procuring_entity
          )
        `)
        .gte('contracts.submission_deadline', startOfDay.toISOString())
        .lte('contracts.submission_deadline', endOfDay.toISOString())
        .eq('contracts.publish_status', 'published');

      if (error) {
        console.error('Error fetching tracked contracts:', error);
        return;
      }

      if (!trackedContracts || trackedContracts.length === 0) {
        console.log('No contracts due in 2 days');
        return;
      }

      console.log(`Found ${trackedContracts.length} contracts due in 2 days`);

      // Create reminder notifications for each tracked contract
      for (const trackedContract of trackedContracts) {
        const contract = trackedContract.contracts;
        if (!contract) continue;

        await this.createDeadlineReminderNotification(
          trackedContract.user_id,
          contract,
          trackedContract.email_alerts,
          trackedContract.whatsapp_alerts
        );
      }

      console.log('✅ Finished processing deadline reminders');
    } catch (error) {
      console.error('Error checking deadline reminders:', error);
    }
  }

  /**
   * Create deadline reminder notification for a specific contract
   */
  private static async createDeadlineReminderNotification(
    userId: string,
    contract: any,
    emailAlerts: boolean,
    whatsappAlerts: boolean
  ): Promise<void> {
    try {
      // Check user's notification preferences
      const preferences = await NotificationService.getUserPreferences(userId);
      
      if (!preferences?.deadline_reminders) {
        console.log(`User ${userId} has disabled deadline reminders`);
        return;
      }

      const title = `Deadline Reminder: ${contract.title} - 2 Days Left`;
      const message = this.generateDeadlineReminderMessage(contract);
      const data = {
        contract_id: contract.id,
        contract_title: contract.title,
        submission_deadline: contract.submission_deadline,
        procuring_entity: contract.procuring_entity,
        contract_url: `/dashboard/contracts/${contract.id}`,
        days_remaining: 2
      };

      // Determine notification channels based on user preferences and contract settings
      const channels: ('email' | 'in_app' | 'whatsapp')[] = [];
      
      if (preferences.in_app_enabled) {
        channels.push('in_app');
      }
      
      if (preferences.email_enabled && emailAlerts) {
        channels.push('email');
      }
      
      if (preferences.whatsapp_enabled && whatsappAlerts) {
        channels.push('whatsapp');
      }

      // Create notification for each channel
      for (const channel of channels) {
        await NotificationService.createNotification(
          userId,
          'deadline_reminder',
          title,
          message,
          data,
          channel,
          'high' // Deadline reminders are high priority
        );
      }

      console.log(`Created deadline reminder for user ${userId}, contract ${contract.title}`);
    } catch (error) {
      console.error('Error creating deadline reminder notification:', error);
    }
  }

  /**
   * Generate notification message for deadline reminder
   */
  private static generateDeadlineReminderMessage(contract: any): string {
    const deadline = new Date(contract.submission_deadline);
    const deadlineFormatted = deadline.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `The contract you're tracking is due soon:

• Title: ${contract.title}
• Agency: ${contract.procuring_entity}
• Deadline: ${deadlineFormatted}
• Days Remaining: 2

Don't miss this opportunity! Review the contract details and submit your bid before the deadline.`;
  }

  /**
   * Get contracts due soon for a specific user
   */
  static async getUserUpcomingDeadlines(userId: string, days: number = 7): Promise<TrackedContract[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data: trackedContracts, error } = await supabase
        .from('bid_tracking')
        .select(`
          id,
          user_id,
          contract_id,
          email_alerts,
          whatsapp_alerts,
          contracts!inner(
            id,
            title,
            submission_deadline,
            publish_status,
            procuring_entity
          )
        `)
        .eq('user_id', userId)
        .lte('contracts.submission_deadline', futureDate.toISOString())
        .eq('contracts.publish_status', 'published')
        .order('contracts.submission_deadline', { ascending: true });

      if (error) {
        console.error('Error fetching user upcoming deadlines:', error);
        return [];
      }

      return trackedContracts || [];
    } catch (error) {
      console.error('Error fetching user upcoming deadlines:', error);
      return [];
    }
  }

  /**
   * Process all deadline reminders
   * This should be called by a cron job or scheduled task
   */
  static async processAllDeadlineReminders(): Promise<void> {
    try {
      console.log('🔄 Processing all deadline reminders...');
      
      // Check for contracts due in 2 days
      await this.checkDeadlineReminders();
      
      // You could also add checks for 7 days, 1 day, etc.
      // await this.checkDeadlineReminders(7); // 7 days
      // await this.checkDeadlineReminders(1); // 1 day
      
      console.log('✅ Finished processing all deadline reminders');
    } catch (error) {
      console.error('Error processing deadline reminders:', error);
    }
  }
}
