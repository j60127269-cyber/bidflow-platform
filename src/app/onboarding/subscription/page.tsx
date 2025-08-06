'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, Star, CreditCard, Smartphone, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  "Unlimited contract searches",
  "Advanced analytics & insights",
  "Real-time notifications",
  "Team collaboration tools",
  "Mobile money & card payments",
  "Priority customer support",
  "Historical bid data access",
  "Competition analysis reports",
  "Custom dashboard",
  "Export capabilities"
];

const paymentMethods = [
  {
    id: "mobile_money",
    name: "Mobile Money",
    description: "MTN, Airtel, or other mobile money",
    icon: Smartphone,
    popular: true
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, or other cards",
    icon: CreditCard
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer",
    icon: Building
  }
];

export default function OnboardingSubscription() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("mobile_money");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    // Simulate subscription process
    setTimeout(() => {
      setShowSuccess(true);
      setLoading(false);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }, 2000);
  };

  const handleBack = () => {
    router.push('/onboarding/notifications');
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-slate-600">
              Start your free trial and unlock all BidFlow features
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Plan</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold text-blue-600">30,000</span>
                <span className="text-slate-600"> UGX</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <div className="flex items-center justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-slate-600">500+ businesses trust us</span>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* ROI Calculator */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-3">Your Investment Return</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">20 hrs</div>
                  <div className="text-sm text-slate-600">Time saved per month</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">40%</div>
                  <div className="text-sm text-slate-600">Average win rate increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">3x</div>
                  <div className="text-sm text-slate-600">More contracts found</div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">Choose Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <method.icon className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm opacity-75">{method.description}</div>
                      </div>
                      {method.popular && (
                        <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trial Info */}
            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">7-Day Free Trial</span>
              </div>
              <p className="text-green-700 text-sm">
                Start your free trial today. No credit card required. Cancel anytime during the trial period.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Start Free Trial"}
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Skip for now
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy
            </p>
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
          <div className="flex justify-between">
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