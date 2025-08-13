import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async send(to: string, subject: string, html: string) {
    try {
      return await resend.emails.send({
        from: 'BidFlow <onboarding@resend.dev>', // Free verified domain
        to: [to],
        subject,
        html,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  },

  // Create HTML email template for bid deadline reminders
  createDeadlineReminderEmail(contractTitle: string, client: string, deadline: string, timeRemaining: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            font-family: Arial, sans-serif; 
            background-color: #f8fafc;
          }
          .header { 
            background: #3B82F6; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 30px 20px; 
            background: white;
            border-radius: 0 0 8px 8px;
          }
          .button { 
            background: #3B82F6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            margin-top: 20px;
          }
          .alert {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .info {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            color: #1e40af;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 BidFlow Deadline Reminder</h1>
          </div>
          <div class="content">
            <h2>Deadline Approaching</h2>
            <div class="alert">
              <strong>Time Remaining:</strong> ${timeRemaining}
            </div>
            
            <h3>Contract Details:</h3>
            <p><strong>Title:</strong> ${contractTitle}</p>
            <p><strong>Client:</strong> ${client}</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
            
            <div class="info">
              <strong>Don't miss this opportunity!</strong><br>
              Make sure to submit your bid before the deadline.
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bidflow.ug'}/dashboard" class="button">
              View Contract Details
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This is an automated reminder from BidFlow. 
              You can manage your notification preferences in your profile settings.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Create HTML email template for bid tracking confirmation
  createTrackingConfirmationEmail(contractTitle: string, client: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            font-family: Arial, sans-serif; 
            background-color: #f8fafc;
          }
          .header { 
            background: #10B981; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 30px 20px; 
            background: white;
            border-radius: 0 0 8px 8px;
          }
          .button { 
            background: #10B981; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            margin-top: 20px;
          }
          .success {
            background: #d1fae5;
            border: 1px solid #10b981;
            color: #065f46;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ BidFlow Tracking Started</h1>
          </div>
          <div class="content">
            <h2>You're Now Tracking This Bid</h2>
            <div class="success">
              <strong>Success!</strong> You will receive alerts for important dates and deadlines.
            </div>
            
            <h3>Contract Details:</h3>
            <p><strong>Title:</strong> ${contractTitle}</p>
            <p><strong>Client:</strong> ${client}</p>
            
            <p>You'll receive notifications for:</p>
            <ul>
              <li>7 days before deadline</li>
              <li>3 days before deadline</li>
              <li>1 day before deadline</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bidflow.ug'}/dashboard/tracking" class="button">
              View Tracked Bids
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This is an automated confirmation from BidFlow. 
              You can manage your notification preferences in your profile settings.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
