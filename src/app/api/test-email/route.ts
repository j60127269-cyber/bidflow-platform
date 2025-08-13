import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Test email without requiring Supabase
    const testHtml = `
      <h1>🧪 Test Email from BidFlow</h1>
      <p>This is a test email to verify that Resend is working correctly.</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p>If you receive this email, the notification system is working!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This is an automated test from your BidFlow notification system.
      </p>
    `;

    await emailService.send(
      email,
      '🧪 Test Email from BidFlow',
      testHtml
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error },
      { status: 500 }
    );
  }
}

