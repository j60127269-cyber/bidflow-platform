import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking notifications for contract ab8ae3f6-18ab-4322-91d4-5dc457e1b252...');
    
    // Get notifications for this specific contract
    const { data: notifications, error } = await supabase
      .from('notification_queue')
      .select(`
        id,
        user_id,
        contract_id,
        type,
        status,
        created_at,
        processed_at,
        email_sent,
        email_sent_at,
        error_message,
        retry_count,
        metadata
      `)
      .eq('contract_id', 'ab8ae3f6-18ab-4322-91d4-5dc457e1b252')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }

    // Get user details for the notifications
    const userIds = notifications?.map(n => n.user_id) || [];
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, preferred_categories')
      .in('id', userIds);

    if (usersError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch users',
        error: usersError.message
      });
    }

    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, title, category, publish_status, created_at, updated_at')
      .eq('id', 'ab8ae3f6-18ab-4322-91d4-5dc457e1b252')
      .single();

    if (contractError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch contract',
        error: contractError.message
      });
    }

    // Combine the data
    const enrichedNotifications = notifications?.map(notification => {
      const user = users?.find(u => u.id === notification.user_id);
      
      return {
        ...notification,
        user_email: user?.email,
        user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown',
        user_categories: user?.preferred_categories,
        contract_title: contract?.title,
        contract_category: contract?.category,
        contract_publish_status: contract?.publish_status
      };
    }) || [];

    // Check for sebunyaronaldoo@gmail.com specifically
    const sebunyarNotifications = enrichedNotifications.filter(n => n.user_email === 'sebunyaronaldoo@gmail.com');

    return NextResponse.json({
      success: true,
      message: 'Contract notifications check completed',
      contract: {
        id: contract?.id,
        title: contract?.title,
        category: contract?.category,
        publish_status: contract?.publish_status,
        updated_at: contract?.updated_at
      },
      total_notifications: notifications?.length || 0,
      notifications: enrichedNotifications,
      sebunyar_notifications: sebunyarNotifications,
      summary: {
        sent: notifications?.filter(n => n.status === 'sent').length || 0,
        failed: notifications?.filter(n => n.status === 'failed').length || 0,
        pending: notifications?.filter(n => n.status === 'pending').length || 0,
        processing: notifications?.filter(n => n.status === 'processing').length || 0
      }
    });

  } catch (error) {
    console.error('❌ Check contract notifications error:', error);
    return NextResponse.json({
      success: false,
      message: 'Check contract notifications failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
