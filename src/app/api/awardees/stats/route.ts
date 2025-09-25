import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all awardees
    const { data: awardees, error: awardeesError } = await supabase
      .from('awardees')
      .select('id, company_name')
      .order('company_name', { ascending: true });

    if (awardeesError) {
      console.error('Error fetching awardees:', awardeesError);
      return NextResponse.json({ error: 'Failed to fetch awardees' }, { status: 500 });
    }

    // Get all awarded contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        awarded_company_id,
        awarded_to,
        awarded_value,
        estimated_value_max
      `)
      .eq('status', 'awarded');

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    // Calculate statistics
    const totalAwardees = awardees?.length || 0;
    
    // Calculate total value from contracts
    const totalValue = contracts?.reduce((sum, contract) => {
      const value = contract.awarded_value || contract.estimated_value_max || 0;
      return sum + value;
    }, 0) || 0;

    const averageValue = totalAwardees > 0 ? totalValue / totalAwardees : 0;

    // Calculate top awardees by value
    const awardeeStats = new Map();
    
    contracts?.forEach(contract => {
      const companyName = contract.awarded_to;
      if (!companyName) return;

      const value = contract.awarded_value || contract.estimated_value_max || 0;
      
      if (awardeeStats.has(companyName)) {
        const existing = awardeeStats.get(companyName);
        awardeeStats.set(companyName, {
          company_name: companyName,
          total_contracts: existing.total_contracts + 1,
          total_value: existing.total_value + value
        });
      } else {
        awardeeStats.set(companyName, {
          company_name: companyName,
          total_contracts: 1,
          total_value: value
        });
      }
    });

    const topAwardees = Array.from(awardeeStats.values())
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10);

    return NextResponse.json({
      totalAwardees,
      totalValue,
      averageValue,
      topAwardees
    });

  } catch (error) {
    console.error('Error in awardees stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}