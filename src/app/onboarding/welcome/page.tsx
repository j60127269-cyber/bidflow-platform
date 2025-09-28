'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp, Users, Award, Star, CheckCircle, Search, Bell, BarChart3, Target, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingService } from "@/lib/onboardingService";

export default function OnboardingWelcome() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [animate, setAnimate] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        const hasCompleted = await onboardingService.hasCompletedOnboarding(user.id);
        
        if (hasCompleted) {
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

  // Trigger animations after component mounts
  useEffect(() => {
    if (!checking) {
      setTimeout(() => setAnimate(true), 100);
    }
  }, [checking]);

  const handleContinue = () => {
    router.push('/onboarding/preferences');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className={`text-center mb-16 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 mb-6 shadow-sm animate-pulse">
                <Star className="w-4 h-4 mr-2" />
                Welcome to BidCloud, {user?.email?.split('@')[0]}!
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Stop Missing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block"> Lucrative Contracts</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join 500+ Ugandan businesses who've increased their contract win rates by 40% using AI-powered intelligence. 
              <span className="font-semibold text-blue-600"> Start winning more bids today.</span>
            </p>

            {/* Hero Illustration */}
            <div className="relative mb-12">
              <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Find Opportunities</h3>
                    <p className="text-slate-600 text-sm">AI-powered contract discovery</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Win More Bids</h3>
                    <p className="text-slate-600 text-sm">Data-driven pricing strategies</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Award className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Grow Revenue</h3>
                    <p className="text-slate-600 text-sm">40% average win rate increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
              <div className="text-slate-600 font-medium">Average Win Rate Increase</div>
              <div className="text-slate-500 text-sm mt-2">Proven results from our users</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-slate-600 font-medium">Active Businesses</div>
              <div className="text-slate-500 text-sm mt-2">Trusted by companies across Uganda</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">2,000+</div>
              <div className="text-slate-600 font-medium">Contracts Tracked</div>
              <div className="text-slate-500 text-sm mt-2">Real-time monitoring & alerts</div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-16 border border-white/20 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
              Why Choose BidCloud?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-start group hover:bg-slate-50 p-4 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Find Contracts 10x Faster</h3>
                    <p className="text-slate-600">AI-powered search filters help you discover relevant opportunities in minutes, not hours. Never miss a lucrative contract again.</p>
                  </div>
                </div>
                
                <div className="flex items-start group hover:bg-slate-50 p-4 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Beat the Competition</h3>
                    <p className="text-slate-600">Analyze historical bid data to understand market trends and price competitively. Win more contracts with data-driven insights.</p>
                  </div>
                </div>
                
                <div className="flex items-start group hover:bg-slate-50 p-4 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Never Miss Deadlines</h3>
                    <p className="text-slate-600">Real-time notifications ensure you're always aware of new opportunities and upcoming deadlines. Stay ahead of the competition.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start group hover:bg-slate-50 p-4 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Track Your Success</h3>
                    <p className="text-slate-600">Monitor your bid performance and optimize your strategy with comprehensive analytics. See your ROI grow month after month.</p>
                  </div>
                </div>
                
                <div className="flex items-start group hover:bg-slate-50 p-4 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Team Collaboration</h3>
                    <p className="text-slate-600">Work together with your team to coordinate bid preparation and share insights. Streamline your entire bidding process.</p>
                  </div>
                </div>
                
                <div className="flex items-start group hover:bg-slate-50 p-4 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Mobile Money Ready</h3>
                    <p className="text-slate-600">Pay with mobile money or cards - whatever works best for you. Secure, instant payments via Flutterwave.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className={`text-center transition-all duration-1000 delay-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-5 rounded-2xl text-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 inline-flex items-center group"
            >
              Start Winning More Contracts
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <p className="text-slate-500 mt-6 text-lg">
              Takes just 2 minutes to set up your preferences • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 