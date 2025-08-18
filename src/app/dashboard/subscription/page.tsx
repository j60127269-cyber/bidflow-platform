'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, AlertCircle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/hooks/usePayment";
import { subscriptionService } from "@/lib/subscriptionService";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { paymentState, initializePayment, resetPaymentState } = usePayment();
  
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        const status = await subscriptionService.getUserSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  const handleSubscribe = async () => {
    setLoading(true);
    resetPaymentState();
    
    try {
      await initializePayment('Professional');
    } catch (error) {
      console.error('Payment initialization error:', error);
      setLoading(false);
    }
  };



  if (!subscriptionStatus) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription Management</h1>
          <p className="text-slate-600">Manage your BidCloud subscription and billing</p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Current Status</h2>
          


          {subscriptionStatus.status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-slate-900">Active Subscription</h3>
              </div>
              <div className="space-y-2 text-slate-700 mb-6">
                <p><strong>Plan:</strong> {subscriptionStatus.planName}</p>
                <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Active</span></p>
                {subscriptionStatus.subscriptionEndsAt && (
                  <p><strong>Next billing:</strong> {new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}</p>
                )}
                <p><strong>Amount:</strong> 50,000 UGX/month</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.open('mailto:support@bidflow.ug?subject=Subscription Management', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                </button>
                <button
                  onClick={() => window.open('mailto:support@bidflow.ug?subject=Cancel Subscription', '_blank')}
                  className="bg-white hover:bg-gray-50 text-red-600 border border-red-600 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}

          {(subscriptionStatus.status === 'none' || subscriptionStatus.status === 'expired') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {subscriptionStatus.status === 'expired' ? 'Subscription Expired' : 'No Active Subscription'}
                </h3>
              </div>
              <div className="space-y-2 text-slate-700 mb-6">
                {subscriptionStatus.status === 'expired' ? (
                  <p>Your subscription has expired. Renew to continue accessing all premium features.</p>
                ) : (
                  <p>You don't have an active subscription. Subscribe to access all premium features.</p>
                )}
                <p><strong>Professional Plan:</strong> 50,000 UGX/month</p>
                <p><strong>Features:</strong> Unlimited access to all BidCloud features</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || paymentState.loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading || paymentState.loading ? 'Processing...' : (subscriptionStatus.status === 'expired' ? 'Renew Subscription' : 'Subscribe Now')}
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue with Limited Access
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Billing Information */}
        {subscriptionStatus.status === 'active' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Billing Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-slate-600 mr-3" />
                    <span className="text-slate-700">Mobile Money / Card Payment</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Via Flutterwave</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing Cycle</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700"><strong>Frequency:</strong> Monthly</p>
                  <p className="text-slate-700"><strong>Amount:</strong> 50,000 UGX</p>
                  <p className="text-slate-700"><strong>Currency:</strong> UGX</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Professional Plan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Unlimited tender alerts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Advanced search & filtering</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Unlimited saved tenders</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>1GB document storage</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Real-time notifications</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Bid tracking & analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>AI-powered recommendations</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Pricing</h3>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">50,000 UGX</div>
                  <div className="text-slate-600 mb-4">per month</div>
                  <div className="text-sm text-slate-500">
                    <p>• Immediate access</p>
                    <p>• Cancel anytime</p>
                    <p>• No setup fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {paymentState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600 text-sm">{paymentState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
