import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
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
      .insert(sanitizedBody)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Trigger preference-based notifications for the new contract
    if (data) {
      try {
        // Process notification asynchronously to avoid blocking the response
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/preference-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: data.id })
        }).catch(error => {
          console.error('Error triggering preference notifications:', error);
        });

        // Trigger AI processing webhook for the new contract
        if (process.env.N8N_WEBHOOK_URL) {
          fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': process.env.N8N_WEBHOOK_AUTH || ''
            },
            body: JSON.stringify({
              contractIds: [data.id]
            })
          }).catch(error => {
            console.error('Error triggering AI processing webhook:', error);
          });
        }
      } catch (error) {
        console.error('Error setting up notifications and AI processing:', error);
      }
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const awarded = searchParams.get('awarded');
    const agency = searchParams.get('agency');
    
    // First, fetch contracts without the join to avoid foreign key issues
    let query = supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by awarded status if requested
    if (awarded === 'true') {
      query = query.eq('status', 'awarded');
    }

    // Filter by agency if requested
    if (agency) {
      // Use ilike for case-insensitive search and handle whitespace
      query = query.ilike('procuring_entity', `%${agency.trim()}%`);
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error('Error fetching contracts:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch contracts', 
        details: error 
      }, { status: 500 });
    }

    // If we have contracts with awarded_company_id, fetch awardee names separately
    const contractsWithAwardees = contracts || [];
    const awardeeIds = contractsWithAwardees
      .map(c => c.awarded_company_id)
      .filter(Boolean);

    let awardeeMap = new Map();
    if (awardeeIds.length > 0) {
      const { data: awardees, error: awardeesError } = await supabase
        .from('awardees')
        .select('id, company_name')
        .in('id', awardeeIds);

      if (!awardeesError && awardees) {
        awardeeMap = new Map(awardees.map(a => [a.id, a.company_name]));
      }
    }

    // Transform the data to include awardee company name and map field names
    const transformedContracts = contractsWithAwardees.map(contract => ({
      ...contract,
      // Map database fields to expected frontend fields
      estimated_value: contract.awarded_value || contract.estimated_value_max || 0,
      award_date: contract.award_date || contract.updated_at,
      awarded_company_name: contract.awarded_company_id 
        ? awardeeMap.get(contract.awarded_company_id) || null 
        : contract.awarded_to || null,
      procuring_entity: contract.procuring_entity?.trim() || 'BidFlow Platform'
    }));

    return NextResponse.json({
      success: true,
      contracts: transformedContracts
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
