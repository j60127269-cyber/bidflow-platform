import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

          // Simulate email sending (for now)
          const emailSuccess = Math.random() > 0.2; // 80% success rate

          if (emailSuccess) {
            // Mark as sent
            await supabase
              .from('notification_queue')
              .update({
                status: 'sent',
                email_sent: true,
                email_sent_at: new Date().toISOString(),
                email_message_id: `msg_${Date.now()}`
              })
              .eq('id', notification.id);

            success++;
          } else {
            // Handle retry logic
            await this.handleRetry(notification, 'Simulated email failure');
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
   * Handle retry logic for failed notifications
   */
  private static async handleRetry(notification: any, error: string): Promise<void> {
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
  ): Promise<any[]> {
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
   * Bulk cancel pending notifications
   */
  static async bulkCancelPending(): Promise<{ success: boolean; cancelledCount?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .update({ status: 'cancelled' })
        .eq('status', 'pending')
        .select('id');

      if (error) {
        console.error('Error bulk cancelling notifications:', error);
        return { success: false, error: error.message };
      }

      return { success: true, cancelledCount: data?.length || 0 };
    } catch (error) {
      console.error('Exception bulk cancelling notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
