import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST() {
  try {
    console.log('Testing email to sebunyaronaldoo@gmail.com...');
    
    // Create a test daily digest email
    const testOpportunities = [
      {
        id: 'test-1',
        title: 'ICT Infrastructure Development Project',
        procuring_entity: 'Ministry of ICT',
        submission_deadline: '2024-02-15T23:59:59Z',
        matching_keywords: 'Information Technology, ICT',
        matching_location: 'Kampala',
        match_score: 5,
        days_remaining: 7,
        category: 'Information Technology'
      },
      {
        id: 'test-2',
        title: 'Software Development Services',
        procuring_entity: 'Uganda Revenue Authority',
        submission_deadline: '2024-02-20T23:59:59Z',
        matching_keywords: 'Information Technology, Software',
        matching_location: 'Kampala',
        match_score: 4,
        days_remaining: 12,
        category: 'Information Technology'
      }
    ];

    const emailData = EmailService.generateDailyDigestEmail(
      testOpportunities,
      'sebunyaronaldoo@gmail.com',
      15 // total matches
    );

    console.log('Generated email data:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html?.length,
      textLength: emailData.text?.length
    });

    // Send the email
    const result = await EmailService.sendEmail(emailData);
    
    console.log('Email send result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully to sebunyaronaldoo@gmail.com',
      emailData: {
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html?.length,
        textLength: emailData.text?.length
      },
      sendResult: result
    });

  } catch (error) {
    console.error('Error in test-email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to send test email'
  });
}