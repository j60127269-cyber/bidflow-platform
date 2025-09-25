import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { entity_name, contact_person, contact_position } = await request.json();

    if (!entity_name) {
      return NextResponse.json({ 
        error: 'Entity name is required' 
      }, { status: 400 });
    }

    // First, try to find existing entity with exact match
    const { data: exactMatch } = await supabase
      .from('procuring_entities')
      .select('*')
      .ilike('entity_name', entity_name.trim())
      .single();

    if (exactMatch) {
      return NextResponse.json({
        success: true,
        entity: exactMatch,
        created: false,
        message: 'Found existing procuring entity'
      });
    }

    // If no exact match, try fuzzy search
    const { data: fuzzyMatches } = await supabase
      .from('procuring_entities')
      .select('*')
      .ilike('entity_name', `%${entity_name.trim()}%`);

    if (fuzzyMatches && fuzzyMatches.length > 0) {
      // Return the first fuzzy match
      return NextResponse.json({
        success: true,
        entity: fuzzyMatches[0],
        created: false,
        message: 'Found similar procuring entity'
      });
    }

    // If no match found, create new entity
    const { data: newEntity, error: createError } = await supabase
      .from('procuring_entities')
      .insert({
        entity_name: entity_name.trim(),
        entity_type: 'government_entity',
        contact_person: contact_person?.trim() || null,
        contact_email: contact_person ? `${contact_person.toLowerCase().replace(/\s+/g, '.')}@gov.ug` : null,
        website: null,
        address: null,
        country: 'Uganda',
        is_active: true,
        data_source: 'contract_creation',
        source_file: 'manual_entry',
        description: `Procuring entity responsible for ${entity_name}`
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating procuring entity:', createError);
      return NextResponse.json({ 
        error: 'Failed to create procuring entity', 
        details: createError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      entity: newEntity,
      created: true,
      message: 'Created new procuring entity'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
