import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Fetch all agencies
    const { data: agencies, error } = await supabase
      .from('procuring_entities')
      .select('*')
      .order('entity_name', { ascending: true });

    if (error) {
      console.error('Error fetching agencies:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch agencies', 
        details: error 
      }, { status: 500 });
    }

    // Get all awarded contracts to calculate statistics
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        procuring_entity,
        awarded_value,
        estimated_value_max,
        status
      `)
      .eq('status', 'awarded');

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({ 
        error: 'Failed to fetch contracts', 
        details: contractsError 
      }, { status: 500 });
    }

    // Calculate statistics for each agency using proper foreign key relationships
    const agenciesWithStats = agencies?.map(agency => {
      let totalValue = 0;
      let contractCount = 0;
      let recentContracts = 0;

      // Find contracts for this agency using foreign key relationship
      const agencyContracts = contracts?.filter(contract => {
        // Primary method: Use foreign key relationship
        if (contract.procuring_entity_id === agency.id) {
          return true;
        }
        
        // Fallback method: Use text matching for contracts without foreign keys
        return contract.procuring_entity?.trim().toLowerCase() === agency.entity_name?.trim().toLowerCase();
      }) || [];

      // Calculate statistics
      agencyContracts.forEach(contract => {
        const value = contract.awarded_value || contract.estimated_value_max || 0;
        totalValue += value;
        contractCount += 1;
        
        // Count recent contracts (last 30 days)
        const contractDate = new Date(contract.created_at || contract.updated_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (contractDate >= thirtyDaysAgo) {
          recentContracts += 1;
        }
      });

      return {
        ...agency,
        total_contracts: contractCount,
        total_value: totalValue,
        recent_contracts: recentContracts
      };
    }) || [];

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const paginatedAgencies = agenciesWithStats.slice(from, to + 1);

    return NextResponse.json({ 
      success: true, 
      agencies: paginatedAgencies,
      pagination: {
        page,
        limit,
        total: agenciesWithStats.length,
        totalPages: Math.ceil(agenciesWithStats.length / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
