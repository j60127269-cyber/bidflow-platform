import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationQueueService } from '@/lib/notification-queue-service-simple';

// Use service role to bypass RLS for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { contractId } = await request.json();
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    console.log(`🚀 Processing contract ${contractId} for immediate notifications...`);
    
    // Get the specific contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('publish_status', 'published')
      .single();

    if (contractError || !contract) {
      console.log('❌ Contract not found or not published:', contractError);
      return NextResponse.json({ 
        success: false,
        message: 'Contract not found or not published',
        error: contractError?.message 
      });
    }

    console.log(`📋 Processing contract: ${contract.title} (${contract.category})`);

    // Get users with matching preferences
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        preferred_categories,
        email_notifications
      `)
      .not('email', 'is', null)
      .eq('email_notifications', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Filter users based on exact category matching
    const matchingUsers = users?.filter(user => {
      const userCategories = user.preferred_categories || [];
      const contractCategory = contract.category;
      const matches = userCategories.includes(contractCategory);

      console.log(`👤 User ${user.email}:`, {
        preferred_categories: user.preferred_categories,
        contract_category: contract.category,
        matches
      });

      return matches;
    }) || [];

    console.log(`🎯 Found ${matchingUsers.length} matching users for contract: ${contract.title}`);

    if (matchingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matching users found for this contract',
        contract: {
          id: contract.id,
          title: contract.title,
          category: contract.category
        },
        matchingUsers: 0,
        notificationsQueued: 0
      });
    }

    let totalNotifications = 0;

    // Add notifications to queue for matching users (with duplicate prevention)
    for (const user of matchingUsers) {
      try {
        // Check if user already received notification for this specific contract
        const { data: existingNotification } = await supabase
          .from('notification_queue')
          .select('id')
          .eq('user_id', user.id)
          .eq('contract_id', contract.id)
          .eq('status', 'sent')
          .single();

        if (existingNotification) {
          console.log(`⚠️ User ${user.email} already received notification for contract ${contract.id} - skipping duplicate`);
          continue;
        }

        const queueResult = await NotificationQueueService.addToQueue(
          user.id,
          contract.id,
          1, // Version
          'contract_match',
          1, // Priority
          {
            preferred_categories: user.preferred_categories,
            contract_title: contract.title,
            procuring_entity: contract.procuring_entity
          }
        );

        if (queueResult.success) {
          totalNotifications++;
          console.log(`✅ Added notification to queue for user: ${user.email}`);
        } else {
          console.error(`❌ Failed to add notification to queue for ${user.email}:`, queueResult.error);
        }
      } catch (error) {
        console.error('Error adding notification to queue:', error);
      }
    }

    // Process the queue to send emails immediately
    console.log('📧 Processing notification queue...');
    const queueResult = await NotificationQueueService.processQueue(50);

    return NextResponse.json({
      success: true,
      message: 'Contract processed for immediate notifications',
      contract: {
        id: contract.id,
        title: contract.title,
        category: contract.category
      },
      matchingUsers: matchingUsers.length,
      notificationsQueued: totalNotifications,
      queueProcessed: queueResult.processed,
      queueSuccess: queueResult.success,
      queueFailed: queueResult.failed,
      queueErrors: queueResult.errors
    });

  } catch (error) {
    console.error('Error in notify-on-publish:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
