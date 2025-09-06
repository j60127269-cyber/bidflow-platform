'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, AlertCircle, Zap, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/hooks/usePayment";
import { subscriptionService } from "@/lib/subscriptionService";

const features = [
  "Unlimited tender alerts",
  "Advanced search & filtering", 
  "Unlimited saved tenders",
  "Email support",
  "Real-time notifications",
  "Bid tracking & ai analytics",
  "AI-powered recommendations"
];

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

  // If user has active subscription, show management view
  if (subscriptionStatus.status === 'active') {
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
          </div>

          {/* Billing Information */}
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
        </div>
      </div>
    );
  }

  // For users without active subscription, show minimal subscription card
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Upgrade to Professional</h1>
          <p className="text-slate-600">Get unlimited access to all BidCloud features</p>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          {/* Plan Title & Price */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-slate-900">50,000</span>
              <span className="text-slate-600"> UGX</span>
              <span className="text-slate-500">/month</span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="mb-6 p-3 bg-slate-50 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">Secure Payment Methods</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center text-slate-600">
                <CreditCard className="w-3 h-3 mr-1" />
                <span className="text-xs">Cards</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Zap className="w-3 h-3 mr-1" />
                <span className="text-xs">Mobile Money</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading || paymentState.loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading || paymentState.loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>

          {/* Error Message */}
          {paymentState.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{paymentState.error}</p>
            </div>
          )}

          {/* Subscription Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Cancel anytime • Secure payment via Flutterwave
            </p>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-500 hover:text-slate-700 text-sm underline"
          >
            Continue with limited access
          </button>
        </div>
      </div>
    </div>
  );
}
