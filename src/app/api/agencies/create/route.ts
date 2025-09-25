import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { entity_name, contact_person, contact_email, website, address, description } = await request.json();

    if (!entity_name) {
      return NextResponse.json({ 
        error: 'Entity name is required' 
      }, { status: 400 });
    }

    // Check if agency already exists
    const { data: existingAgency } = await supabase
      .from('procuring_entities')
      .select('id')
      .ilike('entity_name', entity_name)
      .single();

    if (existingAgency) {
      return NextResponse.json({
        success: true,
        agency: existingAgency,
        message: 'Agency already exists'
      });
    }

    // Create new agency
    const { data: newAgency, error: createError } = await supabase
      .from('procuring_entities')
      .insert({
        entity_name: entity_name.trim(),
        entity_type: 'government_entity',
        contact_person: contact_person?.trim() || null,
        contact_email: contact_email?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        country: 'Uganda',
        is_active: true,
        data_source: 'migration',
        source_file: 'contracts_extraction',
        description: description?.trim() || `Procuring entity responsible for ${entity_name}`
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating agency:', createError);
      return NextResponse.json({ 
        error: 'Failed to create agency', 
        details: createError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agency: newAgency
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
