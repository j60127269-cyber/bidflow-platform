import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ 
        error: 'No awardee IDs provided' 
      }, { status: 400 });
    }

    // Validate that all IDs are strings
    const invalidIds = ids.filter(id => typeof id !== 'string' || id.trim() === '');
    if (invalidIds.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid awardee IDs provided' 
      }, { status: 400 });
    }

    // First, check if any of the awardees have associated contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, title, awarded_company_id, awarded_to')
      .or(`awarded_company_id.in.(${ids.join(',')}),awarded_to.in.(${ids.map(id => `"${id}"`).join(',')})`);

    if (contractsError) {
      console.error('Error checking contracts:', contractsError);
      return NextResponse.json({ 
        error: 'Failed to check associated contracts', 
        details: contractsError 
      }, { status: 500 });
    }

    // If there are associated contracts, we need to handle them
    if (contracts && contracts.length > 0) {
      // Update contracts to remove the awardee association
      const contractIds = contracts.map(c => c.id);
      
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ 
          awarded_company_id: null,
          awarded_to: null,
          status: 'active' // Reset status to active
        })
        .in('id', contractIds);

      if (updateError) {
        console.error('Error updating contracts:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update associated contracts', 
          details: updateError 
        }, { status: 500 });
      }
    }

    // Delete the awardees
    const { data, error } = await supabase
      .from('awardees')
      .delete()
      .in('id', ids)
      .select('id, company_name');

    if (error) {
      console.error('Error deleting awardees:', error);
      return NextResponse.json({ 
        error: 'Failed to delete awardees', 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedCount: data?.length || 0,
      deletedAwardees: data?.map(awardee => ({
        id: awardee.id,
        company_name: awardee.company_name
      })) || [],
      updatedContracts: contracts?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
