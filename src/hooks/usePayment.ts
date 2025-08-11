import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { flutterwaveService } from '@/lib/flutterwaveService';
import { subscriptionService } from '@/lib/subscriptionService';
import { FlutterwavePaymentData } from '@/lib/flutterwaveService';
import { supabase } from '@/lib/supabase';

interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UsePaymentReturn {
  paymentState: PaymentState;
  initializePayment: (planName: string) => Promise<void>;
  verifyPayment: (transactionId: string) => Promise<boolean>;
  resetPaymentState: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const { user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
  });

  const resetPaymentState = useCallback(() => {
    setPaymentState({
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const initializePayment = useCallback(async (planName: string) => {
    if (!user) {
      setPaymentState({
        loading: false,
        error: 'User not authenticated',
        success: false,
      });
      return;
    }

    setPaymentState({
      loading: true,
      error: null,
      success: false,
    });

    try {
      // Get subscription plan
      const plan = await subscriptionService.getSubscriptionPlan(planName);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef();

      // Create payment record in database
      const paymentRecord = await flutterwaveService.savePaymentRecord({
        user_id: user.id,
        plan_id: plan.id,
        amount: plan.price,
        currency: plan.currency,
        flutterwave_reference: txRef,
        status: 'pending',
        metadata: {
          plan_name: plan.name,
          billing_interval: plan.billing_interval,
        },
      });

      // Prepare payment data for Flutterwave
      const paymentData: FlutterwavePaymentData = {
        tx_ref: txRef,
        amount: plan.price,
        currency: plan.currency,
        redirect_url: `${window.location.origin}/payment/callback?payment_id=${paymentRecord.id}`,
        customer: {
          email: user.email || '',
          name: user.user_metadata?.company || user.email || 'BidFlow User',
        },
        customizations: {
          title: 'BidFlow Subscription',
          description: `Subscribe to ${plan.name} plan`,
          logo: `${window.location.origin}/logo.png`,
        },
        meta: {
          plan_id: plan.id,
          user_id: user.id,
          subscription_type: plan.billing_interval,
        },
      };

      // Initialize payment with Flutterwave
      const response = await flutterwaveService.initializePayment(paymentData);

      if (response.status === 'success' && response.data?.link) {
        // Redirect to Flutterwave payment page
        window.location.href = response.data.link;
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentState({
        loading: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed',
        success: false,
      });
    }
  }, [user]);

  const verifyPayment = useCallback(async (transactionId: string): Promise<boolean> => {
    setPaymentState({
      loading: true,
      error: null,
      success: false,
    });

    try {
      // Verify payment with Flutterwave
      const verificationResponse = await flutterwaveService.verifyPayment(transactionId);

      if (verificationResponse.status === 'success' && verificationResponse.data) {
        const paymentData = verificationResponse.data;

        // Find payment record by transaction reference
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('flutterwave_reference', paymentData.tx_ref)
          .single();

        if (paymentError || !payment) {
          throw new Error('Payment record not found');
        }

        // Update payment status
        await flutterwaveService.updatePaymentStatus(
          payment.id,
          paymentData.status === 'successful' ? 'successful' : 'failed',
          paymentData.id.toString()
        );

        if (paymentData.status === 'successful') {
          // Create subscription if payment is successful
          const currentPeriodEnd = new Date();
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

          await subscriptionService.createSubscription({
            user_id: payment.user_id,
            plan_id: payment.plan_id,
            status: 'active',
            current_period_end: currentPeriodEnd.toISOString(),
          });

          setPaymentState({
            loading: false,
            error: null,
            success: true,
          });

          return true;
        } else {
          throw new Error('Payment was not successful');
        }
      } else {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentState({
        loading: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
        success: false,
      });
      return false;
    }
  }, []);

  return {
    paymentState,
    initializePayment,
    verifyPayment,
    resetPaymentState,
  };
};
