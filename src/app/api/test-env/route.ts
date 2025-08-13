import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envStatus = {
      resend: {
        apiKey: process.env.RESEND_API_KEY ? '✅ Loaded' : '❌ Missing',
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...' || 'N/A'
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ Missing',
        authToken: process.env.TWILIO_AUTH_TOKEN ? '✅ Loaded' : '❌ Missing',
        accountSidValue: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...' || 'N/A',
        authTokenValue: process.env.TWILIO_AUTH_TOKEN ? '***' + process.env.TWILIO_AUTH_TOKEN.slice(-4) : 'N/A'
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Missing'
      },
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      }
    };

    return NextResponse.json(envStatus);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}

