import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database schema...');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable' },
        { status: 500 }
      );
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable' },
        { status: 500 }
      );
    }

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('contracts')
      .select('*')
      .limit(1);
    
    if (testError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: testError.message,
          hint: testError.hint,
          code: testError.code
        },
        { status: 500 }
      );
    }

    // Get table information by trying to select specific columns
    const testColumns = [
      'id',
      'reference_number',
      'title',
      'category',
      'procurement_method',
      'submission_deadline',
      'procuring_entity',
      'status',
      'current_stage',
      'awarded_value',
      'awarded_to',
      'created_at',
      'updated_at'
    ];

    const columnTest = await supabase
      .from('contracts')
      .select(testColumns.join(','))
      .limit(1);

    return NextResponse.json({
      success: true,
      connection: 'OK',
      tableExists: true,
      columns: testColumns,
      columnTest: {
        success: !columnTest.error,
        error: columnTest.error?.message,
        hint: columnTest.error?.hint,
        code: columnTest.error?.code
      },
      sampleData: testData
    });

  } catch (error) {
    console.error('Schema test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
