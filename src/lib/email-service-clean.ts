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
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Contract</title></head><body><h1>New Contract Available</h1><h2>' + 
           (contract.title || 'Contract Opportunity') + '</h2><p><strong>Category:</strong> ' + (contract.category || 'Not specified') + '</p>' +
           '<p><strong>Submission Deadline:</strong> ' + this.formatDate(contract.submission_deadline) + '</p>' +
           (contract.estimated_value_min ? '<p><strong>Estimated Value:</strong> ' + this.formatCurrency(contract.estimated_value_min) + 
           (contract.estimated_value_max ? ' - ' + this.formatCurrency(contract.estimated_value_max) : '') + '</p>' : '') +
           '<p><a href="' + process.env.NEXT_PUBLIC_APP_URL + '/dashboard/contracts/' + contract.id + '">View Contract Details</a></p>' +
           '<p>This notification was sent because this contract matches your preferred categories.</p>' +
           '<p>© 2025 BidCloud. All rights reserved.</p></body></html>';
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
