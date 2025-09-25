import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch all procuring entities
    const { data: procuringEntities, error } = await supabase
      .from('procuring_entities')
      .select('*')
      .order('entity_name', { ascending: true });

    if (error) {
      console.error('Error fetching procuring entities:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch procuring entities', 
        details: error 
      }, { status: 500 });
    }

    // Group entities by normalized name for duplicate detection
    const normalizedGroups: { [key: string]: any[] } = {};
    
    procuringEntities?.forEach(entity => {
      // Create a normalized key for comparison
      const normalizedName = entity.entity_name
        ?.toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      if (normalizedName) {
        if (!normalizedGroups[normalizedName]) {
          normalizedGroups[normalizedName] = [];
        }
        normalizedGroups[normalizedName].push(entity);
      }
    });

    // Find groups with duplicates
    const duplicateGroups = Object.entries(normalizedGroups)
      .filter(([_, entities]) => entities.length > 1)
      .map(([normalizedName, entities]) => ({
        normalizedName,
        entities: entities.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
        count: entities.length
      }));

    // Get contract counts for each duplicate group
    const duplicateGroupsWithStats = await Promise.all(
      duplicateGroups.map(async (group) => {
        const entityIds = group.entities.map(e => e.id);
        
        // Count contracts for each entity in the group
        const { data: contracts } = await supabase
          .from('contracts')
          .select('id, procuring_entity_id, procuring_entity')
          .or(`procuring_entity_id.in.(${entityIds.join(',')})`);
        
        const contractCounts = group.entities.map(entity => {
          const entityContracts = contracts?.filter(contract => 
            contract.procuring_entity_id === entity.id ||
            contract.procuring_entity?.toLowerCase().trim() === entity.entity_name?.toLowerCase().trim()
          ) || [];
          
          return {
            ...entity,
            contract_count: entityContracts.length
          };
        });

        return {
          ...group,
          entities: contractCounts,
          total_contracts: contracts?.length || 0
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      duplicates: duplicateGroupsWithStats,
      total_duplicates: duplicateGroupsWithStats.length,
      total_entities: procuringEntities?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mergeData } = await request.json();
    
    if (!mergeData || !mergeData.keepEntityId || !mergeData.mergeEntityIds) {
      return NextResponse.json({ 
        error: 'Invalid merge data provided' 
      }, { status: 400 });
    }

    const { keepEntityId, mergeEntityIds } = mergeData;

    // Start a transaction
    const { data: keepEntity, error: keepError } = await supabase
      .from('procuring_entities')
      .select('*')
      .eq('id', keepEntityId)
      .single();

    if (keepError || !keepEntity) {
      return NextResponse.json({ 
        error: 'Keep entity not found' 
      }, { status: 404 });
    }

    // Update all contracts that reference the entities to be merged
    const { error: contractsError } = await supabase
      .from('contracts')
      .update({ procuring_entity_id: keepEntityId })
      .in('procuring_entity_id', mergeEntityIds);

    if (contractsError) {
      console.error('Error updating contracts:', contractsError);
      return NextResponse.json({ 
        error: 'Failed to update contracts', 
        details: contractsError 
      }, { status: 500 });
    }

    // Update contracts that reference the entity names (text matching)
    for (const mergeId of mergeEntityIds) {
      const { data: mergeEntity } = await supabase
        .from('procuring_entities')
        .select('entity_name')
        .eq('id', mergeId)
        .single();

      if (mergeEntity?.entity_name) {
        await supabase
          .from('contracts')
          .update({ 
            procuring_entity_id: keepEntityId,
            procuring_entity: keepEntity.entity_name 
          })
          .eq('procuring_entity', mergeEntity.entity_name);
      }
    }

    // Delete the duplicate entities
    const { error: deleteError } = await supabase
      .from('procuring_entities')
      .delete()
      .in('id', mergeEntityIds);

    if (deleteError) {
      console.error('Error deleting duplicate entities:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete duplicate entities', 
        details: deleteError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully merged ${mergeEntityIds.length} entities into ${keepEntity.entity_name}`,
      merged_count: mergeEntityIds.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
