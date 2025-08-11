import { NextRequest, NextResponse } from 'next/server';
import { flutterwaveService } from '@/lib/flutterwaveService';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (you should implement this for security)
    // const signature = request.headers.get('verif-hash');
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const { event, data } = body;

    // Handle different webhook events
    switch (event) {
      case 'charge.completed':
        await handlePaymentSuccess(data);
        break;
      
      case 'charge.failed':
        await handlePaymentFailed(data);
        break;
      
      case 'transfer.completed':
        await handleTransferCompleted(data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    const { tx_ref, transaction_id, status, amount, currency, customer } = data;

    // Find payment record by reference
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('flutterwave_reference', tx_ref)
      .single();

    if (paymentError || !payment) {
      console.error('Payment record not found for webhook:', paymentError);
      return;
    }

    // Update payment status
    await flutterwaveService.updatePaymentStatus(
      payment.id,
      status === 'successful' ? 'successful' : 'failed',
      transaction_id.toString()
    );

    // If payment is successful, create or update subscription
    if (status === 'successful') {
      // Check if user already has an active subscription
      const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', payment.user_id)
        .eq('status', 'active')
        .single();

      if (subscriptionError && subscriptionError.code === 'PGRST116') {
        // Create new subscription
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        await flutterwaveService.createSubscriptionRecord({
          user_id: payment.user_id,
          plan_id: payment.plan_id,
          status: 'active',
          current_period_end: currentPeriodEnd.toISOString(),
        });

        console.log(`Created new subscription for user ${payment.user_id}`);
      } else if (existingSubscription) {
        // Update existing subscription
        const newPeriodEnd = new Date();
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

        await supabase
          .from('subscriptions')
          .update({
            current_period_end: newPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubscription.id);

        console.log(`Updated subscription for user ${payment.user_id}`);
      }

      // Create notification for successful payment
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'Payment Successful',
          message: `Your subscription payment of ${amount} ${currency} has been processed successfully.`,
          type: 'success',
        });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const { tx_ref, transaction_id, status, amount, currency, customer } = data;

    // Find payment record by reference
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('flutterwave_reference', tx_ref)
      .single();

    if (paymentError || !payment) {
      console.error('Payment record not found for webhook:', paymentError);
      return;
    }

    // Update payment status
    await flutterwaveService.updatePaymentStatus(
      payment.id,
      'failed',
      transaction_id.toString()
    );

    // Create notification for failed payment
    await supabase
      .from('notifications')
      .insert({
        user_id: payment.user_id,
        title: 'Payment Failed',
        message: `Your subscription payment of ${amount} ${currency} has failed. Please try again.`,
        type: 'error',
      });
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleTransferCompleted(data: any) {
  try {
    const { reference, amount, currency, status } = data;

    console.log(`Transfer completed: ${reference} - ${amount} ${currency} - ${status}`);
    
    // Handle transfer completion if needed
    // This could be for refunds or other transfer operations
  } catch (error) {
    console.error('Error handling transfer completion:', error);
  }
}

// Helper function to verify webhook signature (implement for security)
function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // Implement signature verification using your Flutterwave secret key
  // This is important for security to ensure webhooks are from Flutterwave
  return true; // Placeholder - implement proper verification
}
