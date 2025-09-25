import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, fetch the contract without the join
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      return NextResponse.json({ 
        error: 'Contract not found', 
        details: error 
      }, { status: 404 });
    }

    // If the contract has an awarded_company_id, fetch the awardee name separately
    let awardedCompanyName = null;
    if (contract.awarded_company_id) {
      const { data: awardee, error: awardeeError } = await supabase
        .from('awardees')
        .select('company_name')
        .eq('id', contract.awarded_company_id)
        .single();

      if (!awardeeError && awardee) {
        awardedCompanyName = awardee.company_name;
      }
    }

    // Transform the data to include awardee company name and map field names
    const transformedContract = {
      ...contract,
      // Map database fields to expected frontend fields
      estimated_value: contract.awarded_value || contract.estimated_value_max || 0,
      award_date: contract.award_date || contract.updated_at,
      awarded_company_name: awardedCompanyName || contract.awarded_to || null,
      procuring_entity: contract.procuring_entity?.trim() || 'BidFlow Platform'
    };

    return NextResponse.json({
      success: true,
      contract: transformedContract
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Sanitize payload: convert empty strings to null to avoid numeric/date cast errors
    const sanitizeInput = (value: any): any => {
      if (value === '') return null;
      if (typeof value === 'string' && value.trim() === '') return null;
      if (Array.isArray(value)) return value.map(sanitizeInput);
      if (value && typeof value === 'object') {
        const sanitizedObject: Record<string, any> = {};
        for (const [key, val] of Object.entries(value)) {
          sanitizedObject[key] = sanitizeInput(val);
        }
        return sanitizedObject;
      }
      return value;
    };
    
    // Process bid_attachments to store file objects as JSON strings
    const processedBody = {
      ...body,
      bid_attachments: body.bid_attachments ? body.bid_attachments.map((file: any) => JSON.stringify(file)) : []
    };

    const sanitizedBody = sanitizeInput(processedBody);
    
    const { data, error } = await supabase
      .from('contracts')
      .update(sanitizedBody)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
