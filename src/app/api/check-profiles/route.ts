import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== CHECKING PROFILES TABLE STRUCTURE ===');
    
    // Get a sample of users to see the actual structure
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log('Sample users from profiles table:');
    users?.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        industry_preferences: user.industry_preferences,
        contract_type_preferences: user.contract_type_preferences,
        preferred_categories: user.preferred_categories,
        location_preferences: user.location_preferences,
        // Show all available columns
        allColumns: Object.keys(user)
      });
    });

    // Get the most recent contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('publish_status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (contractError) {
      console.error('Error fetching contract:', contractError);
      return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
    }

    console.log('Most recent contract:', {
      id: contract.id,
      title: contract.title,
      category: contract.category,
      procuring_entity: contract.procuring_entity
    });

    return NextResponse.json({
      success: true,
      message: 'Profiles table structure checked',
      sampleUsers: users?.map(user => ({
        id: user.id,
        email: user.email,
        industry_preferences: user.industry_preferences,
        contract_type_preferences: user.contract_type_preferences,
        preferred_categories: user.preferred_categories,
        location_preferences: user.location_preferences,
        allColumns: Object.keys(user)
      })),
      recentContract: {
        id: contract.id,
        title: contract.title,
        category: contract.category,
        procuring_entity: contract.procuring_entity
      }
    });

  } catch (error) {
    console.error('Error in check-profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
