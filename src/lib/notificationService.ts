import { supabase } from './supabase';
import { Database } from '@/types/database';

type BidTracking = Database['public']['Tables']['bid_tracking']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export class NotificationService {
  // Start tracking a bid
  static async startTracking(
    userId: string,
    contractId: string,
    preferences: {
      email_alerts: boolean;
      sms_alerts: boolean;
      push_alerts: boolean;
    }
  ): Promise<BidTracking | null> {
    try {
      // First, check if contract exists, if not create a mock one
      const { data: contractExists, error: contractError } = await supabase
        .from('contracts')
        .select('id')
        .eq('id', contractId)
        .single();

      if (contractError && contractError.code === 'PGRST116') {
        // Contract doesn't exist, create a mock one
        const { error: insertError } = await supabase
          .from('contracts')
          .insert({
            id: contractId,
            title: 'Sample Contract',
            client: 'Sample Client',
            location: 'Sample Location',
            value: 1000000,
            deadline: '2024-12-31',
            category: 'Sample Category',
            description: 'Sample contract for testing',
            status: 'open'
          });

        if (insertError) {
          console.error('Error creating mock contract:', insertError);
          return null;
        }
      }

      const { data, error } = await supabase
        .from('bid_tracking')
        .insert({
          user_id: userId,
          contract_id: contractId,
          email_alerts: preferences.email_alerts,
          sms_alerts: preferences.sms_alerts,
          push_alerts: preferences.push_alerts,
          tracking_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting bid tracking:', error);
        return null;
      }

      // Create initial notification
      await this.createNotification(userId, {
        title: 'Bid Tracking Started',
        message: 'You are now tracking this bid. You will receive alerts for important dates and deadlines.',
        type: 'success'
      });

      return data;
    } catch (error) {
      console.error('Error in startTracking:', error);
      return null;
    }
  }

  // Stop tracking a bid
  static async stopTracking(userId: string, contractId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bid_tracking')
        .update({ tracking_active: false })
        .eq('user_id', userId)
        .eq('contract_id', contractId);

      if (error) {
        console.error('Error stopping bid tracking:', error);
        return false;
      }

      // Create notification
      await this.createNotification(userId, {
        title: 'Bid Tracking Stopped',
        message: 'You are no longer tracking this bid. You will not receive further alerts.',
        type: 'info'
      });

      return true;
    } catch (error) {
      console.error('Error in stopTracking:', error);
      return false;
    }
  }

  // Update tracking preferences
  static async updateTrackingPreferences(
    userId: string,
    contractId: string,
    preferences: {
      email_alerts: boolean;
      sms_alerts: boolean;
      push_alerts: boolean;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bid_tracking')
        .update({
          email_alerts: preferences.email_alerts,
          sms_alerts: preferences.sms_alerts,
          push_alerts: preferences.push_alerts,
        })
        .eq('user_id', userId)
        .eq('contract_id', contractId);

      if (error) {
        console.error('Error updating tracking preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTrackingPreferences:', error);
      return false;
    }
  }

  // Get tracking status for a bid
  static async getTrackingStatus(userId: string, contractId: string): Promise<BidTracking | null> {
    try {
      const { data, error } = await supabase
        .from('bid_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('contract_id', contractId)
        .single();

      if (error) {
        // If no record found, that's normal - user hasn't started tracking yet
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error getting tracking status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTrackingStatus:', error);
      return null;
    }
  }

  // Create a notification
  static async createNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'success' | 'error';
    }
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting user notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  // Send deadline reminder (to be called by a cron job or scheduled task)
  static async sendDeadlineReminders(): Promise<void> {
    try {
      // Get all active bid tracking records
      const { data: trackingRecords, error } = await supabase
        .from('bid_tracking')
        .select(`
          *,
          contracts (
            title,
            deadline,
            client
          )
        `)
        .eq('tracking_active', true);

      if (error) {
        console.error('Error getting tracking records:', error);
        return;
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      for (const record of trackingRecords || []) {
        const deadline = new Date(record.contracts.deadline);
        
        // Check if deadline is tomorrow
        if (deadline.toDateString() === tomorrow.toDateString()) {
          await this.createNotification(record.user_id, {
            title: 'Deadline Reminder',
            message: `Tomorrow is the deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'warning'
          });
        }
        
        // Check if deadline is in 3 days
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        if (deadline.toDateString() === threeDaysFromNow.toDateString()) {
          await this.createNotification(record.user_id, {
            title: 'Deadline Approaching',
            message: `3 days until deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'info'
          });
        }
      }
    } catch (error) {
      console.error('Error in sendDeadlineReminders:', error);
    }
  }
}
