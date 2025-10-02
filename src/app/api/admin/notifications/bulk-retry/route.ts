import { NextRequest, NextResponse } from 'next/server';
import { NotificationQueueService } from '@/lib/notification-queue-service';

export async function POST(request: NextRequest) {
  try {
    const result = await NotificationQueueService.bulkRetryFailed();

    if (result.success) {
      return NextResponse.json({
        success: true,
        retriedCount: result.retriedCount
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error bulk retrying notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
