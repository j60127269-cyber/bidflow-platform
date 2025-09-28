import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ImmediateNotificationService } from '@/lib/immediate-notification-service';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing new contracts for immediate notifications...');
    
    // Get recently published contracts (last 7 days to catch more real contracts)
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('publish_status', 'published')
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false });

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
            industry_preferences,
            location_preferences,
            contract_type_preferences,
            preferred_categories
          `)
          .not('email', 'is', null);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          continue;
        }

        // Filter users based on their preferences
        const matchingUsers = users?.filter(user => {
          // Helper function to check if any preference matches the contract category
          const checkMatch = (preferences: string[] | null | undefined) => {
            if (!preferences || preferences.length === 0) return true; // No preferences = match all
            
            return preferences.some(preference => {
              // Exact match
              if (contract.category.toLowerCase().includes(preference.toLowerCase())) return true;
              if (preference.toLowerCase().includes(contract.category.toLowerCase())) return true;
              
              // Check for common keywords
              const contractLower = contract.category.toLowerCase();
              const preferenceLower = preference.toLowerCase();
              
              // Check for ICT/IT keywords
              if ((preferenceLower.includes('information technology') || preferenceLower.includes('it')) && 
                  (contractLower.includes('ict') || contractLower.includes('computer') || contractLower.includes('software'))) {
                return true;
              }
              
              // Check for construction keywords
              if (preferenceLower.includes('construction') && 
                  (contractLower.includes('construction') || contractLower.includes('engineering') || contractLower.includes('building'))) {
                return true;
              }
              
              // Check for healthcare keywords
              if (preferenceLower.includes('health') && 
                  (contractLower.includes('health') || contractLower.includes('medical') || contractLower.includes('hospital'))) {
                return true;
              }
              
              return false;
            });
          };

          const matchesIndustry = checkMatch(user.industry_preferences);
          const matchesContractType = checkMatch(user.contract_type_preferences);
          const matchesPreferredCategories = checkMatch(user.preferred_categories);

          console.log(`User ${user.email}:`, {
            industry_preferences: user.industry_preferences,
            contract_type_preferences: user.contract_type_preferences,
            preferred_categories: user.preferred_categories,
            contract_category: contract.category,
            matchesIndustry,
            matchesContractType,
            matchesPreferredCategories
          });

          return matchesIndustry || matchesContractType || matchesPreferredCategories;
        }) || [];

        console.log(`Found ${matchingUsers.length} users with matching preferences for contract: ${contract.title}`);

        // Create notifications for matching users
        for (const user of matchingUsers) {
          try {
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'new_contract_match',
                title: `New Contract Match: ${contract.title}`,
                message: `A new contract matching your preferences has been published: ${contract.title}`,
                data: {
                  contract_id: contract.id,
                  contract_title: contract.title,
                  procuring_entity: contract.procuring_entity,
                  category: contract.category,
                  estimated_value_min: contract.estimated_value_min,
                  estimated_value_max: contract.estimated_value_max,
                  submission_deadline: contract.submission_deadline,
                  user_email: user.email
                },
                channel: 'email',
                priority: 'high'
              });

            if (notificationError) {
              console.error('Error creating notification:', notificationError);
            } else {
              totalNotifications++;
              console.log(`Created notification for user: ${user.email}`);
            }
          } catch (error) {
            console.error('Error processing user notification:', error);
          }
        }

      } catch (error) {
        console.error('Error processing contract:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contract processing completed',
      contractsProcessed: contracts.length,
      notificationsCreated: totalNotifications
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
