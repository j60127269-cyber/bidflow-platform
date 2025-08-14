import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Find all expired subscriptions
    const { data: expiredSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('user_id, id')
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString());

    if (error) {
      console.error('Error fetching expired subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch expired subscriptions' }, { status: 500 });
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No expired subscriptions found',
        count: 0 
      });
    }

    // Update expired subscriptions to 'expired' status
    const userIds = [...new Set(expiredSubscriptions.map(sub => sub.user_id))];
    
    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .in('id', expiredSubscriptions.map(sub => sub.id));

    if (updateError) {
      console.error('Error updating expired subscriptions:', updateError);
      return NextResponse.json({ error: 'Failed to update expired subscriptions' }, { status: 500 });
    }

    // Update user profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'expired' })
      .in('id', userIds);

    if (profileError) {
      console.error('Error updating user profiles:', profileError);
      // Don't fail the entire operation for profile updates
    }

    console.log(`Updated ${expiredSubscriptions.length} expired subscription(s) for ${userIds.length} user(s)`);

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${expiredSubscriptions.length} expired subscriptions`,
      count: expiredSubscriptions.length,
      userIds
    });

  } catch (error) {
    console.error('Error in check-expired subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also allow GET for manual testing
export async function GET() {
  return POST(new NextRequest('http://localhost'));
}
