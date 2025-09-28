'use client'

import Link from "next/link";
import { Search, TrendingUp, Bell, BarChart3, Users, Award, CheckCircle, Star, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">BidCloud</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Pricing
                </a>
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-blue-600 p-2 rounded-md"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a 
              href="#features" 
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <Link 
              href="/login" 
              className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 500+ Premium businesses
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Win More Contracts with
              <span className="text-blue-600 block"> Ai Data Driven Intelligence</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Uganda's premier contract intelligence platform. Track contracts, analyze competition, 
              and make informed bidding decisions with real-time data and ai analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link 
                href="#demo" 
                className="border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Watch Demo
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2,000+</div>
                <div className="text-slate-600">Contracts Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                <div className="text-slate-600">Success Rate</div>
              </div>
            </div>
            
            <div className="mt-8 text-sm text-slate-500">
              <span className="font-semibold text-blue-600">50,000 UGX</span> per month  • free trial availabel
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Win More Contracts
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From contract discovery to bid preparation, we provide the tools and insights 
              you need to succeed in Uganda's competitive market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Smart Contract Search</h3>
              <p className="text-slate-600">
                Find relevant contracts with advanced filters by industry, location, value, 
                and deadline. Never miss an opportunity again.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Competition Analysis</h3>
              <p className="text-slate-600">
                Analyze historical bid data, competitor success rates, and market trends 
                to make informed ai powered bidding decisions.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Smart Notifications</h3>
              <p className="text-slate-600">
                Get real-time alerts for new contracts, deadline reminders, and 
                market intelligence updates.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Analytics Dashboard</h3>
              <p className="text-slate-600">
                Track your bid performance, win rates, and market insights with 
                comprehensive analytics and reporting.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Team Collaboration</h3>
              <p className="text-slate-600">
                Work together with your team to track contracts, share insights, 
                and coordinate bid preparation efforts.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Success Tracking</h3>
              <p className="text-slate-600">
                Monitor your bid success rates, track wins and losses, and 
                optimize your bidding strategy over time .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Leading Businesses
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how BidCloud is helping  companies win more contracts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "BidCloud has transformed how we approach contract bidding. We've increased our win rate by utilising prime historical data to optimize our stratergies."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">JK</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">John Kato</div>
                  <div className="text-sm text-slate-600">Construction Manager, Kampala Builders</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "The competition analysis feature is incredible. We now know exactly what to expect and can price our bids competitively."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah Muwonge</div>
                  <div className="text-sm text-slate-600">CEO, Tech Solutions Uganda</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "Real-time notifications ensure we never miss a deadline. The platform has streamlined our entire bidding process."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">DN</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">David Nalukenge</div>
                  <div className="text-sm text-slate-600">Procurement Director, Uganda Logistics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              One plan, unlimited access to all features
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-blue-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Professional Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">50,000</span>
                  <span className="text-slate-600"> UGX</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-slate-800 font-medium">Unlimited contract searches</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-slate-800 font-medium">Advanced analytics & insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-slate-800 font-medium">Real-time notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-slate-800 font-medium">Team collaboration tools</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-slate-800 font-medium">Mobile money & card payments</span>
          </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-slate-800 font-medium">Priority customer support</span>
          </li>
                </ul>
                <Link 
                  href="/register" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
                <p className="text-sm text-slate-600 mt-4">7-day free trial, no credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Win More Contracts?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Ugandan businesses already using BidCloud to increase their contract win rates.
          </p>
          <Link 
            href="/register" 
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">BidCloud</h3>
              <p className="text-white">
                Uganda's premier contract intelligence platform helping businesses 
                win more contracts through data driven insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#" className="hover:text-gray-300 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#" className="hover:text-gray-300 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#" className="hover:text-gray-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-white">
            <p>&copy; 2025 BidCloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
