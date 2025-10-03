import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationQueueService } from '@/lib/notification-queue-service-simple';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🧪 Testing direct notification for contract ab8ae3f6-18ab-4322-91d4-5dc457e1b252...');
    
    // Get the contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', 'ab8ae3f6-18ab-4322-91d4-5dc457e1b252')
      .eq('publish_status', 'published')
      .single();

    if (contractError || !contract) {
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
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch users',
        error: usersError.message
      });
    }

    console.log(`👥 Found ${users?.length || 0} users with email notifications enabled`);

    // Filter users based on their preferences using exact matching
    const matchingUsers = users?.filter(user => {
      const userCategories = user.preferred_categories || [];
      const contractCategory = contract.category;
      return userCategories.includes(contractCategory);
    }) || [];

    console.log(`🎯 Found ${matchingUsers.length} users with matching preferences`);

    // Get current contract version
    const { data: versionData } = await supabase
      .from('contract_versions')
      .select('version')
      .eq('contract_id', contract.id)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const contractVersion = versionData?.version || 1;
    console.log(`📊 Contract version: ${contractVersion}`);

    let notificationsQueuedCount = 0;
    let notificationsSentCount = 0;

    // Add notifications to queue for matching users
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
          console.log(`⏭️ User ${user.email} already received notification for contract ${contract.id} - skipping duplicate`);
          continue;
        }

        const queueResult = await NotificationQueueService.addToQueue(
          user.id,
          contract.id,
          contractVersion,
          'contract_match',
          1, // Normal priority
          {
            preferred_categories: user.preferred_categories,
            contract_title: contract.title,
            procuring_entity: contract.procuring_entity
          }
        );

        if (queueResult.success) {
          notificationsQueuedCount++;
          console.log(`✅ Added notification to queue for user: ${user.email}`);
        } else {
          console.error(`❌ Failed to add notification to queue for ${user.email}:`, queueResult.error);
        }
      } catch (error) {
        console.error('❌ Error adding notification to queue:', error);
      }
    }

    // Process the queue to send emails immediately
    console.log('📧 Processing notification queue...');
    const queueResult = await NotificationQueueService.processQueue(50);

    return NextResponse.json({
      success: true,
      message: 'Direct notification test completed',
      contract: {
        id: contract.id,
        title: contract.title,
        category: contract.category,
        publish_status: contract.publish_status
      },
      users: {
        total: users?.length || 0,
        matching: matchingUsers.length,
        matching_emails: matchingUsers.map(u => u.email)
      },
      notifications: {
        queued: notificationsQueuedCount,
        processed: queueResult.processed,
        success: queueResult.success,
        failed: queueResult.failed,
        errors: queueResult.errors
      }
    });

  } catch (error) {
    console.error('❌ Direct notification test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Direct notification test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
