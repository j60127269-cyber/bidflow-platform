import { supabase } from './supabase';
import { BidTracking, Notification } from '@/types/database';

export class NotificationService {
  // Send email notification via API route
  static async sendEmailNotification(userId: string, subject: string, html: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, subject, html }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Email notification failed:', error);
        return false;
      }

      console.log(`Email notification sent to user ${userId}:`, { subject });
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Send WhatsApp notification via API route
  static async sendWhatsAppNotification(userId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp notification failed:', error);
        return false;
      }

      console.log(`WhatsApp notification sent to user ${userId}:`, message);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }
  }

  // Enhanced notification creation with email and WhatsApp
  static async createNotification(
    userId: string, 
    notification: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'success' | 'error';
    },
    sendEmail: boolean = false,
    sendWhatsApp: boolean = false
  ): Promise<Notification | null> {
    try {
      // Create notification in database
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      // Send email notification if requested
      if (sendEmail) {
        await this.sendEmailNotification(userId, notification.title, notification.message);
      }

      // Send WhatsApp notification if requested
      if (sendWhatsApp) {
        await this.sendWhatsAppNotification(userId, notification.message);
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

      for (const record of trackingRecords || []) {
        const deadline = new Date(record.contracts.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        // Check if deadline is tomorrow (1 day left)
        if (daysLeft === 1) {
          const timeRemaining = '1 day';
          const deadlineFormatted = deadline.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          // Send email notification with template
          if (record.email_alerts) {
            const emailHtml = `
              <h2>🚨 URGENT: Bid Deadline Tomorrow</h2>
              <p>Your bid for <strong>${record.contracts.title}</strong> with <strong>${record.contracts.client}</strong> is due tomorrow.</p>
              <p>Deadline: <strong>${deadlineFormatted}</strong></p>
              <p>Time remaining: <strong>${timeRemaining}</strong></p>
              <p>Please ensure your bid is submitted by this deadline.</p>
            `;
            await this.sendEmailNotification(
              record.user_id,
              '🚨 URGENT: Bid Deadline Tomorrow',
              emailHtml
            );
          }

          // Send WhatsApp notification with template
          if (record.sms_alerts) {
            const whatsappMessage = `
              URGENT: Bid Deadline Tomorrow for ${record.contracts.title} with ${record.contracts.client}
              Deadline: ${deadlineFormatted}
              Time remaining: ${timeRemaining}
              Please ensure your bid is submitted by this deadline.
            `;
            await this.sendWhatsAppNotification(record.user_id, whatsappMessage);
          }

          // Create in-app notification
          await this.createNotification(record.user_id, {
            title: 'Deadline Reminder',
            message: `Tomorrow is the deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'warning'
          });
        }
        
        // Check if deadline is in 3 days
        else if (daysLeft === 3) {
          const timeRemaining = '3 days';
          const deadlineFormatted = deadline.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          // Send email notification with template
          if (record.email_alerts) {
            const emailHtml = `
              <h2>⚠️ Bid Deadline Approaching</h2>
              <p>Your bid for <strong>${record.contracts.title}</strong> with <strong>${record.contracts.client}</strong> is approaching.</p>
              <p>Deadline: <strong>${deadlineFormatted}</strong></p>
              <p>Time remaining: <strong>${timeRemaining}</strong></p>
              <p>Please ensure your bid is submitted by this deadline.</p>
            `;
            await this.sendEmailNotification(
              record.user_id,
              '⚠️ Bid Deadline Approaching',
              emailHtml
            );
          }

          // Send WhatsApp notification with template
          if (record.sms_alerts) {
            const whatsappMessage = `
              Bid Deadline Approaching for ${record.contracts.title} with ${record.contracts.client}
              Deadline: ${deadlineFormatted}
              Time remaining: ${timeRemaining}
              Please ensure your bid is submitted by this deadline.
            `;
            await this.sendWhatsAppNotification(record.user_id, whatsappMessage);
          }

          // Create in-app notification
          await this.createNotification(record.user_id, {
            title: 'Deadline Approaching',
            message: `3 days until deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'info'
          });
        }

        // Check if deadline is in 7 days
        else if (daysLeft === 7) {
          const timeRemaining = '1 week';
          const deadlineFormatted = deadline.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          // Send email notification with template
          if (record.email_alerts) {
            const emailHtml = `
              <h2>📅 Bid Deadline Coming Up</h2>
              <p>Your bid for <strong>${record.contracts.title}</strong> with <strong>${record.contracts.client}</strong> is coming up.</p>
              <p>Deadline: <strong>${deadlineFormatted}</strong></p>
              <p>Time remaining: <strong>${timeRemaining}</strong></p>
              <p>Please ensure your bid is submitted by this deadline.</p>
            `;
            await this.sendEmailNotification(
              record.user_id,
              '📅 Bid Deadline Coming Up',
              emailHtml
            );
          }

          // Send WhatsApp notification with template
          if (record.sms_alerts) {
            const whatsappMessage = `
              Bid Deadline Coming Up for ${record.contracts.title} with ${record.contracts.client}
              Deadline: ${deadlineFormatted}
              Time remaining: ${timeRemaining}
              Please ensure your bid is submitted by this deadline.
            `;
            await this.sendWhatsAppNotification(record.user_id, whatsappMessage);
          }

          // Create in-app notification
          await this.createNotification(record.user_id, {
            title: 'Deadline Coming Up',
            message: `1 week until deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'info'
          });
        }
      }
    } catch (error) {
      console.error('Error in sendDeadlineReminders:', error);
    }
  }

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

      // Create initial notification with email/WhatsApp if enabled
      if (preferences.email_alerts) {
        // Get contract details for the email template
        const { data: contract } = await supabase
          .from('contracts')
          .select('title, client')
          .eq('id', contractId)
          .single();

        const emailHtml = `
          <h2>✅ Bid Tracking Started</h2>
          <p>You have started tracking the bid for <strong>${contract?.title || 'Contract'}</strong> with <strong>${contract?.client || 'Client'}</strong>.</p>
          <p>You will receive alerts for important dates and deadlines.</p>
        `;
        await this.sendEmailNotification(
          userId,
          '✅ Bid Tracking Started',
          emailHtml
        );
      }

      if (preferences.sms_alerts) {
        // Get contract details for the WhatsApp template
        const { data: contract } = await supabase
          .from('contracts')
          .select('title, client')
          .eq('id', contractId)
          .single();

        const whatsappMessage = `
          Bid Tracking Started for ${contract?.title || 'Contract'} with ${contract?.client || 'Client'}
          You have started tracking this bid. You will receive alerts for important dates and deadlines.
        `;
        await this.sendWhatsAppNotification(userId, whatsappMessage);
      }

      // Create in-app notification
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
}
