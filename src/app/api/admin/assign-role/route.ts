import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ 
        error: 'User ID and role are required' 
      }, { status: 400 });
    }

    // Update the user's role in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ 
        error: 'Failed to update user role' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Role '${role}' assigned successfully to user ${userId}` 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
