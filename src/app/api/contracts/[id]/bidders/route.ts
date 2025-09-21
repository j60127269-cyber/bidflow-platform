import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/contracts/[id]/bidders - Get all bidders for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get bidders for the contract, ordered by rank
    const { data: bidders, error } = await supabase
      .from('contract_bidders')
      .select('*')
      .eq('contract_id', id)
      .order('rank', { ascending: true, nullsLast: true })
      .order('bid_amount', { ascending: true });

    if (error) {
      console.error('Error fetching bidders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bidders });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/contracts/[id]/bidders - Add a new bidder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.company_name || !body.bid_amount) {
      return NextResponse.json(
        { error: 'Company name and bid amount are required' },
        { status: 400 }
      );
    }

    // Prepare bidder data
    const bidderData = {
      contract_id: id,
      company_name: body.company_name,
      bid_amount: parseFloat(body.bid_amount),
      currency: body.currency || 'UGX',
      rank: body.rank ? parseInt(body.rank) : null,
      bid_status: body.bid_status || 'submitted',
      evaluation_stage: body.evaluation_stage || null,
      evaluation_result: body.evaluation_result || null,
      technical_score: body.technical_score ? parseFloat(body.technical_score) : null,
      financial_score: body.financial_score ? parseFloat(body.financial_score) : null,
      total_score: body.total_score ? parseFloat(body.total_score) : null,
      reason_for_failure: body.reason_for_failure || null,
      preliminary_evaluation: body.preliminary_evaluation || null,
      detailed_evaluation: body.detailed_evaluation || null,
      financial_evaluation: body.financial_evaluation || null,
      evaluation_date: body.evaluation_date || null,
      contact_person: body.contact_person || null,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      company_registration_number: body.company_registration_number || null,
      is_winner: body.is_winner || false,
      is_runner_up: body.is_runner_up || false,
      notes: body.notes || null,
    };

    // Insert the bidder
    const { data, error } = await supabase
      .from('contract_bidders')
      .insert([bidderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating bidder:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bidder: data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
