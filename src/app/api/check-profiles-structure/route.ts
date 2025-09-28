import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== CHECKING PROFILES TABLE STRUCTURE ===');
    
    // Check if profiles table has any data
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log('Profiles table check:', {
      error: profilesError,
      count: profilesCount,
      sampleData: profiles
    });

    // Check auth.users (this should have users if anyone has registered)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    console.log('Auth users check:', {
      error: authError,
      count: authUsers?.users?.length || 0,
      sampleUsers: authUsers?.users?.slice(0, 2).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at
      }))
    });

    // Check if there are any users in auth.users but not in profiles
    const authUserIds = authUsers?.users?.map(u => u.id) || [];
    const profileUserIds = profiles?.map(p => p.id) || [];
    
    const missingProfiles = authUserIds.filter(id => !profileUserIds.includes(id));
    
    console.log('Missing profiles:', {
      authUserCount: authUserIds.length,
      profileUserCount: profileUserIds.length,
      missingProfileIds: missingProfiles
    });

    return NextResponse.json({
      success: true,
      message: 'Profiles table structure checked',
      results: {
        profiles: {
          error: profilesError?.message,
          count: profilesCount,
          sampleData: profiles?.slice(0, 2)
        },
        authUsers: {
          error: authError?.message,
          count: authUsers?.users?.length || 0,
          sampleUsers: authUsers?.users?.slice(0, 2).map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at
          }))
        },
        missingProfiles: {
          count: missingProfiles.length,
          userIds: missingProfiles
        }
      }
    });

  } catch (error) {
    console.error('Error in check-profiles-structure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
