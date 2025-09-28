import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== DEBUGGING CONTRACT MATCHING ===');
    
    // Get the most recent published contract
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

    console.log('Contract found:', {
      id: contract.id,
      title: contract.title,
      category: contract.category,
      procuring_entity: contract.procuring_entity
    });

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        industry_preferences,
        contract_type_preferences,
        preferred_categories
      `)
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log(`Found ${users?.length || 0} users`);

    const matchingResults = [];

    // Check each user
    for (const user of users || []) {
      const matchesIndustry = user.industry_preferences?.includes(contract.category) || false;
      const matchesContractType = user.contract_type_preferences?.includes(contract.category) || false;
      const matchesPreferredCategories = user.preferred_categories?.includes(contract.category) || false;
      
      const matches = matchesIndustry || matchesContractType || matchesPreferredCategories;
      
      matchingResults.push({
        user_email: user.email,
        industry_preferences: user.industry_preferences,
        contract_type_preferences: user.contract_type_preferences,
        preferred_categories: user.preferred_categories,
        contract_category: contract.category,
        matchesIndustry,
        matchesContractType,
        matchesPreferredCategories,
        matches
      });

      console.log(`User ${user.email}:`, {
        industry_preferences: user.industry_preferences,
        contract_type_preferences: user.contract_type_preferences,
        preferred_categories: user.preferred_categories,
        contract_category: contract.category,
        matchesIndustry,
        matchesContractType,
        matchesPreferredCategories,
        matches
      });
    }

    const matchingUsers = matchingResults.filter(r => r.matches);
    console.log(`Found ${matchingUsers.length} matching users`);

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        category: contract.category
      },
      totalUsers: users?.length || 0,
      matchingUsers: matchingUsers.length,
      results: matchingResults
    });

  } catch (error) {
    console.error('Error in debug-matching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
