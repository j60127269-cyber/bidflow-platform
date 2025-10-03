import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/enhanced-email-service';

export async function GET() {
  try {
    console.log('🧪 Testing simple email sending...');
    
    // Test sending a simple email
    const result = await EmailService.sendNewContractNotification(
      {
        id: 'test-contract-id',
        title: 'Test Contract',
        category: 'Information Technology',
        submission_deadline: '2025-12-31',
        estimated_value_min: 1000000,
        estimated_value_max: 2000000,
        procuring_entity: 'Test Entity'
      },
      'sebunyaronaldoo@gmail.com'
    );

    return NextResponse.json({
      success: true,
      message: 'Simple email test completed',
      result: result
    });

  } catch (error) {
    console.error('❌ Simple email test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Simple email test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
