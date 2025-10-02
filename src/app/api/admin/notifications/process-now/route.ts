import { NextRequest, NextResponse } from 'next/server';
import { NotificationQueueService } from '@/lib/notification-queue-service-simple';

export async function POST(request: NextRequest) {
  try {
    const result = await NotificationQueueService.processQueue(20); // Process up to 20 notifications

    return NextResponse.json({
      success: true,
      processed: result.processed,
      success: result.success,
      failed: result.failed,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
