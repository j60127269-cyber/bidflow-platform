// Email Service Configuration
// This file contains configuration for different email services

export interface EmailServiceConfig {
  provider: 'resend' | 'sendgrid' | 'aws-ses' | 'nodemailer' | 'supabase';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

// Default configuration - using Resend for email sending
export const emailConfig: EmailServiceConfig = {
  provider: 'resend', // Using Resend for email sending
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'notifications@bidcloud.org', // Use your verified domain
  fromName: process.env.FROM_NAME || 'BidCloud Notifications'
};

// Email service implementations
export class EmailServiceProvider {
  static async sendEmail(config: EmailServiceConfig, emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<boolean> {
    try {
      switch (config.provider) {
        case 'resend':
          return await this.sendWithResend(config, emailData);
        case 'sendgrid':
          return await this.sendWithSendGrid(config, emailData);
        case 'aws-ses':
          return await this.sendWithAWSSES(config, emailData);
        case 'nodemailer':
          return await this.sendWithNodemailer(config, emailData);
        case 'supabase':
          return await this.sendWithSupabase(config, emailData);
        default:
          console.error('Unknown email provider:', config.provider);
          return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private static async sendWithResend(config: EmailServiceConfig, emailData: any): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully via Resend:', result.id);
      return true;
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return false;
    }
  }

  private static async sendWithSendGrid(config: EmailServiceConfig, emailData: any): Promise<boolean> {
    // TODO: Implement SendGrid integration
    console.log('SendGrid email service not implemented yet');
    return false;
  }

  private static async sendWithAWSSES(config: EmailServiceConfig, emailData: any): Promise<boolean> {
    // TODO: Implement AWS SES integration
    console.log('AWS SES email service not implemented yet');
    return false;
  }

  private static async sendWithNodemailer(config: EmailServiceConfig, emailData: any): Promise<boolean> {
    // TODO: Implement Nodemailer integration
    console.log('Nodemailer email service not implemented yet');
    return false;
  }

  private static async sendWithSupabase(config: EmailServiceConfig, emailData: any): Promise<boolean> {
    // Use Supabase Edge Functions for email sending
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      console.error('Supabase email error:', error);
      return false;
    }

    return true;
  }
}
