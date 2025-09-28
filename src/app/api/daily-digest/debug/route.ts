import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Debug endpoint to test daily digest components
 */
export async function GET() {
  try {
    console.log('Daily digest debug started');
    
    // Test 1: Check if user_notification_preferences table exists
    const { data: prefs, error: prefsError } = await supabase
      .from('user_notification_preferences')
      .select('user_id, daily_digest_enabled')
      .limit(1);
    
    if (prefsError) {
      console.error('Error fetching user preferences:', prefsError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: prefsError.message
      }, { status: 500 });
    }
    
    // Test 2: Check if user_profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1);
    
    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: profilesError.message
      }, { status: 500 });
    }
    
    // Test 3: Check if contracts table exists
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, title')
      .limit(1);
    
    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: contractsError.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All database tables accessible',
      data: {
        user_preferences_count: prefs?.length || 0,
        user_profiles_count: profiles?.length || 0,
        contracts_count: contracts?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error in daily digest debug:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
