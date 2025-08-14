import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, subscription_status, subscription_id, created_at, updated_at')
      .eq('id', userId)
      .single();

    // Check subscriptions table
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    // Check payments table
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      profile: {
        data: profile,
        error: profileError
      },
      subscriptions: {
        data: subscriptions,
        error: subscriptionsError
      },
      payments: {
        data: payments,
        error: paymentsError
      }
    });
  } catch (error) {
    console.error('Debug subscription error:', error);
    return NextResponse.json({ error: 'Debug failed', details: error }, { status: 500 });
  }
}
