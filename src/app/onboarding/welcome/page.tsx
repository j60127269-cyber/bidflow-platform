'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp, Users, Award, Star, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function OnboardingWelcome() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('preferred_categories, business_type, min_contract_value')
          .eq('id', user.id)
          .single();

        if (profile && profile.preferred_categories && profile.business_type && profile.min_contract_value) {
          // User has completed onboarding, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, router]);

  const handleContinue = () => {
    router.push('/onboarding/preferences');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Checking your account...</p>
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
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm font-medium text-slate-900">Welcome</span>
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
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-sm text-slate-500">Subscription</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Star className="w-4 h-4 mr-2" />
                Welcome to BidCloud, {user?.email?.split('@')[0]}!
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Transform Your
              <span className="text-blue-600 block"> Contract Bidding</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              You're about to join 500+ Ugandan businesses that have increased their contract win rates by 40% using data-driven intelligence.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
              <div className="text-slate-600">Average Win Rate Increase</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-slate-600">Active Businesses</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2,000+</div>
              <div className="text-slate-600">Contracts Tracked</div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              What You'll Get with BidCloud
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Find Contracts 10x Faster</h3>
                    <p className="text-slate-600 text-sm">Advanced search filters help you discover relevant opportunities in minutes, not hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Beat the Competition</h3>
                    <p className="text-slate-600 text-sm">Analyze historical bid data to understand market trends and price competitively.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Never Miss Deadlines</h3>
                    <p className="text-slate-600 text-sm">Real-time notifications ensure you're always aware of new opportunities and upcoming deadlines.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Track Your Success</h3>
                    <p className="text-slate-600 text-sm">Monitor your bid performance and optimize your strategy with comprehensive analytics.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Team Collaboration</h3>
                    <p className="text-slate-600 text-sm">Work together with your team to coordinate bid preparation and share insights.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Mobile Money Ready</h3>
                    <p className="text-slate-600 text-sm">Pay with mobile money, cards, or bank transfer - whatever works best for you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-12 text-white">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg mb-4">
              "BidCloud has transformed how we approach contract bidding. We've increased our win rate by 40% in just 6 months. The competition analysis feature is incredible - we now know exactly what to expect and can price our bids competitively."
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

          {/* CTA Section */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center"
            >
              Let's Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <p className="text-sm text-slate-500 mt-4">
              Takes just 2 minutes to set up your preferences
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 