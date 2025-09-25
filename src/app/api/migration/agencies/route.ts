import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'extract_agencies') {
      return await extractAgencies();
    } else if (action === 'create_entities') {
      const { agencies } = await request.json();
      return await createEntities(agencies);
    } else if (action === 'update_contracts') {
      const { entities } = await request.json();
      return await updateContracts(entities);
    } else if (action === 'verify_migration') {
      return await verifyMigration();
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}

async function extractAgencies() {
  try {
    // Extract unique agencies from contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('procuring_entity')
      .not('procuring_entity', 'is', null);

    if (contractsError) {
      throw new Error(`Failed to fetch contracts: ${contractsError.message}`);
    }

    const uniqueAgencies = [...new Set(contracts?.map(c => c.procuring_entity).filter(Boolean))] || [];
    
    // Clean and standardize agency names
    const cleanedAgencies = uniqueAgencies.map(agency => ({
      original: agency,
      cleaned: agency.trim().replace(/\s+/g, ' '),
      entity_type: determineEntityType(agency),
      is_active: true,
      data_source: 'migration',
      source_file: 'contracts_extraction'
    }));

    return NextResponse.json({
      success: true,
      totalAgencies: uniqueAgencies.length,
      agencies: cleanedAgencies
    });

  } catch (error) {
    console.error('Error extracting agencies:', error);
    return NextResponse.json({ 
      error: 'Failed to extract agencies', 
      details: error 
    }, { status: 500 });
  }
}

async function createEntities(agencies: any[]) {
  try {
    const entitiesToCreate = agencies.map(agency => ({
      entity_name: agency.cleaned,
      entity_type: agency.entity_type,
      is_active: agency.is_active,
      data_source: agency.data_source,
      source_file: agency.source_file
    }));

    const { data: createdEntities, error: createError } = await supabase
      .from('procuring_entities')
      .insert(entitiesToCreate)
      .select();

    if (createError) {
      throw new Error(`Failed to create entities: ${createError.message}`);
    }

    return NextResponse.json({
      success: true,
      createdCount: createdEntities?.length || 0,
      entities: createdEntities
    });

  } catch (error) {
    console.error('Error creating entities:', error);
    return NextResponse.json({ 
      error: 'Failed to create entities', 
      details: error 
    }, { status: 500 });
  }
}

async function updateContracts(entities: any[]) {
  try {
    let updatedCount = 0;
    const errors = [];

    for (const entity of entities) {
      try {
        const { error: updateError } = await supabase
          .from('contracts')
          .update({ procuring_entity_id: entity.id })
          .eq('procuring_entity', entity.entity_name);

        if (updateError) {
          errors.push({
            entity: entity.entity_name,
            error: updateError.message
          });
        } else {
          updatedCount++;
        }
      } catch (error) {
        errors.push({
          entity: entity.entity_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      errors
    });

  } catch (error) {
    console.error('Error updating contracts:', error);
    return NextResponse.json({ 
      error: 'Failed to update contracts', 
      details: error 
    }, { status: 500 });
  }
}

async function verifyMigration() {
  try {
    // Check contracts with foreign keys
    const { data: contractsWithKeys, error: keysError } = await supabase
      .from('contracts')
      .select('id, procuring_entity, procuring_entity_id')
      .not('procuring_entity', 'is', null);

    if (keysError) {
      throw new Error(`Failed to verify contracts: ${keysError.message}`);
    }

    const contractsWithForeignKeys = contractsWithKeys?.filter(c => c.procuring_entity_id) || [];
    const contractsWithoutForeignKeys = contractsWithKeys?.filter(c => !c.procuring_entity_id) || [];

    // Check procuring entities
    const { data: entities, error: entitiesError } = await supabase
      .from('procuring_entities')
      .select('id, entity_name, entity_type, is_active');

    if (entitiesError) {
      throw new Error(`Failed to verify entities: ${entitiesError.message}`);
    }

    return NextResponse.json({
      success: true,
      contractsWithForeignKeys: contractsWithForeignKeys.length,
      contractsWithoutForeignKeys: contractsWithoutForeignKeys.length,
      totalEntities: entities?.length || 0,
      activeEntities: entities?.filter(e => e.is_active).length || 0,
      contracts: contractsWithForeignKeys,
      entities: entities
    });

  } catch (error) {
    console.error('Error verifying migration:', error);
    return NextResponse.json({ 
      error: 'Failed to verify migration', 
      details: error 
    }, { status: 500 });
  }
}

function determineEntityType(agencyName: string): string {
  const name = agencyName.toLowerCase();
  
  if (name.includes('ministry')) return 'ministry';
  if (name.includes('department')) return 'department';
  if (name.includes('agency')) return 'agency';
  if (name.includes('authority')) return 'authority';
  if (name.includes('commission')) return 'commission';
  if (name.includes('corporation')) return 'corporation';
  if (name.includes('board')) return 'board';
  if (name.includes('council')) return 'council';
  if (name.includes('office')) return 'office';
  if (name.includes('bureau')) return 'bureau';
  
  return 'government_entity';
}
