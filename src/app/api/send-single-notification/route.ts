import { NextRequest, NextResponse } from 'next/server';
import { EmailServiceProvider, emailConfig } from '@/lib/email-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sending single notification email...');
    
    // Send a single immediate notification email
    const emailSent = await EmailServiceProvider.sendEmail(emailConfig, {
      to: 'sebunyaronaldoo@gmail.com',
      subject: '🚀 New Contract Match: ICT Management Information Systems',
      html: `
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
              <h2 style="color: #000000; margin-top: 0;">Consumer electronics, communication equipment, computers, computer software and consumables and optical products - ICT - Management Information Systems</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #000000; margin-top: 0;">Contract Details</h3>
                <p><strong>Procuring Entity:</strong> Ministry of ICT</p>
                <p><strong>Category:</strong> Information Technology</p>
                <p><strong>Estimated Value:</strong> UGX 50,000,000</p>
                <p><strong>Submission Deadline:</strong> 2024-12-31</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard/contracts/1" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Contract Details</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an automated notification from BidCloud. 
                You received this because a new contract matching your preferences has been published.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        New Contract Match: Consumer electronics, communication equipment, computers, computer software and consumables and optical products - ICT - Management Information Systems
        
        A contract matching your preferences has been published.
        
        Contract Details:
        - Title: Consumer electronics, communication equipment, computers, computer software and consumables and optical products - ICT - Management Information Systems
        - Procuring Entity: Ministry of ICT
        - Category: Information Technology
        - Estimated Value: UGX 50,000,000
        - Submission Deadline: 2024-12-31
        
        View Contract Details: http://localhost:3000/dashboard/contracts/1
        
        This is an automated notification from BidCloud.
      `
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Single notification email sent successfully',
        emailSent: true
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send notification email'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in send-single-notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
