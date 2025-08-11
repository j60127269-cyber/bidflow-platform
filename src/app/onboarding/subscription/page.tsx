'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, CreditCard, Shield, Zap } from "lucide-react";
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

export default function OnboardingSubscription() {
  const router = useRouter();
  const { user } = useAuth();
  const { paymentState, initializePayment, resetPaymentState } = usePayment();
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [hasPaidSubscription, setHasPaidSubscription] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        const status = await subscriptionService.getUserSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
        
        // If status shows active, double-check for actual paid subscription
        if (status?.status === 'active' && status?.planName) {
          const hasPaid = await subscriptionService.hasActiveSubscription(user.id);
          setHasPaidSubscription(hasPaid);
        }
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

  const handleBack = () => {
    router.push('/onboarding/notifications');
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  // If user already has active subscription, show success state
  if (subscriptionStatus?.status === 'active' && subscriptionStatus?.planName && hasPaidSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <span className="text-sm text-slate-500">Welcome</span>
                  </div>
                  <div className="w-8 h-0.5 bg-slate-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <span className="text-sm text-slate-500">Preferences</span>
                  </div>
                  <div className="w-8 h-0.5 bg-slate-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <span className="text-sm text-slate-500">Notifications</span>
                  </div>
                  <div className="w-8 h-0.5 bg-slate-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Subscription</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                You're Already Subscribed!
              </h1>
              <p className="text-lg text-slate-600">
                You have an active {subscriptionStatus?.planName} subscription
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Your Subscription Details
                </h2>
                <div className="space-y-2 text-slate-600">
                  <p><strong>Plan:</strong> {subscriptionStatus?.planName}</p>
                  <p><strong>Status:</strong> Active</p>
                  {subscriptionStatus?.subscriptionEndsAt && (
                    <p><strong>Next billing:</strong> {new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center mx-auto"
              >
                Continue to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm text-slate-500">Welcome</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm text-slate-500">Preferences</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="text-sm text-slate-500">Notifications</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-sm font-medium text-slate-900">Subscription</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-slate-600">
              Choose your plan and unlock all BidFlow features
            </p>
          </div>

          {/* Single Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative border">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most popular for small businesses
              </span>
            </div>
            
            {/* Plan Title & Price */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">20,000</span>
                <span className="text-slate-600"> UGX</span>
                <span className="text-slate-500 text-sm">/month</span>
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
                Cancel anytime • No setup fees • Secure payment via Flutterwave
              </p>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to BidFlow!</h3>
                <p className="text-slate-600 mb-4">
                  Your account has been created successfully. Redirecting to your dashboard...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 