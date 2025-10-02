import { supabase } from './supabase';
import { EmailService } from './email-service';
import { whatsappService } from './whatsappService';

export interface NotificationData {
  contract?: {
    id: string;
    title: string;
    reference_number: string;
    category: string;
    procuring_entity: string;
    submission_deadline: string;
    estimated_value_min?: number;
    estimated_value_max?: number;
    detail_url?: string;
  };
  user?: {
    id: string;
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
  days_remaining?: number;
  time_remaining?: string;
  [key: string]: any;
}

export interface NotificationChannel {
  email: boolean;
  whatsapp: boolean;
  in_app: boolean;
}

export interface NotificationPreferences {
  new_contract_notifications: boolean;
  deadline_reminders: boolean;
  daily_digest_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  whatsapp_enabled: boolean;
  notification_frequency: 'real-time' | 'daily' | 'weekly';
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string;   // HH:MM format
}

export class ConsolidatedNotificationService {
  /**
   * Send notification through all enabled channels
   */
  static async sendNotification(
    userId: string,
    type: 'new_contract_match' | 'deadline_reminder' | 'daily_digest',
    title: string,
    message: string,
    data: NotificationData,
    channels: NotificationChannel = { email: true, whatsapp: false, in_app: true }
  ): Promise<{ success: boolean; results: Record<string, boolean> }> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) {
        console.error('Could not get user preferences for:', userId);
        return { success: false, results: {} };
      }

      // Check if user wants this type of notification
      if (!this.shouldSendNotification(type, preferences)) {
        console.log(`User ${userId} has disabled ${type} notifications`);
        return { success: true, results: { skipped: true } };
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        console.log(`User ${userId} is in quiet hours, scheduling for later`);
        await this.scheduleNotification(userId, type, title, message, data, channels);
        return { success: true, results: { scheduled: true } };
      }

      const results: Record<string, boolean> = {};

      // Send email notification
      if (channels.email && preferences.email_enabled) {
        try {
          const emailSent = await this.sendEmailNotification(userId, type, title, message, data);
          results.email = emailSent;
        } catch (error) {
          console.error('Email notification failed:', error);
          results.email = false;
        }
      }

      // Send WhatsApp notification
      if (channels.whatsapp && preferences.whatsapp_enabled) {
        try {
          const whatsappSent = await this.sendWhatsAppNotification(userId, type, title, message, data);
          results.whatsapp = whatsappSent;
        } catch (error) {
          console.error('WhatsApp notification failed:', error);
          results.whatsapp = false;
        }
      }

      // Send in-app notification
      if (channels.in_app && preferences.in_app_enabled) {
        try {
          const inAppSent = await this.sendInAppNotification(userId, type, title, message, data);
          results.in_app = inAppSent;
        } catch (error) {
          console.error('In-app notification failed:', error);
          results.in_app = false;
        }
      }

      // Store notification in database
      await this.storeNotification(userId, type, title, message, data, results);

