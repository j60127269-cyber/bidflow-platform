import { NextRequest, NextResponse } from 'next/server';
import { NotificationQueueService } from '@/lib/notification-queue-service-simple';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing notification queue...');
    
    const result = await NotificationQueueService.processQueue(20); // Process up to 20 notifications

    console.log(`Queue processing completed: ${result.processed} processed, ${result.success} successful, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      success: result.success,
      failed: result.failed,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error processing notification queue:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to process the notification queue'
  });
}
