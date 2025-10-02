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
    console.log('Processing new contracts for immediate notifications...');
    
    // Get recently published contracts (last 7 days to catch more real contracts)
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('publish_status', 'published')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    console.log(`Found ${contracts?.length || 0} recently published contracts`);

    if (!contracts || contracts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No recently published contracts found',
        contractsProcessed: 0
      });
    }

    let totalNotifications = 0;

    // Process each contract
    for (const contract of contracts) {
      try {
        console.log(`Processing contract: ${contract.title}`);
        
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
          continue;
        }

        // Filter users based on their preferences using exact matching
        const matchingUsers = users?.filter(user => {
          // Simple exact matching with standardized categories
          const userCategories = user.preferred_categories || [];
          const contractCategory = contract.category;
          
          // Exact match only - no fuzzy logic needed
          const matchesPreferredCategories = userCategories.includes(contractCategory);

          console.log(`User ${user.email}:`, {
            preferred_categories: user.preferred_categories,
            contract_category: contract.category,
            matchesPreferredCategories
          });

          return matchesPreferredCategories;
        }) || [];

        console.log(`Found ${matchingUsers.length} users with matching preferences for contract: ${contract.title}`);

        // Get current contract version
        const { data: versionData } = await supabase
          .from('contract_versions')
          .select('version')
          .eq('contract_id', contract.id)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        const contractVersion = versionData?.version || 1;

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
              console.log(`User ${user.email} already received notification for contract ${contract.id} - skipping duplicate`);
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
                business_type: user.business_type,
                contract_title: contract.title,
                procuring_entity: contract.procuring_entity
              }
            );

            if (queueResult.success) {
              totalNotifications++;
              console.log(`Added notification to queue for user: ${user.email}`);
            } else {
              console.error(`Failed to add notification to queue for ${user.email}:`, queueResult.error);
            }
          } catch (error) {
            console.error('Error adding notification to queue:', error);
          }
        }

      } catch (error) {
        console.error('Error processing contract:', error);
      }
    }

    // Process the queue to send emails immediately
    const queueResult = await NotificationQueueService.processQueue(50);

    return NextResponse.json({
      success: true,
      message: 'Contract processing completed',
      contractsProcessed: contracts.length,
      notificationsQueued: totalNotifications,
      queueProcessed: queueResult.processed,
      queueSuccess: queueResult.success,
      queueFailed: queueResult.failed,
      queueErrors: queueResult.errors
    });

  } catch (error) {
    console.error('Error in process-new-contracts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to process new contracts'
  });
}
