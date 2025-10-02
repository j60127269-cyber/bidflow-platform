/**
 * Consolidated Notification System
 * A unified, reliable notification system for BidCloud
 * Focuses on email notifications with improved delivery and error handling
 */

import { createClient } from '@supabase/supabase-js';
import { EmailService } from './email-service';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface NotificationData {
  contract?: any;
  contracts?: any[];
  user?: any;
  days_remaining?: number;
  [key: string]: any;
}

export interface NotificationPreferences {
  new_contract_notifications: boolean;
  deadline_reminders: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string;   // HH:MM format
  quiet_hours_end?: string;     // HH:MM format
}

export interface NotificationChannel {
  email: boolean;
  in_app: boolean;
}

export class ConsolidatedNotificationSystem {
  /**
   * Send notification through enabled channels
   */
  static async sendNotification(
    userId: string,
    type: 'new_contract_match' | 'deadline_reminder',
    title: string,
    message: string,
    data: NotificationData,
    channels: NotificationChannel = { email: true, in_app: true }
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
      console.error('Error in sendNotification:', error);
      return { success: false, results: {} };
    }
  }

  /**
   * Send email notification with enhanced templates and retry logic
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
        default:
          emailData = {
            to: userEmail,
            subject: title,
            html: `<h1>${title}</h1><p>${message}</p>`,
            text: `${title}\n\n${message}`
          };
      }

      // Retry logic for email delivery
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          const success = await EmailService.sendEmail(emailData);
          if (success) {
            console.log(`✅ Email sent successfully to ${userEmail} (attempt ${retryCount + 1})`);
            return true;
          }
        } catch (error) {
          console.error(`Email attempt ${retryCount + 1} failed:`, error);
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      console.error(`❌ Failed to send email to ${userEmail} after ${maxRetries} attempts`);
      return false;

    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private static async sendInAppNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      // Store in-app notification in database
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          title: title,
          message: message,
          data: data,
          channel: 'in_app',
          notification_status: 'sent',
          sent_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing in-app notification:', error);
        return false;
      }

      console.log(`✅ In-app notification stored for user ${userId}`);
      return true;

    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  /**
   * Get user notification preferences
   */
  private static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return {
        new_contract_notifications: data.new_contract_notifications ?? true,
        deadline_reminders: data.deadline_reminders ?? true,
        email_enabled: data.email_enabled ?? true,
        in_app_enabled: data.in_app_enabled ?? true,
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end
      };

    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  /**
   * Check if user should receive this type of notification
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

    // Handle quiet hours that span midnight
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
      // Calculate next delivery time (after quiet hours end)
      const preferences = await this.getUserPreferences(userId);
      if (!preferences?.quiet_hours_end) return;

      const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
      const scheduledAt = new Date();
      scheduledAt.setHours(endHour, endMin, 0, 0);
      
      // If quiet hours end is tomorrow, add a day
      if (scheduledAt <= new Date()) {
        scheduledAt.setDate(scheduledAt.getDate() + 1);
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          title: title,
          message: message,
          data: data,
          channel: 'email',
          notification_status: 'pending',
          scheduled_at: scheduledAt.toISOString()
        });

      console.log(`📅 Notification scheduled for ${scheduledAt.toISOString()}`);

    } catch (error) {
      console.error('Error scheduling notification:', error);
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
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          title: title,
          message: message,
          data: data,
          channel: 'email',
          notification_status: results.email ? 'sent' : 'failed',
          sent_at: results.email ? new Date().toISOString() : null
        });

    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Process pending notifications (for scheduled notifications)
   */
  static async processPendingNotifications(): Promise<void> {
    try {
      console.log('🔄 Processing pending notifications...');

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:user_id(email)
        `)
        .eq('notification_status', 'pending')
        .lte('scheduled_at', new Date().toISOString());

      if (error) {
        console.error('Error fetching pending notifications:', error);
        return;
      }

      if (!notifications || notifications.length === 0) {
        console.log('No pending notifications found');
        return;
      }

      console.log(`Found ${notifications.length} pending notifications`);

      let successCount = 0;
      let errorCount = 0;

      for (const notification of notifications) {
        try {
          const userEmail = notification.profiles?.email;
          if (!userEmail) {
            console.error('No email found for notification:', notification.id);
            errorCount++;
            continue;
          }

          // Send the notification
          const result = await this.sendNotification(
            notification.user_id,
            notification.type,
            notification.title,
            notification.message,
            notification.data,
            { email: true, in_app: true }
          );

          if (result.success) {
            // Mark as sent
            await supabase
              .from('notifications')
              .update({
                notification_status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', notification.id);

            successCount++;
          } else {
            // Mark as failed
            await supabase
              .from('notifications')
              .update({
                notification_status: 'failed'
              })
              .eq('id', notification.id);

            errorCount++;
          }

        } catch (error) {
          console.error('Error processing notification:', error);
          errorCount++;
        }
      }

      console.log(`✅ Processed ${notifications.length} notifications: ${successCount} success, ${errorCount} failed`);

    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Get notification statistics for a user
   */
  static async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    pending: number;
    failed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('notification_status, read_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching notification stats:', error);
        return { total: 0, unread: 0, pending: 0, failed: 0 };
      }

      const stats = {
        total: data.length,
        unread: data.filter(n => n.notification_status === 'sent' && !n.read_at).length,
        pending: data.filter(n => n.notification_status === 'pending').length,
        failed: data.filter(n => n.notification_status === 'failed').length
      };

      return stats;

    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, pending: 0, failed: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}
