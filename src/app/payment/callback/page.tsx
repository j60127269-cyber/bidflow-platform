'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { flutterwaveService } from '@/lib/flutterwaveService';
import { subscriptionService } from '@/lib/subscriptionService';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

function PaymentCallbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get parameters from URL
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        const txRef = searchParams.get('tx_ref');

        if (!transactionId) {
          setStatus('error');
          setMessage('No transaction ID found in callback');
          return;
        }

        setTransactionId(transactionId);

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
            setStatus('error');
            setMessage('Payment record not found');
            return;
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

            setStatus('success');
            setMessage('Payment successful! Your subscription has been activated.');
          } else {
            setStatus('error');
            setMessage('Payment was not successful. Please try again.');
          }
        } else {
          setStatus('error');
          setMessage(verificationResponse.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment. Please contact support.');
      }
    };

    if (user) {
      handlePaymentCallback();
    }
  }, [searchParams, user]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    router.push('/onboarding/subscription');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Processing Payment
              </h2>
              <p className="text-slate-600 mb-6">
                Please wait while we verify your payment...
              </p>
              {transactionId && (
                <p className="text-sm text-slate-500">
                  Transaction ID: {transactionId}
                </p>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-slate-600 mb-6">
                {message}
              </p>
              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Continue to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-slate-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleContinue}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@bidflow.com" className="text-blue-600 hover:text-blue-500">
              support@bidflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCallbackForm />
    </Suspense>
  );
}
