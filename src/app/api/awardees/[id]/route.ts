import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/awardees/[id] - Get a specific awardee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: awardee, error } = await supabase
      .from('awardees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching awardee:', error);
      return NextResponse.json({ 
        error: 'Awardee not found', 
        details: error 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      awardee
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}

// PUT /api/awardees/[id] - Update a specific awardee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.company_name) {
      return NextResponse.json({ 
        error: 'Company name is required' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData = {
      company_name: body.company_name,
      registration_number: body.registration_number || null,
      business_type: body.business_type || null,
      female_owned: body.female_owned || false,
      primary_categories: body.primary_categories || [],
      locations: body.locations || [],
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      website: body.website || null,
      address: body.address || null,
      description: body.description || null,
      updated_at: new Date().toISOString()
    };

    const { data: awardee, error } = await supabase
      .from('awardees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating awardee:', error);
      return NextResponse.json({ 
        error: 'Failed to update awardee', 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      awardee
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}

// DELETE /api/awardees/[id] - Delete a specific awardee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if awardee exists
    const { data: existingAwardee, error: fetchError } = await supabase
      .from('awardees')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingAwardee) {
      return NextResponse.json({ 
        error: 'Awardee not found' 
      }, { status: 404 });
    }

    // Check if awardee is referenced in contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, reference_number')
      .eq('awarded_company_id', id);

    if (contractsError) {
      console.error('Error checking contract references:', contractsError);
      return NextResponse.json({ 
        error: 'Failed to check contract references', 
        details: contractsError 
      }, { status: 500 });
    }

    if (contracts && contracts.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete awardee. It is referenced by ${contracts.length} contract(s): ${contracts.map(c => c.reference_number).join(', ')}` 
      }, { status: 400 });
    }

    // Delete the awardee
    const { error } = await supabase
      .from('awardees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting awardee:', error);
      return NextResponse.json({ 
        error: 'Failed to delete awardee', 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Awardee deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
