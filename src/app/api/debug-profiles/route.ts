import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== DEBUGGING PROFILES TABLE ===');
    
    // Try different ways to query the profiles table
    console.log('1. Basic select from profiles...');
    const { data: basicData, error: basicError } = await supabase
      .from('profiles')
      .select('*');

    console.log('Basic query result:', {
      error: basicError,
      dataLength: basicData?.length,
      sampleData: basicData?.slice(0, 2)
    });

    // Try with specific columns
    console.log('2. Select specific columns...');
    const { data: specificData, error: specificError } = await supabase
      .from('profiles')
      .select('id, email, industry_preferences, contract_type_preferences, preferred_categories');

    console.log('Specific columns query:', {
      error: specificError,
      dataLength: specificData?.length,
      sampleData: specificData?.slice(0, 2)
    });

    // Try with count
    console.log('3. Count query...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    console.log('Count query:', {
      error: countError,
      count: count
    });

    // Try to get just one user
    console.log('4. Single user query...');
    const { data: singleUser, error: singleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    console.log('Single user query:', {
      error: singleError,
      data: singleUser
    });

    return NextResponse.json({
      success: true,
      message: 'Profiles table debugging completed',
      results: {
        basicQuery: {
          error: basicError?.message,
          dataLength: basicData?.length,
          sampleData: basicData?.slice(0, 2)
        },
        specificQuery: {
          error: specificError?.message,
          dataLength: specificData?.length,
          sampleData: specificData?.slice(0, 2)
        },
        countQuery: {
          error: countError?.message,
          count: count
        },
        singleUserQuery: {
          error: singleError?.message,
          data: singleUser
        }
      }
    });

  } catch (error) {
    console.error('Error in debug-profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
