import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Check what tables exist in the database
 */
export async function GET() {
  try {
    // Try to get a list of all tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch table list',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Available tables in database',
      tables: data?.map(t => t.table_name) || []
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Table check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
