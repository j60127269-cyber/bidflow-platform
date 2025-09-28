import { supabase } from './supabase';
import { emailConfig, EmailServiceProvider } from './email-config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Email Service for sending notifications
 * This service handles email notifications for the notification system
 */
export class EmailService {
  /**
   * Send email notification
   */
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Use the configured email service provider
      const success = await EmailServiceProvider.sendEmail(emailConfig, emailData);
      
      if (success) {
        console.log('Email sent successfully to:', emailData.to);
        return true;
      } else {
        console.error('Failed to send email to:', emailData.to);
        return false;
      }
    } catch (error) {
      console.error('Error in sendEmail:', error);
      return false;
    }
  }

  /**
   * Generate email template for new contract match
   */
  static generateContractMatchEmail(contract: any, userEmail: string): EmailData {
    const subject = `New Contract Match: ${contract.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contract Match</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Contract Match!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">A contract matching your preferences has been published</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #000000; margin-top: 0;">${contract.title}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="color: #000000; margin-top: 0;">📋 Contract Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Agency:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.procuring_entity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Category:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Deadline:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.submission_deadline ? new Date(contract.submission_deadline).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Full Contract Details
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="color: #007bff; margin-top: 0;">💡 Next Steps</h3>
              <ul style="color: #000000; margin: 0; padding-left: 20px;">
                <li>Review the full contract requirements</li>
                <li>Prepare your bid documents</li>
                <li>Submit your proposal before the deadline</li>
                <li>Track the contract for updates</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #000000; margin: 0; font-size: 14px;">
              This notification was sent because you have enabled new contract notifications in your preferences.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings" style="color: #007bff;">Manage your notification preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
New Contract Match: ${contract.title}

A new contract matching your preferences has been published:

Contract Details:
- Title: ${contract.title}
- Agency: ${contract.procuring_entity}
- Category: ${contract.category}
- Deadline: ${contract.submission_deadline ? new Date(contract.submission_deadline).toLocaleDateString() : 'Not specified'}

View the full contract details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}

Next Steps:
- Review the full contract requirements
- Prepare your bid documents
- Submit your proposal before the deadline
- Track the contract for updates

This notification was sent because you have enabled new contract notifications in your preferences.
Manage your notification preferences: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings
    `;

    return {
      to: userEmail,
      subject,
      html,
      text
    };
  }

  /**
   * Generate email template for deadline reminder
   */
  static generateDeadlineReminderEmail(contract: any, userEmail: string, daysRemaining: number): EmailData {
    const subject = `Deadline Reminder: ${contract.title} - ${daysRemaining} Days Left`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Deadline Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #000000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Deadline Reminder</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">The contract you're tracking is due soon</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #000000; margin-top: 0;">${contract.title}</h2>
            
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #000000;">
              <h3 style="color: #000000; margin-top: 0;">⚠️ Urgent: ${daysRemaining} Days Remaining</h3>
              <p style="color: #000000; margin: 0;">Don't miss this opportunity! The submission deadline is approaching.</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="color: #000000; margin-top: 0;">📋 Contract Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Agency:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.procuring_entity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Category:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Deadline:</td>
                  <td style="padding: 8px 0; color: #000000; font-weight: bold;">${new Date(contract.submission_deadline).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}" 
                 style="background: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Contract Details
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="color: #007bff; margin-top: 0;">🚀 Final Checklist</h3>
              <ul style="color: #000000; margin: 0; padding-left: 20px;">
                <li>Review all contract requirements</li>
                <li>Prepare and organize bid documents</li>
                <li>Double-check submission format and location</li>
                <li>Submit your proposal before the deadline</li>
                <li>Keep a copy of your submission</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #000000; margin: 0; font-size: 14px;">
              This reminder was sent because you're tracking this contract and have enabled deadline reminders.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings" style="color: #007bff;">Manage your notification preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Deadline Reminder: ${contract.title} - ${daysRemaining} Days Left

The contract you're tracking is due soon:

Contract Details:
- Title: ${contract.title}
- Agency: ${contract.procuring_entity}
- Category: ${contract.category}
- Deadline: ${new Date(contract.submission_deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

View the contract and submit your bid: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}

Final Checklist:
- Review all contract requirements
- Prepare and organize bid documents
- Double-check submission format and location
- Submit your proposal before the deadline
- Keep a copy of your submission

This reminder was sent because you're tracking this contract and have enabled deadline reminders.
Manage your notification preferences: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings
    `;

    return {
      to: userEmail,
      subject,
      html,
      text
    };
  }

  /**
   * Format currency for display
   */
  private static formatCurrency(minValue?: number, maxValue?: number): string {
    if (minValue && maxValue) {
      return `UGX ${this.formatAmount(minValue)} - ${this.formatAmount(maxValue)}`;
    } else if (minValue) {
      return `From UGX ${this.formatAmount(minValue)}`;
    } else if (maxValue) {
      return `Up to UGX ${this.formatAmount(maxValue)}`;
    }
    return 'Not specified';
  }


  /**
   * Generate immediate notification email for new contract matches
   */
  static generateImmediateNotificationEmail(contract: any, userEmail: string): EmailData {
    const subject = `New Contract Match: ${contract.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contract Match</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Contract Match!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">A contract matching your preferences has been published</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #000000; margin-top: 0;">${contract.title}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="color: #000000; margin-top: 0;">📋 Contract Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Agency:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.procuring_entity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Category:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #000000;">Deadline:</td>
                  <td style="padding: 8px 0; color: #000000;">${contract.submission_deadline ? new Date(contract.submission_deadline).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Full Contract Details
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="color: #007bff; margin-top: 0;">💡 Next Steps</h3>
              <ul style="color: #000000; margin: 0; padding-left: 20px;">
                <li>Review the full contract requirements</li>
                <li>Prepare your bid documents</li>
                <li>Submit your proposal before the deadline</li>
                <li>Track the contract for updates</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #000000; margin: 0; font-size: 14px;">
              This notification was sent because this contract matches your industry preferences.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings" style="color: #007bff;">Manage your notification preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
New Contract Match: ${contract.title}

A new contract matching your preferences has been published:

Contract Details:
- Title: ${contract.title}
- Agency: ${contract.procuring_entity}
- Category: ${contract.category}
- Deadline: ${contract.submission_deadline ? new Date(contract.submission_deadline).toLocaleDateString() : 'Not specified'}

View the full contract details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}

Next Steps:
- Review the full contract requirements
- Prepare your bid documents
- Submit your proposal before the deadline
- Track the contract for updates

This notification was sent because this contract matches your industry preferences.
Manage your notification preferences: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings
    `;

    return {
      to: userEmail,
      subject,
      html,
      text
    };
  }

  /**
   * Format amount with K, M, B suffixes
   */
  private static formatAmount(amount: number): string {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  }
}
