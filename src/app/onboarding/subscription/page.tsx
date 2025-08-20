'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, CreditCard, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/hooks/usePayment";
import { subscriptionService } from "@/lib/subscriptionService";
import { supabase } from "@/lib/supabase";
import { onboardingService } from "@/lib/onboardingService";

const features = [
  "Unlimited tender alerts",
  "Advanced search & filtering", 
  "Unlimited saved tenders",
  "Email support",
  "Real-time notifications",
  "Bid tracking &  AI analytics",
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
      // Initialize payment directly without trial
      if (user) {
        await initializePayment('Professional');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/notifications');
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Mark user as having completed onboarding but without subscription
      if (user) {
        console.log('Skip - updating profile for user:', user.id); // Debug log
        
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'none',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        console.log('Skip - update result:', { error }); // Debug log

        if (error) {
          console.error('Error updating profile:', error);
        } else {
          // Mark onboarding as completed
          await onboardingService.markOnboardingCompleted(user.id);
          
          // Redirect to dashboard with restricted access
          console.log('Skip - redirecting to dashboard'); // Debug log
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error skipping subscription:', error);
    } finally {
      setLoading(false);
    }
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
              Get started with BidCloud and access all premium features
            </p>
          </div>

          {/* Single Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative border">
            
            {/* Plan Title & Price */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">50,000</span>
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
                Cancel anytime • Secure payment via Flutterwave • Immediate access to all features
              </p>
            </div>

            {/* Skip Warning */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>If you skip subscription, you'll have limited access to contracts and features. You can upgrade anytime from your dashboard.</p>
                  </div>
                </div>
            </div>
          </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to BidCloud!</h3>
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
            <button
              onClick={handleSkip}
              disabled={loading}
              className="flex items-center px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 