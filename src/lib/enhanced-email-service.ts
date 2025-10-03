import { Resend } from 'resend';

export class EmailService {
  private static resend = new Resend(process.env.RESEND_API_KEY);

  static async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'BidCloud <noreply@bidcloud.org>',
        to: [to],
        subject,
        html
      });

      if (error) throw error;

      return {
        success: true,
        messageId: data?.id
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async sendNewContractNotification(contract: any, userEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `New Contract: ${contract.title || 'Contract Opportunity'}`;
    
    const html = this.generateHtmlTemplate(contract);
    const text = this.generateTextTemplate(contract);
    
    return await this.sendEmail(userEmail, subject, html, text);
  }

  private static generateHtmlTemplate(contract: any): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contract Available</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f8fafc; 
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); 
    }
    .header { 
      background: linear-gradient(135deg, #2b8eeb 0%, #1e6bb8 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      font-size: 28px; 
      font-weight: 700; 
      margin-bottom: 8px; 
    }
    .header p { 
      font-size: 16px; 
      opacity: 0.9; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .contract-title { 
      font-size: 22px; 
      font-weight: 600; 
      color: #1a202c; 
      margin-bottom: 30px; 
      line-height: 1.4; 
    }
    .details-card { 
      background: #f7fafc; 
      border-radius: 8px; 
      padding: 24px; 
      margin: 24px 0; 
      border-left: 4px solid #2b8eeb; 
    }
    .detail-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 12px 0; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .detail-item:last-child { 
      border-bottom: none; 
    }
    .detail-label { 
      font-weight: 600; 
      color: #4a5568; 
      font-size: 14px; 
    }
    .detail-value { 
      color: #2d3748; 
      font-weight: 500; 
      text-align: right; 
    }
    .cta-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #2b8eeb 0%, #1e6bb8 100%); 
      color: white !important; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 16px; 
      margin: 24px 0; 
      transition: all 0.3s ease; 
    }
    .cta-button:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 25px rgba(43, 142, 235, 0.3); 
    }
    .footer { 
      background: #f7fafc; 
      padding: 30px; 
      text-align: center; 
      color: #718096; 
      font-size: 14px; 
      border-top: 1px solid #e2e8f0; 
    }
    .footer a { 
      color: #2b8eeb; 
      text-decoration: none; 
      margin: 0 8px; 
    }
    .badge { 
      display: inline-block; 
      background: #2b8eeb; 
      color: white; 
      padding: 4px 12px; 
      border-radius: 20px; 
      font-size: 12px; 
      font-weight: 600; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
    }
    @media (max-width: 600px) {
      .email-container { margin: 0; border-radius: 0; }
      .content, .header { padding: 20px; }
      .contract-title { font-size: 20px; }
      .detail-item { flex-direction: column; align-items: flex-start; }
      .detail-value { text-align: left; margin-top: 4px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎯 New Contract Available</h1>
      <p>Don't miss this opportunity</p>
    </div>
    
    <div class="content">
      <div class="contract-title">${contract.title || 'Contract Opportunity'}</div>
      
      <div class="details-card">
        <div class="detail-item">
          <span class="detail-label">Category</span>
          <span class="detail-value">
            <span class="badge">${contract.category || 'Not specified'}</span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Submission Deadline</span>
          <span class="detail-value">${this.formatDate(contract.submission_deadline)}</span>
        </div>
        ${contract.estimated_value_min ? `
        <div class="detail-item">
          <span class="detail-label">Estimated Value</span>
          <span class="detail-value">${this.formatCurrency(contract.estimated_value_min)}${contract.estimated_value_max ? ' - ' + this.formatCurrency(contract.estimated_value_max) : ''}</span>
        </div>
        ` : ''}
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts/${contract.id}" class="cta-button" style="color: white !important; text-decoration: none;">
        View Full Details →
      </a>

      <p style="color: #718096; font-size: 14px; margin-top: 24px; padding: 16px; background: #f7fafc; border-radius: 6px;">
        💡 This notification was sent because this contract matches your preferred categories.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 BidCloud. All rights reserved.</p>
      <p style="margin-top: 12px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Manage Notifications</a> • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  private static generateTextTemplate(contract: any): string {
    return 'NEW CONTRACT: ' + (contract.title || 'Contract Opportunity') + '\n\n' +
           'Category: ' + (contract.category || 'Not specified') + '\n' +
           'Submission Deadline: ' + this.formatDate(contract.submission_deadline) + '\n' +
           (contract.estimated_value_min ? 'Estimated Value: ' + this.formatCurrency(contract.estimated_value_min) + 
           (contract.estimated_value_max ? ' - ' + this.formatCurrency(contract.estimated_value_max) : '') + '\n' : '') +
           '\nView Contract Details: ' + process.env.NEXT_PUBLIC_APP_URL + '/dashboard/contracts/' + contract.id + '\n\n' +
           'This notification was sent because this contract matches your preferred categories.\n\n' +
           '© 2025 BidCloud. All rights reserved.';
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
