import { NextRequest, NextResponse } from 'next/server';
import { EmailServiceProvider, emailConfig } from '@/lib/email-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing domain verification with bidcloud.com...');
    
    // Test sending an email to your verified address using the new domain
    const emailSent = await EmailServiceProvider.sendEmail(emailConfig, {
      to: 'sebunyaronaldoo@gmail.com',
      subject: '🎯 Domain Verification Test - bidcloud.com',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Domain Verification Test</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Domain Verification Test</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Testing bidcloud.com domain</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #000000; margin-top: 0;">Domain Status Check</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #000000; margin-top: 0;">📧 Email Configuration</h3>
                <p><strong>From Email:</strong> ${emailConfig.fromEmail}</p>
                <p><strong>From Name:</strong> ${emailConfig.fromName}</p>
                <p><strong>Provider:</strong> ${emailConfig.provider}</p>
                <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #000000; margin-top: 0;">✅ Domain Verification Test</h4>
                <p style="margin: 0;">If you receive this email, the bidcloud.com domain is working correctly!</p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This test verifies that your bidcloud.com domain is properly configured in Resend.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        Domain Verification Test - bidcloud.com
        
        Domain Status Check
        
        Email Configuration:
        - From Email: ${emailConfig.fromEmail}
        - From Name: ${emailConfig.fromName}
        - Provider: ${emailConfig.provider}
        - Test Time: ${new Date().toLocaleString()}
        
        ✅ Domain Verification Test
        If you receive this email, the bidcloud.com domain is working correctly!
        
        This test verifies that your bidcloud.com domain is properly configured in Resend.
      `
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Domain verification test successful! bidcloud.com is working.',
        domain: 'bidcloud.com',
        fromEmail: emailConfig.fromEmail,
        emailSent: true
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Domain verification test failed. Check Resend domain settings.',
        domain: 'bidcloud.com',
        fromEmail: emailConfig.fromEmail,
        emailSent: false
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in test-domain-verification:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      domain: 'bidcloud.com',
      fromEmail: emailConfig.fromEmail
    }, { status: 500 });
  }
}
