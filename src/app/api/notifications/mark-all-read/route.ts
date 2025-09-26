import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '@/lib/notifications';

// PUT /api/notifications/mark-all-read - Mark all notifications as read for user
export async function PUT(request: NextRequest) {
  try {
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

    const success = await NotificationService.markAllAsRead(user.id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
