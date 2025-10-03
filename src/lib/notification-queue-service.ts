import { createClient } from '@supabase/supabase-js';
import { EmailService } from './enhanced-email-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface NotificationQueueItem {
  id: string;
  user_id: string;
  contract_id: string;
  contract_version: number;
  type: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  priority: number;
  created_at: string;
  scheduled_at: string;
  processed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  email_sent: boolean;
  email_sent_at?: string;
  email_message_id?: string;
  metadata: any;
}

export interface QueueStats {
  total_notifications: number;
  pending_count: number;
  processing_count: number;
  sent_count: number;
  failed_count: number;
  cancelled_count: number;
  success_rate: number;
  avg_processing_time: string;
}

export class NotificationQueueService {
  /**
   * Add notification to queue
   */
  static async addToQueue(
    userId: string,
    contractId: string,
    contractVersion: number,
    type: string = 'contract_match',
    priority: number = 1,
    metadata: any = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .insert({
          user_id: userId,
          contract_id: contractId,
          contract_version: contractVersion,
          type,
          priority,
          metadata,
          scheduled_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error adding to queue:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Exception adding to queue:', error);
      return { success: false, error: 'Failed to add notification to queue' };
    }
  }

  /**
   * Process notification queue with retry logic
   */
  static async processQueue(batchSize: number = 10): Promise<{
    processed: number;
    success: number;
    failed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    let success = 0;
    let failed = 0;

    try {
      // Get pending notifications
      const { data: pendingNotifications, error: fetchError } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(batchSize);

      if (fetchError) {
        errors.push(`Failed to fetch pending notifications: ${fetchError.message}`);
        return { processed, success, failed, errors };
      }

      if (!pendingNotifications || pendingNotifications.length === 0) {
        return { processed, success, failed, errors };
      }

      // Process each notification
      for (const notification of pendingNotifications) {
        try {
          // Mark as processing
          await supabase
            .from('notification_queue')
            .update({ 
              status: 'processing',
              processed_at: new Date().toISOString()
            })
            .eq('id', notification.id);

          // Send the actual notification
          const result = await this.sendNotification(notification);

          if (result.success) {
            // Mark as sent
            await supabase
              .from('notification_queue')
              .update({
                status: 'sent',
                email_sent: true,
                email_sent_at: new Date().toISOString(),
                email_message_id: result.messageId
              })
              .eq('id', notification.id);

            success++;
          } else {
            // Handle retry logic
            await this.handleRetry(notification, result.error || 'Unknown error');
            failed++;
          }

          processed++;
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error);
          await this.handleRetry(notification, error instanceof Error ? error.message : 'Unknown error');
          errors.push(`Notification ${notification.id}: ${error}`);
          failed++;
          processed++;
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      errors.push(`Queue processing error: ${error}`);
    }

    return { processed, success, failed, errors };
  }

  /**
   * Send individual notification
   */
  private static async sendNotification(notification: NotificationQueueItem): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, preferred_categories, industry_preferences')
        .eq('id', notification.user_id)
        .single();

      if (userError || !user) {
        return { success: false, error: 'User not found' };
      }

      // Get contract details
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', notification.contract_id)
        .single();

      if (contractError || !contract) {
        return { success: false, error: 'Contract not found' };
      }

      // Send email based on notification type
      let emailResult;
      if (notification.type === 'contract_match') {
        emailResult = await EnhancedEmailService.sendContractMatchNotification(
          user.email,
          contract,
          {
            preferred_categories: user.preferred_categories,
            industry_preferences: user.industry_preferences
          }
        );
      } else if (notification.type === 'deadline_reminder') {
        const daysRemaining = this.calculateDaysRemaining(contract.submission_deadline);
        emailResult = await EnhancedEmailService.sendDeadlineReminder(
          user.email,
          contract,
          daysRemaining
        );
      } else {
        return { success: false, error: 'Unknown notification type' };
      }

      if (emailResult.success) {
        return { success: true, messageId: emailResult.messageId };
      } else {
        return { success: false, error: emailResult.error };
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Handle retry logic for failed notifications
   */
  private static async handleRetry(notification: NotificationQueueItem, error: string): Promise<void> {
    const retryCount = notification.retry_count + 1;

    if (retryCount >= notification.max_retries) {
      // Mark as failed after max retries
      await supabase
        .from('notification_queue')
        .update({
          status: 'failed',
          error_message: error,
          processed_at: new Date().toISOString()
        })
        .eq('id', notification.id);
    } else {
      // Schedule retry with exponential backoff
      const retryDelay = Math.pow(2, retryCount) * 60000; // 1min, 2min, 4min, etc.
      const scheduledAt = new Date(Date.now() + retryDelay);

      await supabase
        .from('notification_queue')
        .update({
          status: 'pending',
          retry_count: retryCount,
          scheduled_at: scheduledAt.toISOString(),
          error_message: error
        })
        .eq('id', notification.id);
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(): Promise<QueueStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_notification_queue_stats');

      if (error) {
        console.error('Error getting queue stats:', error);
        return null;
      }

      return data[0] || null;
    } catch (error) {
      console.error('Exception getting queue stats:', error);
      return null;
    }
  }

  /**
   * Get queue items with filters
   */
  static async getQueueItems(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationQueueItem[]> {
    try {
      let query = supabase
        .from('notification_queue_dashboard')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting queue items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception getting queue items:', error);
      return [];
    }
  }

  /**
   * Retry failed notification
   */
  static async retryNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notification_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          scheduled_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', notificationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Cancel pending notification
   */
  static async cancelNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notification_queue')
        .update({ status: 'cancelled' })
        .eq('id', notificationId)
        .in('status', ['pending', 'processing']);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_notifications');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, deletedCount: data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Calculate days remaining until deadline
   */
  private static calculateDaysRemaining(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Bulk retry failed notifications
   */
  static async bulkRetryFailed(): Promise<{ success: boolean; retriedCount?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          scheduled_at: new Date().toISOString(),
          error_message: null
        })
        .eq('status', 'failed')
        .select('id');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, retriedCount: data?.length || 0 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Bulk cancel pending notifications
   */
  static async bulkCancelPending(): Promise<{ success: boolean; cancelledCount?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .update({ status: 'cancelled' })
        .in('status', ['pending', 'processing'])
        .select('id');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, cancelledCount: data?.length || 0 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
