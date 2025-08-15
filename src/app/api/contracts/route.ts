import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process bid_attachments to store file objects as JSON strings
    const processedBody = {
      ...body,
      bid_attachments: body.bid_attachments ? body.bid_attachments.map((file: any) => JSON.stringify(file)) : []
    };
    
    const { data, error } = await supabase
      .from('contracts')
      .insert(processedBody)
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
