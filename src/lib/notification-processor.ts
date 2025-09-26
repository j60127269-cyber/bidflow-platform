import { supabase } from './supabase';
import { NotificationService } from './notifications';

/**
 * Notification Processor
 * Handles processing and sending of pending notifications
 */
export class NotificationProcessor {
  /**
   * Process all pending notifications
   */
  static async processPendingNotifications(): Promise<void> {
    try {
      console.log('🔄 Processing pending notifications...');
      
      // Get all pending notifications
      const { data: pendingNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('notification_status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('created_at', { ascending: true })
        .limit(50); // Process in batches

      if (error) {
        console.error('Error fetching pending notifications:', error);
        return;
      }

      if (!pendingNotifications || pendingNotifications.length === 0) {
        console.log('No pending notifications found');
        return;
      }

      console.log(`Found ${pendingNotifications.length} pending notifications`);

      // Process each notification
      for (const notification of pendingNotifications) {
        await this.processNotification(notification);
      }

      console.log('✅ Finished processing pending notifications');
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Process a single notification
   */
  private static async processNotification(notification: any): Promise<void> {
    try {
      console.log(`Processing notification ${notification.id} (${notification.type})`);

      let success = false;

      // Send notification based on channel
      switch (notification.channel) {
        case 'email':
          success = await NotificationService.sendEmailNotification(notification);
          break;
        case 'in_app':
          success = await NotificationService.sendInAppNotification(notification);
          break;
        case 'whatsapp':
          // TODO: Implement WhatsApp notifications
          console.log('WhatsApp notifications not yet implemented');
          success = true; // Mark as sent for now
          break;
        default:
          console.error(`Unknown notification channel: ${notification.channel}`);
          success = false;
      }

      if (success) {
        console.log(`✅ Successfully processed notification ${notification.id}`);
      } else {
        console.error(`❌ Failed to process notification ${notification.id}`);
        
        // Mark as failed after multiple attempts
        await this.markNotificationAsFailed(notification.id);
      }
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
      await this.markNotificationAsFailed(notification.id);
    }
  }

  /**
   * Mark notification as failed
   */
  private static async markNotificationAsFailed(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          notification_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as failed:', error);
      }
    } catch (error) {
      console.error('Error in markNotificationAsFailed:', error);
    }
  }

  /**
   * Process notifications for a specific user
   */
  static async processUserNotifications(userId: string): Promise<void> {
    try {
      console.log(`🔄 Processing notifications for user ${userId}...`);
      
      // Get pending notifications for this user
      const { data: userNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('notification_status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user notifications:', error);
        return;
      }

      if (!userNotifications || userNotifications.length === 0) {
        console.log(`No pending notifications for user ${userId}`);
        return;
      }

      console.log(`Found ${userNotifications.length} pending notifications for user ${userId}`);

      // Process each notification
      for (const notification of userNotifications) {
        await this.processNotification(notification);
      }

      console.log(`✅ Finished processing notifications for user ${userId}`);
    } catch (error) {
      console.error(`Error processing notifications for user ${userId}:`, error);
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
    read: number;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('notifications')
        .select('notification_status')
        .then(result => {
          if (result.error) throw result.error;
          
          const stats = {
            total: result.data.length,
            pending: 0,
            sent: 0,
            failed: 0,
            read: 0
          };

          result.data.forEach(notification => {
            switch (notification.notification_status) {
              case 'pending':
                stats.pending++;
                break;
              case 'sent':
                stats.sent++;
                break;
              case 'failed':
                stats.failed++;
                break;
              case 'read':
                stats.read++;
                break;
            }
          });

          return stats;
        });

      if (error) {
        console.error('Error fetching notification stats:', error);
        return { total: 0, pending: 0, sent: 0, failed: 0, read: 0 };
      }

      return stats;
    } catch (error) {
      console.error('Error in getNotificationStats:', error);
      return { total: 0, pending: 0, sent: 0, failed: 0, read: 0 };
    }
  }
}
