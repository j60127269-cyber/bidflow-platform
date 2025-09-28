import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Test individual database tables
 */
export async function GET() {
  try {
    const results = {};
    
    // Test 1: user_profiles table
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .limit(1);
      
      results.user_profiles = {
        success: !profilesError,
        error: profilesError?.message,
        count: profiles?.length || 0
      };
    } catch (error) {
      results.user_profiles = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test 2: user_notification_preferences table
    try {
      const { data: prefs, error: prefsError } = await supabase
        .from('user_notification_preferences')
        .select('user_id, daily_digest_enabled')
        .limit(1);
      
      results.user_notification_preferences = {
        success: !prefsError,
        error: prefsError?.message,
        count: prefs?.length || 0
      };
    } catch (error) {
      results.user_notification_preferences = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test 3: contracts table
    try {
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id, title')
        .limit(1);
      
      results.contracts = {
        success: !contractsError,
        error: contractsError?.message,
        count: contracts?.length || 0
      };
    } catch (error) {
      results.contracts = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database table tests completed',
      results
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Table test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
