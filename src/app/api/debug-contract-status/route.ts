import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging contract status for ab8ae3f6-18ab-4322-91d4-5dc457e1b252...');
    
    // Get the contract with all details
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', 'ab8ae3f6-18ab-4322-91d4-5dc457e1b252')
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch contract',
        error: error.message
      });
    }

    // Check if there are any users with matching categories
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, preferred_categories, email_notifications')
      .not('email', 'is', null)
      .eq('email_notifications', true);

    if (usersError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch users',
        error: usersError.message
      });
    }

    // Check which users would match this contract
    const matchingUsers = users?.filter(user => {
      const userCategories = user.preferred_categories || [];
      const contractCategory = contract.category;
      return userCategories.includes(contractCategory);
    }) || [];

    // Check if sebunyaronaldoo@gmail.com exists and would match
    const sebunyarUser = users?.find(u => u.email === 'sebunyaronaldoo@gmail.com');
    const sebunyarMatches = sebunyarUser ? 
      (sebunyarUser.preferred_categories || []).includes(contract.category) : false;

    return NextResponse.json({
      success: true,
      message: 'Contract status debug completed',
      contract: {
        id: contract.id,
        title: contract.title,
        category: contract.category,
        status: contract.status,
        publish_status: contract.publish_status,
        created_at: contract.created_at,
        updated_at: contract.updated_at,
        published_at: contract.published_at
      },
      users: {
        total: users?.length || 0,
        with_email_notifications: users?.filter(u => u.email_notifications).length || 0,
        matching_contract_category: matchingUsers.length,
        sebunyar_exists: !!sebunyarUser,
        sebunyar_email: sebunyarUser?.email,
        sebunyar_categories: sebunyarUser?.preferred_categories,
        sebunyar_matches: sebunyarMatches
      },
      matching_users: matchingUsers.map(u => ({
        email: u.email,
        name: `${u.first_name} ${u.last_name}`.trim(),
        categories: u.preferred_categories
      }))
    });

  } catch (error) {
    console.error('❌ Debug contract status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug contract status failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
