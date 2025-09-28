import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== CHECKING ALL USER-RELATED TABLES ===');
    
    // Check auth.users (Supabase auth table)
    const { data: authUsers, error: authError, count: authCount } = await supabase.auth.admin.listUsers();
    
    console.log('Auth users:', {
      error: authError,
      count: authUsers?.users?.length || 0
    });

    // Check if there are any user-related tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%user%');

    console.log('User-related tables:', tables);

    // Try to find users in any table
    const possibleUserTables = ['users', 'user_profiles', 'profiles', 'accounts'];
    const userData = {};

    for (const tableName of possibleUserTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(2);
        
        userData[tableName] = {
          error: error?.message,
          count: count,
          sampleData: data
        };
      } catch (err) {
        userData[tableName] = {
          error: 'Table does not exist',
          count: 0,
          sampleData: []
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All user tables checked',
      authUsers: {
        count: authUsers?.users?.length || 0,
        sampleUsers: authUsers?.users?.slice(0, 2).map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at
        }))
      },
      userTables: userData
    });

  } catch (error) {
    console.error('Error in check-all-tables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
