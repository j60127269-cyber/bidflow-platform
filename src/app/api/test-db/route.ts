import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Simple database test endpoint
 */
export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Simple test - just try to connect to Supabase
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: data
    });
    
  } catch (error) {
    console.error('Test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
