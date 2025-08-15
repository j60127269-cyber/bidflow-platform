import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Add role column to profiles table if it doesn't exist
    const { error } = await supabase.rpc('add_role_column_if_not_exists');
    
    if (error) {
      console.error('Error adding role column:', error);
      return NextResponse.json({ error: 'Failed to add role column' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Role field added successfully to profiles table' 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
