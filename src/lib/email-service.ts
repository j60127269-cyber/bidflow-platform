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
   * Generate daily digest email with multiple opportunities
   */
  static generateDailyDigestEmail(opportunities: any[], userEmail: string, totalMatches: number): EmailData {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const subject = `${opportunities.length} New Bid Opportunities for You Today!`;
    
    const opportunitiesHtml = opportunities.map((opp, index) => `
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0; color: #000000; font-size: 18px; line-height: 1.3;">
              ${opp.title}
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
              ${opp.matching_keywords ? `
                <span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  🔍 ${opp.matching_keywords}
                </span>
              ` : ''}
              ${opp.matching_location ? `
                <span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  📍 ${opp.matching_location}
                </span>
              ` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="color: #000000; font-size: 12px; margin-right: 5px;">Match:</span>
              <div style="display: flex; gap: 2px;">
                ${Array.from({length: 5}, (_, i) => `
                  <div style="width: 8px; height: 8px; background: ${i < (opp.match_score || 5) ? '#28a745' : '#e9ecef'}; border-radius: 1px;"></div>
                `).join('')}
              </div>
            </div>
            <div style="color: #007bff; font-size: 12px; font-weight: 600;">
              ${opp.days_remaining || 'N/A'} days left
            </div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e9ecef;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="display: flex; align-items: center; color: #000000; font-size: 14px;">
              <span style="margin-right: 5px;">📅</span>
              <span>Deadline: ${opp.submission_deadline ? new Date(opp.submission_deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Not specified'}</span>
            </div>
            <div style="display: flex; align-items: center; color: #000000; font-size: 14px;">
              <span style="margin-right: 5px;">🏢</span>
              <span>${opp.procuring_entity}</span>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${opp.id}" 
               style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600;">
              View Details
            </a>
            <button style="background: #f8f9fa; color: #000000; padding: 8px 16px; border: 1px solid #e9ecef; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              📋 Track
            </button>
          </div>
        </div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Just For You - BidFlow</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000000; margin: 0; font-size: 32px; font-weight: bold;">BidFlow</h1>
            <h2 style="color: #000000; margin: 20px 0 10px 0; font-size: 24px; font-weight: normal;">Just For You</h2>
            <p style="color: #666; margin: 0; font-size: 16px;">
              We've found more exceptional opportunities that match your interests. 
              You can review all recommendations in <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #007bff; text-decoration: none;">your account</a>.
            </p>
          </div>
          
          <!-- Opportunities Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            ${opportunities.map((opp, index) => `
              <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Contract Image Placeholder -->
                <div style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;">
                  📋 ${opp.category}
                </div>
                
                <!-- Contract Details -->
                <div style="padding: 20px;">
                  <div style="margin-bottom: 10px;">
                    <span style="color: #666; font-size: 14px;">${opp.procuring_entity}</span>
                  </div>
                  
                  <h3 style="margin: 0 0 10px 0; color: #000000; font-size: 18px; line-height: 1.3;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${opp.id}" style="color: #007bff; text-decoration: none;">
                      ${opp.title}
                    </a>
                  </h3>
                  
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="color: #000000; font-size: 20px; font-weight: bold;">UGX ${opp.estimated_value_min ? (opp.estimated_value_min / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                    ${opp.estimated_value_max ? `<span style="color: #666; margin-left: 5px;">- ${(opp.estimated_value_max / 1000000).toFixed(1)}M</span>` : ''}
                  </div>
                  
                  <div style="color: #666; font-size: 14px; margin-bottom: 15px;">
                    📅 Deadline: ${opp.submission_deadline ? new Date(opp.submission_deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Not specified'}
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center;">
                      <span style="color: #000000; font-size: 12px; margin-right: 5px;">Match:</span>
                      <div style="display: flex; gap: 2px;">
                        ${Array.from({length: 5}, (_, i) => `
                          <div style="width: 8px; height: 8px; background: ${i < (opp.match_score || 5) ? '#28a745' : '#e9ecef'}; border-radius: 1px;"></div>
                        `).join('')}
                      </div>
                    </div>
                    <div style="color: #007bff; font-size: 12px; font-weight: 600;">
                      ${opp.days_remaining || 'N/A'} days left
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
              EXPLORE MORE →
            </a>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              This personalized digest was sent because you have industry preferences set in your account.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications/settings" style="color: #007bff;">Manage your preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Daily Bid Opportunities - ${today}

Below are your top ${opportunities.length} out of ${totalMatches} matched bid opportunities for ${today}.

${opportunities.map((opp, index) => `
${index + 1}. ${opp.title}
   Agency: ${opp.procuring_entity}
   Deadline: ${opp.submission_deadline ? new Date(opp.submission_deadline).toLocaleDateString() : 'Not specified'}
   Match Score: ${opp.match_score || 5}/5
   Days Remaining: ${opp.days_remaining || 'N/A'}
   Keywords: ${opp.matching_keywords || 'N/A'}
   Location: ${opp.matching_location || 'N/A'}
   
   View Details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${opp.id}
`).join('\n')}

View All Opportunities: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Pro Tips:
- Review contract requirements carefully before bidding
- Set up deadline reminders for contracts you're interested in
- Use the favorites feature to track important opportunities
- Check back daily for new matches based on your preferences

This daily digest was sent because you have enabled daily opportunity notifications in your preferences.
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
