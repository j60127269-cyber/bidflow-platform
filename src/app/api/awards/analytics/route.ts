import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all awarded contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        title,
        awarded_value,
        estimated_value_max,
        award_date,
        awarded_company_id,
        created_at
      `)
      .eq('status', 'awarded')
      .order('award_date', { ascending: false });

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    // Get awardee information for awarded contracts
    const { data: awardees, error: awardeesError } = await supabase
      .from('awardees')
      .select('id, company_name');

    if (awardeesError) {
      console.error('Error fetching awardees:', awardeesError);
      return NextResponse.json({ error: 'Failed to fetch awardees' }, { status: 500 });
    }

    // Create awardee lookup map
    const awardeeMap = new Map(awardees.map(a => [a.id, a.company_name]));

    // Calculate analytics
    const totalAwards = contracts.length;
    const totalValue = contracts.reduce((sum, contract) => sum + (contract.awarded_value || contract.estimated_value_max || 0), 0);

    // Top awardees
    const awardeeStats = new Map();
    contracts.forEach(contract => {
      if (contract.awarded_company_id) {
        const companyName = awardeeMap.get(contract.awarded_company_id) || 'Unknown Company';
        const current = awardeeStats.get(companyName) || { award_count: 0, total_value: 0 };
        awardeeStats.set(companyName, {
          award_count: current.award_count + 1,
          total_value: current.total_value + (contract.awarded_value || contract.estimated_value_max || 0)
        });
      }
    });

    const topAwardees = Array.from(awardeeStats.entries())
      .map(([company_name, stats]) => ({ company_name, ...stats }))
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10);

    // Monthly trends (last 12 months)
    const monthlyTrends = new Map();
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyTrends.set(monthKey, { count: 0, value: 0 });
    }

    contracts.forEach(contract => {
      if (contract.award_date) {
        const awardDate = new Date(contract.award_date);
        const monthKey = awardDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (monthlyTrends.has(monthKey)) {
          const current = monthlyTrends.get(monthKey);
          monthlyTrends.set(monthKey, {
            count: current.count + 1,
            value: current.value + (contract.awarded_value || contract.estimated_value_max || 0)
          });
        }
      }
    });

    const monthlyTrendsArray = Array.from(monthlyTrends.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => {
        const dateA = new Date(a.month + ' 1, ' + new Date().getFullYear());
        const dateB = new Date(b.month + ' 1, ' + new Date().getFullYear());
        return dateA.getTime() - dateB.getTime();
      });

    return NextResponse.json({
      totalAwards,
      totalValue,
      topAwardees,
      monthlyTrends: monthlyTrendsArray
    });

  } catch (error) {
    console.error('Error in awards analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
