import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Flutterwave webhook secret for verification
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('verif-hash');
    if (FLUTTERWAVE_WEBHOOK_SECRET && signature !== FLUTTERWAVE_WEBHOOK_SECRET) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const {
      tx_ref,
      transaction_id,
      status,
      amount,
      currency,
      customer: { email },
      meta
    } = body;

    console.log('Webhook received:', { tx_ref, transaction_id, status, amount, email });

    // Find payment record by reference
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('flutterwave_reference', tx_ref)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found for webhook:', paymentError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: status === 'successful' ? 'successful' : 'failed',
        flutterwave_transaction_id: transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    // If payment is successful, handle subscription
    if (status === 'successful') {
      // Check if user already has an active subscription
      const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', payment.user_id)
        .eq('status', 'active')
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', subscriptionError);
      }

      if (!existingSubscription) {
        // Create new subscription
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        const { error: createError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: payment.user_id,
            plan_id: payment.plan_id,
            status: 'active',
            current_period_end: currentPeriodEnd.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (createError) {
          console.error('Error creating subscription:', createError);
          return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
        }

        console.log('Subscription created successfully for user:', payment.user_id);
      } else {
        // Extend existing subscription
        const newEndDate = new Date(existingSubscription.current_period_end);
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        const { error: extendError } = await supabase
          .from('subscriptions')
          .update({
            current_period_end: newEndDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubscription.id);

        if (extendError) {
          console.error('Error extending subscription:', extendError);
          return NextResponse.json({ error: 'Failed to extend subscription' }, { status: 500 });
        }

        console.log('Subscription extended for user:', payment.user_id);
      }

      // Update user's subscription status in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      if (profileError) {
        console.error('Error updating profile subscription status:', profileError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
