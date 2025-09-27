import { supabase } from './supabase';
import { EmailService } from './email-service';

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_contract_match' | 'deadline_reminder';
  title: string;
  message: string;
  data?: any;
  notification_status: 'pending' | 'sent' | 'failed' | 'read';
  channel: 'email' | 'in_app' | 'whatsapp';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationPreferences {
  new_contract_notifications: boolean;
  deadline_reminders: boolean;
  daily_digest_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  whatsapp_enabled: boolean;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    type: 'new_contract_match' | 'deadline_reminder',
    title: string,
    message: string,
    data?: any,
    channel: 'email' | 'in_app' | 'whatsapp' = 'email',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    scheduledAt?: Date
  ): Promise<string | null> {
    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data,
        p_channel: channel,
        p_priority: priority,
        p_scheduled_at: scheduledAt?.toISOString() || new Date().toISOString()
      });

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_notification_preferences', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting user preferences:', error);
        return null;
      }

      if (!data || data.length === 0) {
        // Return default preferences if none exist
        return {
          new_contract_notifications: true,
          deadline_reminders: true,
          daily_digest_enabled: true, // MANDATORY - Always enabled
          email_enabled: true,
          in_app_enabled: true,
          whatsapp_enabled: false
        };
      }

      return data[0];
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
    preferences: Partial<UserNotificationPreferences>
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
   * Get user's notifications
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting user notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          notification_status: 'read',
          updated_at: new Date().toISOString()
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

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          notification_status: 'read',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('notification_status', 'sent');

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('notification_status', 'sent')
        .is('read_at', null);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(notification: Notification): Promise<boolean> {
    try {
      // Get user email from the notification data or user profile
      const userEmail = notification.data?.user_email;
      if (!userEmail) {
        console.error('No user email found for notification:', notification.id);
        return false;
      }

      // Generate email content based on notification type
      let emailData;
      if (notification.type === 'new_contract_match') {
        emailData = EmailService.generateContractMatchEmail(notification.data?.contract, userEmail);
      } else if (notification.type === 'deadline_reminder') {
        emailData = EmailService.generateDeadlineReminderEmail(
          notification.data?.contract, 
          userEmail, 
          notification.data?.days_remaining || 2
        );
      } else {
        // Generic notification email
        emailData = {
          to: userEmail,
          subject: notification.title,
          html: `<h1>${notification.title}</h1><p>${notification.message}</p>`,
          text: `${notification.title}\n\n${notification.message}`
        };
      }

      // Send the email
      const emailSent = await EmailService.sendEmail(emailData);
      
      if (emailSent) {
        // Mark notification as sent
        await this.markNotificationAsSent(notification.id);
        console.log('Email notification sent successfully:', notification.id);
        return true;
      } else {
        console.error('Failed to send email notification:', notification.id);
        return false;
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send in-app notification (real-time)
   */
  static async sendInAppNotification(notification: Notification): Promise<boolean> {
    try {
      // TODO: Implement real-time notification logic here
      // This could use WebSockets, Server-Sent Events, or Supabase Realtime
      console.log('Sending in-app notification:', notification);
      
      // For now, just mark as sent
      await this.markNotificationAsSent(notification.id);
      return true;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  /**
   * Mark notification as sent
   */
  private static async markNotificationAsSent(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          notification_status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as sent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as sent:', error);
      return false;
    }
  }
}
