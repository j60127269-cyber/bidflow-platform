import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Fetch all agencies
    const { data: agencies, error: agenciesError } = await supabase
      .from('procuring_entities')
      .select('*');

    if (agenciesError) {
      console.error('Error fetching agencies:', agenciesError);
      return NextResponse.json({ 
        error: 'Failed to fetch agencies', 
        details: agenciesError 
      }, { status: 500 });
    }

    // Fetch all awarded contracts
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

    // Calculate total statistics
    const totalAgencies = agencies?.length || 0;
    let totalValue = 0;
    let totalContracts = 0;

    // Calculate agency statistics using proper foreign key relationships
    const agencyStats = new Map();
    
    contracts?.forEach(contract => {
      const value = contract.awarded_value || contract.estimated_value_max || 0;
      
      // Find the agency for this contract
      let agencyName = null;
      
      // Primary method: Use foreign key relationship
      if (contract.procuring_entity_id) {
        const agency = agencies?.find(a => a.id === contract.procuring_entity_id);
        if (agency) {
          agencyName = agency.entity_name;
        }
      }
      
      // Fallback method: Use text field
      if (!agencyName) {
        agencyName = contract.procuring_entity?.trim();
      }
      
      if (!agencyName) return;
      
      if (!agencyStats.has(agencyName)) {
        agencyStats.set(agencyName, {
          name: agencyName,
          value: 0,
          contracts: 0
        });
      }
      
      const stats = agencyStats.get(agencyName);
      stats.value += value;
      stats.contracts += 1;
      totalValue += value;
      totalContracts += 1;
    });

    // Get top agencies by value
    const topAgencies = Array.from(agencyStats.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const averageValue = totalAgencies > 0 ? totalValue / totalAgencies : 0;

    return NextResponse.json({
      success: true,
      totalAgencies,
      totalValue,
      averageValue,
      topAgencies
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
