import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Resend import...');
    
    // Test if Resend can be imported
    const { Resend } = await import('resend');
    console.log('✅ Resend imported successfully');
    
    // Test if we can create a Resend instance
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend instance created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Resend import test successful',
      resend_api_key_exists: !!process.env.RESEND_API_KEY,
      resend_from_email: process.env.RESEND_FROM_EMAIL
    });

  } catch (error) {
    console.error('❌ Resend import test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Resend import test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
