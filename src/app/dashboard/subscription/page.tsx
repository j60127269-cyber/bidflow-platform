'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, AlertCircle, Calendar, Zap, Shield, Star, TrendingUp, Users, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/hooks/usePayment";
import { subscriptionService } from "@/lib/subscriptionService";

const features = [
  "Unlimited tender alerts",
  "Advanced search & filtering", 
  "Unlimited saved tenders",
  "1GB document storage",
  "Email support",
  "Real-time notifications",
  "Bid tracking & analytics",
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

  // For users without active subscription, show enticing subscription card
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Upgrade to Professional
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Unlock the full potential of BidCloud with unlimited access to premium features and advanced bidding tools
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">40%</div>
            <div className="text-slate-600">Average Win Rate Increase</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-slate-600">Active Businesses</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">2,000+</div>
            <div className="text-slate-600">Contracts Tracked</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Subscription Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 relative border">
            {/* Plan Title & Price */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Professional</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">50,000</span>
                <span className="text-slate-600"> UGX</span>
                <span className="text-slate-500 text-lg">/month</span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Secure Payment Methods</h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center text-slate-600">
                  <CreditCard className="w-4 h-4 mr-1" />
                  <span className="text-sm">Cards</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Zap className="w-4 h-4 mr-1" />
                  <span className="text-sm">Mobile Money</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm">Bank Transfer</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading || paymentState.loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading || paymentState.loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Cancel anytime • Secure payment via Flutterwave • Immediate access to all features
              </p>
            </div>
          </div>

          {/* Benefits & Testimonials */}
          <div className="space-y-8">
            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Upgrade?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Find More Opportunities</h4>
                    <p className="text-slate-600 text-sm">Access unlimited tender alerts and never miss a relevant contract opportunity.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Win More Contracts</h4>
                    <p className="text-slate-600 text-sm">Use advanced analytics and AI recommendations to price competitively.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Save Time</h4>
                    <p className="text-slate-600 text-sm">Automated notifications and smart filtering help you focus on what matters.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg mb-4">
                "BidCloud has transformed how we approach contract bidding. We've increased our win rate by 40% in just 6 months. The competition analysis feature is incredible."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">JK</span>
                </div>
                <div>
                  <div className="font-semibold">John Kato</div>
                  <div className="text-blue-100 text-sm">Construction Manager, Kampala Builders</div>
                </div>
              </div>
            </div>

            {/* Current Status Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Limited Access</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    You're currently on a limited plan. Upgrade to Professional to unlock all features and maximize your contract win rate.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-yellow-800 hover:text-yellow-900 font-medium text-sm underline"
                  >
                    Continue with limited access →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
