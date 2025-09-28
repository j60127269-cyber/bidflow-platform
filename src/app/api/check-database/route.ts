import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== COMPREHENSIVE DATABASE CHECK ===');
    
    // Check if profiles table exists and has data
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log('Profiles table check:', {
      error: profilesError,
      count: profilesCount,
      sampleData: profiles
    });

    // Check contracts table
    const { data: contracts, error: contractsError, count: contractsCount } = await supabase
      .from('contracts')
      .select('*', { count: 'exact' })
      .eq('publish_status', 'published')
      .limit(3);

    console.log('Contracts table check:', {
      error: contractsError,
      count: contractsCount,
      sampleData: contracts
    });

    // Check notifications table
    const { data: notifications, error: notificationsError, count: notificationsCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .limit(3);

    console.log('Notifications table check:', {
      error: notificationsError,
      count: notificationsCount,
      sampleData: notifications
    });

    // Check user_notification_preferences table
    const { data: preferences, error: preferencesError, count: preferencesCount } = await supabase
      .from('user_notification_preferences')
      .select('*', { count: 'exact' })
      .limit(3);

    console.log('User notification preferences table check:', {
      error: preferencesError,
      count: preferencesCount,
      sampleData: preferences
    });

    return NextResponse.json({
      success: true,
      message: 'Database structure checked',
      results: {
        profiles: {
          error: profilesError?.message,
          count: profilesCount,
          sampleData: profiles?.map(p => ({
            id: p.id,
            email: p.email,
            hasIndustryPreferences: !!p.industry_preferences,
            hasContractTypePreferences: !!p.contract_type_preferences,
            hasPreferredCategories: !!p.preferred_categories,
            allColumns: Object.keys(p)
          }))
        },
        contracts: {
          error: contractsError?.message,
          count: contractsCount,
          sampleData: contracts?.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            publish_status: c.publish_status
          }))
        },
        notifications: {
          error: notificationsError?.message,
          count: notificationsCount,
          sampleData: notifications
        },
        userNotificationPreferences: {
          error: preferencesError?.message,
          count: preferencesCount,
          sampleData: preferences
        }
      }
    });

  } catch (error) {
    console.error('Error in check-database:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
