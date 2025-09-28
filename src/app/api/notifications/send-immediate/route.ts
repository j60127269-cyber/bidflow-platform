import { NextRequest, NextResponse } from 'next/server';
import { ImmediateNotificationService } from '@/lib/immediate-notification-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sending immediate email notifications...');
    
    const result = await ImmediateNotificationService.processNewContractNotifications();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Immediate notifications processed successfully',
        emailsSent: result.processed || 0,
        errors: result.errors || 0
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in send-immediate-notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to send immediate notifications'
  });
}
