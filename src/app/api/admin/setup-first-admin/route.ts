import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, role = 'admin' } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // First, check if the user exists in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (authError || !authUser.user) {
      return NextResponse.json({ 
        error: 'User not found in authentication system' 
      }, { status: 404 });
    }

    // Check if user already has a profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking existing profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to check existing profile' 
      }, { status: 500 });
    }

    if (existingProfile) {
      // Update existing profile with admin role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update user role' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `User ${email} has been granted ${role} privileges`,
        action: 'updated'
      });
    } else {
      // Create new profile with admin role
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          email: authUser.user.email,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return NextResponse.json({ 
          error: 'Failed to create user profile' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `User ${email} has been created with ${role} privileges`,
        action: 'created'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
