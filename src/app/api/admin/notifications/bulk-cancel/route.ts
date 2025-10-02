import { NextRequest, NextResponse } from 'next/server';
import { NotificationQueueService } from '@/lib/notification-queue-service-simple';

export async function POST(request: NextRequest) {
  try {
    const result = await NotificationQueueService.bulkCancelPending();

    if (result.success) {
      return NextResponse.json({
        success: true,
        cancelledCount: result.cancelledCount
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error bulk cancelling notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
