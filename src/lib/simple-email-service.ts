import { Resend } from 'resend';

export class SimpleEmailService {
  private static resend = new Resend(process.env.RESEND_API_KEY);

  static async sendTestEmail(to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`📧 Sending test email to ${to}...`);
      
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'BidCloud <noreply@bidcloud.org>',
        to: [to],
        subject,
        html
      });

      if (error) throw error;

      console.log(`✅ Email sent successfully: ${data?.id}`);
      return {
        success: true,
        messageId: data?.id
      };

    } catch (error) {
      console.error(`❌ Email sending failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
