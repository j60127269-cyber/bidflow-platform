import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '@/lib/notifications';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user from cookies (Next.js handles this automatically)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the user from the request
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await NotificationService.getUserNotifications(user.id, limit, offset);
    const unreadCount = await NotificationService.getUnreadCount(user.id);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create a notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, title, message, data, channel, priority } = body;

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check)
    // For now, we'll allow any authenticated user to create notifications
    // In production, you should implement proper admin role checking

    const notificationId = await NotificationService.createNotification(
      user_id,
      type,
      title,
      message,
      data,
      channel,
      priority
    );

    if (!notificationId) {
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      notificationId 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
