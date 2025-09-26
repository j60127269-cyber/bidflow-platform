import { NextRequest, NextResponse } from 'next/server';
import { NotificationProcessor } from '@/lib/notification-processor';

// POST /api/notifications/process - Process pending notifications
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting notification processing...');
    
    // Process all pending notifications
    await NotificationProcessor.processPendingNotifications();
    
    // Get stats
    const stats = await NotificationProcessor.getNotificationStats();
    
    return NextResponse.json({
      success: true,
      message: 'Notifications processed successfully',
      stats
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to process notifications' 
    }, { status: 500 });
  }
}

// GET /api/notifications/process - Get notification stats
export async function GET(request: NextRequest) {
  try {
    const stats = await NotificationProcessor.getNotificationStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notification stats' 
    }, { status: 500 });
  }
}
