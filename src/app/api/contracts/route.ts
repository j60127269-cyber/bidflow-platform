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

export async function GET() {
  try {
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch contracts', 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contracts: contracts || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
