import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging contract processing...');
    
    // Get the specific contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', 'f9298a94-090e-43d7-aab6-4bf52366d06d')
      .single();

    if (contractError || !contract) {
      return NextResponse.json({
        success: false,
        message: 'Contract not found',
        error: contractError?.message
      });
    }

    console.log('📋 Contract found:', {
      id: contract.id,
      title: contract.title,
      category: contract.category,
      publish_status: contract.publish_status,
      created_at: contract.created_at
    });

    // Get the user
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        preferred_categories,
        email_notifications
      `)
      .eq('email', 'sebunyaronaldoo@gmail.com')
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: userError?.message
      });
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      preferred_categories: user.preferred_categories,
      email_notifications: user.email_notifications
    });

    // Test matching logic
    const userCategories = user.preferred_categories || [];
    const contractCategory = contract.category;
    const matches = userCategories.includes(contractCategory);
    
    console.log('🎯 Matching test:', {
      userCategories,
      contractCategory,
      matches
    });

    // Check for existing notifications
    const { data: existingNotification } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('contract_id', contract.id)
      .order('created_at', { ascending: false });

    console.log('📧 Existing notifications:', existingNotification);

    // Check if contract is within the 7-day window
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const contractDate = new Date(contract.created_at);
    const withinWindow = contractDate >= sevenDaysAgo;

    console.log('⏰ Time window check:', {
      sevenDaysAgo: sevenDaysAgo.toISOString(),
      contractCreated: contract.created_at,
      withinWindow
    });

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        category: contract.category,
        publish_status: contract.publish_status,
        created_at: contract.created_at
      },
      user: {
        id: user.id,
        email: user.email,
        preferred_categories: user.preferred_categories,
        email_notifications: user.email_notifications
      },
      matching: {
        userCategories,
        contractCategory,
        matches,
        withinTimeWindow: withinWindow
      },
      existingNotifications: existingNotification,
      analysis: {
        shouldSendNotification: matches && user.email_notifications && withinWindow && (!existingNotification || existingNotification.length === 0),
        reasons: {
          categoryMatch: matches,
          emailEnabled: user.email_notifications,
          withinTimeWindow: withinWindow,
          noExistingNotifications: !existingNotification || existingNotification.length === 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