      const success = Object.values(results).some(result => result === true);
      return { success, results };

    } catch (error) {
      console.error('Error sending consolidated notification:', error);
      return { success: false, results: {} };
    }
  }

  /**
   * Send email notification with enhanced templates
   */
  private static async sendEmailNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      // Get user email
      const userEmail = data.user?.email;
      if (!userEmail) {
        console.error('No user email found for notification');
        return false;
      }

      let emailData;
      
      switch (type) {
        case 'new_contract_match':
          emailData = EmailService.generateContractMatchEmail(data.contract!, userEmail);
          break;
        case 'deadline_reminder':
          emailData = EmailService.generateDeadlineReminderEmail(
            data.contract!, 
            userEmail, 
            data.days_remaining || 2
          );
          break;
        case 'daily_digest':
          emailData = EmailService.generateDailyDigestEmail(data.contracts || [], userEmail);
          break;
        default:
          emailData = {
            to: userEmail,
            subject: title,
            html: `<h1>${title}</h1><p>${message}</p>`,
            text: `${title}\n\n${message}`
          };
      }

      return await EmailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp notification with enhanced templates
   */
  private static async sendWhatsAppNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      // Get user phone number
      const userPhone = data.user?.phone;
      if (!userPhone) {
        console.error('No user phone found for WhatsApp notification');
        return false;
      }

      let whatsappMessage: string;

      switch (type) {
        case 'new_contract_match':
          whatsappMessage = this.createContractMatchWhatsAppMessage(data.contract!);
          break;
        case 'deadline_reminder':
          whatsappMessage = whatsappService.createDeadlineReminderMessage(
            data.contract!.title,
            data.contract!.procuring_entity,
            data.contract!.submission_deadline,
            data.time_remaining || 'Unknown'
          );
          break;
        case 'daily_digest':
          whatsappMessage = this.createDailyDigestWhatsAppMessage(data.contracts || []);
          break;
        default:
          whatsappMessage = whatsappService.createGeneralNotificationMessage(title, message);
      }

      await whatsappService.send(userPhone, whatsappMessage);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Send in-app notification (real-time)
   */
  private static async sendInAppNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      // TODO: Implement real-time notification logic
      // This could use WebSockets, Server-Sent Events, or Supabase Realtime
      console.log('Sending in-app notification:', { userId, type, title });
      
      // For now, just return true as the notification is stored in the database
      return true;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  /**
   * Store notification in database
   */
  private static async storeNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData,
    results: Record<string, boolean>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          notification_status: Object.values(results).some(r => r) ? 'sent' : 'failed',
          channel: 'multi', // Multi-channel notification
          priority: type === 'deadline_reminder' ? 'high' : 'medium',
          sent_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing notification:', error);
      }
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private static shouldSendNotification(
    type: string,
    preferences: NotificationPreferences
  ): boolean {
    switch (type) {
      case 'new_contract_match':
        return preferences.new_contract_notifications;
      case 'deadline_reminder':
        return preferences.deadline_reminders;
      case 'daily_digest':
        return preferences.daily_digest_enabled;
      default:
        return true;
    }
  }

  /**
   * Check if current time is within user's quiet hours
   */
  private static isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  /**
   * Schedule notification for later delivery
   */
  private static async scheduleNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData,
    channels: NotificationChannel
  ): Promise<void> {
    try {
      // Calculate next available time (after quiet hours)
      const preferences = await this.getUserPreferences(userId);
      if (!preferences?.quiet_hours_end) return;

      const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(endHour, endMin, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          notification_status: 'pending',
          channel: 'multi',
          priority: type === 'deadline_reminder' ? 'high' : 'medium',
          scheduled_at: scheduledTime.toISOString()
        });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Create WhatsApp message for contract match
   */
  private static createContractMatchWhatsAppMessage(contract: any): string {
    return `🎯 *New Contract Match!*

*${contract.title}*
📋 Ref: ${contract.reference_number}
🏢 Client: ${contract.procuring_entity}
📅 Deadline: ${new Date(contract.submission_deadline).toLocaleDateString()}
💰 Value: ${contract.estimated_value_min ? `UGX ${contract.estimated_value_min.toLocaleString()}` : 'Not specified'}

⚡ *This contract matches your preferences!*

View details: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/contracts/${contract.id}

---
BidCloud - Uganda's Premier Contract Intelligence Platform`;
  }

  /**
   * Create WhatsApp message for daily digest
   */
  private static createDailyDigestWhatsAppMessage(contracts: any[]): string {
    if (contracts.length === 0) {
      return `📊 *Daily Contract Digest*

No new contracts match your preferences today.

Check back tomorrow for new opportunities!

---
BidCloud - Uganda's Premier Contract Intelligence Platform`;
    }

    let message = `📊 *Daily Contract Digest*\n\n`;
    message += `Found ${contracts.length} new contract${contracts.length > 1 ? 's' : ''} matching your preferences:\n\n`;

    contracts.slice(0, 3).forEach((contract, index) => {
      message += `${index + 1}. *${contract.title}*\n`;
      message += `   📅 ${new Date(contract.submission_deadline).toLocaleDateString()}\n`;
      message += `   🏢 ${contract.procuring_entity}\n\n`;
    });

    if (contracts.length > 3) {
      message += `... and ${contracts.length - 3} more opportunities!\n\n`;
    }

    message += `View all contracts: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard\n\n`;
    message += `---\nBidCloud - Uganda's Premier Contract Intelligence Platform`;

    return message;
  }

  /**
   * Process pending notifications (for cron jobs)
   */
  static async processPendingNotifications(): Promise<{ processed: number; failed: number }> {
    try {
      const { data: pendingNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('notification_status', 'pending')
        .lte('scheduled_at', new Date().toISOString());

      if (error) {
        console.error('Error fetching pending notifications:', error);
        return { processed: 0, failed: 0 };
      }

      let processed = 0;
      let failed = 0;

      for (const notification of pendingNotifications || []) {
        try {
          const preferences = await this.getUserPreferences(notification.user_id);
          if (!preferences) {
            failed++;
            continue;
          }

          const channels: NotificationChannel = {
            email: preferences.email_enabled,
            whatsapp: preferences.whatsapp_enabled,
            in_app: preferences.in_app_enabled
          };

          const result = await this.sendNotification(
            notification.user_id,
            notification.type as any,
            notification.title,
            notification.message,
            notification.data,
            channels
          );

          if (result.success) {
            processed++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error('Error processing notification:', error);
          failed++;
        }
      }

      return { processed, failed };
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      return { processed: 0, failed: 0 };
    }
  }
}
