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

  const getTrialDaysRemaining = (trialEndsAt: string) => {
    const endDate = new Date(trialEndsAt);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
          <p className="text-slate-600">Manage your BidFlow subscription and billing</p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Current Status</h2>
          
          {subscriptionStatus.status === 'trial' && subscriptionStatus.trialEndsAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-slate-900">Free Trial Active</h3>
              </div>
              <div className="space-y-2 text-slate-700">
                <p><strong>Trial ends:</strong> {new Date(subscriptionStatus.trialEndsAt).toLocaleDateString()}</p>
                <p><strong>Days remaining:</strong> {getTrialDaysRemaining(subscriptionStatus.trialEndsAt)} days</p>
                <p><strong>After trial:</strong> 20,000 UGX/month</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || paymentState.loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading || paymentState.loading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          )}

          {subscriptionStatus.status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-slate-900">Active Subscription</h3>
              </div>
              <div className="space-y-2 text-slate-700">
                <p><strong>Plan:</strong> {subscriptionStatus.planName}</p>
                <p><strong>Status:</strong> Active</p>
                {subscriptionStatus.subscriptionEndsAt && (
                  <p><strong>Next billing:</strong> {new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          {subscriptionStatus.status === 'none' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-slate-900">No Active Subscription</h3>
              </div>
              <p className="text-slate-700 mb-4">You don't have an active subscription. Start a free trial to access all features.</p>
              <button
                onClick={handleSubscribe}
                disabled={loading || paymentState.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading || paymentState.loading ? 'Processing...' : 'Start Free Trial'}
              </button>
            </div>
          )}
        </div>

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
                  <div className="text-3xl font-bold text-slate-900 mb-2">20,000 UGX</div>
                  <div className="text-slate-600 mb-4">per month</div>
                  <div className="text-sm text-slate-500">
                    <p>• 7-day free trial</p>
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
