import { createClient } from '@supabase/supabase-js';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static readonly MAX_RETRIES = 1;
  private static readonly RETRY_DELAY = 10000; // 10 seconds
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Send email with retry logic
   */
  static async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string; retryCount?: number; deliveryTime?: number }> {
    const startTime = Date.now();
    let lastError: string = '';

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[EMAIL] Sending email to ${to} (attempt ${attempt + 1}/${this.MAX_RETRIES})`);

        const emailData = {
          to,
          subject,
          html,
          text
        };

        const { data, error } = await this.supabase.functions.invoke('send-email', {
          body: emailData
        });

        if (error) throw error;

        const success = data?.success || false;
        
        if (success) {
          const deliveryTime = Date.now() - startTime;
          console.log(`✅ Email delivered to ${to} in ${deliveryTime}ms (attempt ${attempt + 1})`);
          
          return {
            success: true,
            messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            retryCount: attempt,
            deliveryTime
          };
        } else {
          throw new Error(data?.error || 'Email sending failed');
        }

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Email attempt ${attempt + 1} failed:`, lastError);
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.MAX_RETRIES - 1) {
        console.log(`⏳ Waiting ${this.RETRY_DELAY}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      }
    }

    const deliveryTime = Date.now() - startTime;
    console.error(`❌ Failed to deliver email to ${to} after ${this.MAX_RETRIES} attempts`);

    return {
      success: false,
      error: lastError,
      retryCount: this.MAX_RETRIES - 1,
      deliveryTime
    };
  }

  /**
   * Generate new contract notification template
   */
  private static generateNewContractTemplate(contract: any): EmailTemplate {
    const subject = `New Contract: ${contract.title || 'Contract Opportunity'}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            line-height: 1.6;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
          }
          .header { 
            background-color: #1e40af; 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
          }
          .content { 
            padding: 32px 24px; 
          }
          .contract-title { 
            font-size: 20px; 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 24px; 
            line-height: 1.4; 
          }
          .contract-details { 
            background-color: #f9fafb; 
            border-radius: 6px; 
            padding: 24px; 
            margin: 24px 0; 
            border-left: 4px solid #1e40af;
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          .detail-row:last-child { 
            border-bottom: none; 
            margin-bottom: 0; 
          }
          .detail-label { 
            font-weight: 600; 
            color: #374151; 
          }
          .detail-value { 
            color: #6b7280; 
            text-align: right; 
          }
          .cta-button { 
            display: inline-block; 
            background-color: #1e40af; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600; 
            margin: 24px 0; 
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #1d4ed8;
          }
          .footer { 
            background-color: #f9fafb; 
            padding: 24px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
          }
          .footer a { 
            color: #1e40af; 
            text-decoration: none; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contract Available</h1>
          </div>
          
          <div class="content">
            <div class="contract-title">${contract.title || 'Contract Opportunity'}</div>
            
            <div class="contract-details">
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${contract.category || 'Not specified'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submission Deadline:</span>
                <span class="detail-value">${this.formatDate(contract.submission_deadline)}</span>
              </div>
              ${contract.estimated_value_min ? `
                <div class="detail-row">
                  <span class="detail-label">Estimated Value:</span>
                  <span class="detail-value">${this.formatCurrency(contract.estimated_value_min)}${contract.estimated_value_max ? ` - ${this.formatCurrency(contract.estimated_value_max)}` : ''}</span>
                </div>
                ` : ''}
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}" class="cta-button">
              View Contract Details
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              This notification was sent because this contract matches your preferred categories.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2025 BidCloud. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Manage Notifications</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
NEW CONTRACT: ${contract.title || 'Contract Opportunity'}

Category: ${contract.category || 'Not specified'}
Submission Deadline: ${this.formatDate(contract.submission_deadline)}
${contract.estimated_value_min ? `Estimated Value: ${this.formatCurrency(contract.estimated_value_min)}${contract.estimated_value_max ? ` - ${this.formatCurrency(contract.estimated_value_max)}` : ''}

View Contract Details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}

This notification was sent because this contract matches your preferred categories.

© 2025 BidCloud. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Format currency
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date
   */
  private static formatDate(dateString: string): string {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Send new contract notification
   */
  static async sendNewContractNotification(contract: any, userEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = this.generateNewContractTemplate(contract);
    return await this.sendEmail(userEmail, template.subject, template.html, template.text);
  }
}
