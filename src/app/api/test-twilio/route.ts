import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json({
        error: 'Missing Twilio credentials',
        accountSid: accountSid ? '✅ Present' : '❌ Missing',
        authToken: authToken ? '✅ Present' : '❌ Missing'
      }, { status: 400 });
    }

    // Test basic Twilio authentication
    const twilio = await import('twilio');
    const client = twilio(accountSid, authToken);

    // Try to fetch account info to test credentials
    const account = await client.api.accounts(accountSid).fetch();

    return NextResponse.json({
      success: true,
      message: 'Twilio credentials are valid!',
      accountSid: accountSid.substring(0, 10) + '...',
      accountStatus: account.status,
      accountName: account.friendlyName
    });

  } catch (error: any) {
    console.error('Twilio credentials test failed:', error);
    
    return NextResponse.json({
      error: 'Twilio credentials test failed',
      details: error.message,
      code: error.code,
      status: error.status
    }, { status: 500 });
  }
}
