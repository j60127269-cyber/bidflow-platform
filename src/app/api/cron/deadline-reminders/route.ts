import { NextRequest, NextResponse } from 'next/server';
import { PreferenceNotificationService } from '@/lib/preferenceNotificationService';

export async function GET(request: NextRequest) {
  try {
    // Check for authorization header (you can add API key validation here)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Send preference-based deadline reminders
    await PreferenceNotificationService.sendPreferenceBasedDeadlineReminders();

    return NextResponse.json({
      success: true,
      message: 'Deadline reminders sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending deadline reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
