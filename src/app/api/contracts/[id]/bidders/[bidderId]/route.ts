import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT /api/contracts/[id]/bidders/[bidderId] - Update a bidder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidderId: string }> }
) {
  try {
    const { id, bidderId } = await params;
    const body = await request.json();

    // Prepare updated bidder data
    const updateData = {
      company_name: body.company_name,
      bid_amount: body.bid_amount ? parseFloat(body.bid_amount) : null,
      currency: body.currency,
      rank: body.rank ? parseInt(body.rank) : null,
      bid_status: body.bid_status,
      evaluation_stage: body.evaluation_stage,
      evaluation_result: body.evaluation_result,
      technical_score: body.technical_score ? parseFloat(body.technical_score) : null,
      financial_score: body.financial_score ? parseFloat(body.financial_score) : null,
      total_score: body.total_score ? parseFloat(body.total_score) : null,
      reason_for_failure: body.reason_for_failure,
      preliminary_evaluation: body.preliminary_evaluation,
      detailed_evaluation: body.detailed_evaluation,
      financial_evaluation: body.financial_evaluation,
      evaluation_date: body.evaluation_date,
      contact_person: body.contact_person,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      company_registration_number: body.company_registration_number,
      is_winner: body.is_winner,
      is_runner_up: body.is_runner_up,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    };

    // Update the bidder
    const { data, error } = await supabase
      .from('contract_bidders')
      .update(updateData)
      .eq('id', bidderId)
      .eq('contract_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bidder:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bidder: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contracts/[id]/bidders/[bidderId] - Delete a bidder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bidderId: string }> }
) {
  try {
    const { id, bidderId } = await params;

    // Delete the bidder
    const { error } = await supabase
      .from('contract_bidders')
      .delete()
      .eq('id', bidderId)
      .eq('contract_id', id);

    if (error) {
      console.error('Error deleting bidder:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Bidder deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
