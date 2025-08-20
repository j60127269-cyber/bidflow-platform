import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      return NextResponse.json({ 
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable',
        status: 'missing_env'
      }, { status: 500 });
    }

    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable',
        status: 'missing_env'
      }, { status: 500 });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: testError.message,
        status: 'db_error'
      }, { status: 500 });
    }

    // Check if role column exists
    const { data: columnCheck, error: columnError } = await supabase
      .rpc('add_role_column_if_not_exists');

    if (columnError) {
      return NextResponse.json({ 
        error: 'Role column setup failed',
        details: columnError.message,
        status: 'column_error'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Environment and database connection are working correctly',
      status: 'ready'
    });

  } catch (error) {
    console.error('Test setup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during test',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'internal_error'
    }, { status: 500 });
  }
}
