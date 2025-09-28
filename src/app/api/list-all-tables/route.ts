import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== LISTING ALL TABLES ===');
    
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');

    console.log('All tables:', tables);

    // Try to find any table that might contain user data
    const possibleUserTables = ['profiles', 'users', 'user_profiles', 'accounts', 'auth.users'];
    const tableChecks = {};

    for (const tableName of possibleUserTables) {
      try {
        if (tableName === 'auth.users') {
          // Special handling for auth.users
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          tableChecks[tableName] = {
            exists: true,
            error: authError?.message,
            count: authData?.users?.length || 0,
            sampleData: authData?.users?.slice(0, 2)
          };
        } else {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(2);
          
          tableChecks[tableName] = {
            exists: !error,
            error: error?.message,
            count: count,
            sampleData: data
          };
        }
      } catch (err) {
        tableChecks[tableName] = {
          exists: false,
          error: err.message,
          count: 0,
          sampleData: []
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All tables listed',
      allTables: tables,
      userTableChecks: tableChecks
    });

  } catch (error) {
    console.error('Error in list-all-tables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
