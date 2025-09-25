import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Fetch all procuring entities
    const { data: procuringEntities, error: entitiesError } = await supabase
      .from('procuring_entities')
      .select('*');

    if (entitiesError) {
      console.error('Error fetching procuring entities:', entitiesError);
      return NextResponse.json({ 
        error: 'Failed to fetch procuring entities', 
        details: entitiesError 
      }, { status: 500 });
    }

    // Fetch all awarded contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        procuring_entity,
        procuring_entity_id,
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
    const totalProcuringEntities = procuringEntities?.length || 0;
    let totalValue = 0;
    let totalContracts = 0;

    // Calculate entity statistics using proper foreign key relationships
    const entityStats = new Map();
    
    contracts?.forEach(contract => {
      const value = contract.awarded_value || contract.estimated_value_max || 0;
      
      // Find the entity for this contract
      let entityName = null;
      
      // Primary method: Use foreign key relationship
      if (contract.procuring_entity_id) {
        const entity = procuringEntities?.find(e => e.id === contract.procuring_entity_id);
        if (entity) {
          entityName = entity.entity_name;
        }
      }
      
      // Fallback method: Use text field
      if (!entityName) {
        entityName = contract.procuring_entity?.trim();
      }
      
      if (!entityName) return;
      
      if (!entityStats.has(entityName)) {
        entityStats.set(entityName, {
          name: entityName,
          value: 0,
          contracts: 0
        });
      }
      
      const stats = entityStats.get(entityName);
      stats.value += value;
      stats.contracts += 1;
      totalValue += value;
      totalContracts += 1;
    });

    // Get top entities by value
    const topEntities = Array.from(entityStats.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const averageValue = totalProcuringEntities > 0 ? totalValue / totalProcuringEntities : 0;

    return NextResponse.json({
      success: true,
      totalProcuringEntities,
      totalValue,
      averageValue,
      topEntities
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
