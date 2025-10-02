/**
 * Consolidated Notification API
 * Handles all notification operations using the consolidated system
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConsolidatedNotificationSystem } from '@/lib/consolidated-notification-system';
import { EnhancedEmailService } from '@/lib/enhanced-email-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { action, userId, type, title, message, data, channels } = await request.json();

    switch (action) {
      case 'send_notification':
        return await handleSendNotification(userId, type, title, message, data, channels);
      
      case 'process_pending':
        return await handleProcessPending();
      
      case 'get_user_stats':
        return await handleGetUserStats(userId);
      
      case 'mark_read':
        return await handleMarkAsRead(data.notificationId);
      
      case 'test_email':
        return await handleTestEmail(data.email, data.contract);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in consolidated notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send a notification using the consolidated system
 */
async function handleSendNotification(
  userId: string,
  type: 'new_contract_match' | 'deadline_reminder',
  title: string,
  message: string,
  data: any,
  channels: any
) {
  try {
    const result = await ConsolidatedNotificationSystem.sendNotification(
      userId,
      type,
      title,
      message,
      data,
      channels
    );

    return NextResponse.json({
      success: result.success,
      results: result.results,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

/**
 * Process all pending notifications
 */
async function handleProcessPending() {
  try {
    await ConsolidatedNotificationSystem.processPendingNotifications();
    
    return NextResponse.json({
      success: true,
      message: 'Pending notifications processed'
    });

  } catch (error) {
    console.error('Error processing pending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process pending notifications' },
      { status: 500 }
    );
  }
}

/**
 * Get user notification statistics
 */
async function handleGetUserStats(userId: string) {
  try {
    const stats = await ConsolidatedNotificationSystem.getUserNotificationStats(userId);
    
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    return NextResponse.json(
      { error: 'Failed to get user stats' },
      { status: 500 }
    );
  }
}

/**
 * Mark notification as read
 */
async function handleMarkAsRead(notificationId: string) {
  try {
    const success = await ConsolidatedNotificationSystem.markNotificationAsRead(notificationId);
    
    return NextResponse.json({
      success,
      message: success ? 'Notification marked as read' : 'Failed to mark notification as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

/**
 * Test email delivery with enhanced service
 */
async function handleTestEmail(email: string, contract: any) {
  try {
    if (!contract) {
      // Create a sample contract for testing
      contract = {
        id: 'test-contract-123',
        title: 'Test Contract - Enhanced Email Service',
        procuring_entity: 'Test Procuring Entity',
        category: 'Information Technology',
        submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_value_min: 1000000,
        estimated_value_max: 2000000
      };
    }

    const result = await EnhancedEmailService.sendContractMatchNotification(
      email,
      contract,
      {
        preferred_categories: ['Information Technology'],
        industry_preferences: ['IT & Technology']
      }
    );

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      retryCount: result.retryCount,
      deliveryTime: result.deliveryTime,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email'
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');

    switch (action) {
      case 'get_user_stats':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          );
        }
        return await handleGetUserStats(userId);
      
      case 'mark_read':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        return await handleMarkAsRead(notificationId);
      
      case 'process_pending':
        return await handleProcessPending();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in consolidated notification API GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
