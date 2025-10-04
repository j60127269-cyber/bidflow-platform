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
                <a href="#features" className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
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
                className="text-black hover:text-blue-600 p-2 rounded-md"
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
              className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Win More Contracts with
              <span className="text-blue-600 block"> Ai Data Driven Intelligence</span>
            </h1>
            <p className="text-lg sm:text-xl text-black mb-8 max-w-3xl mx-auto leading-relaxed">
              Uganda's premier contract intelligence platform. Track contracts, analyze competition, 
              and make informed bidding decisions with real-time data and ai analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-black">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2,000+</div>
                <div className="text-black">Contracts Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                <div className="text-black">Success Rate</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Win More Contracts
            </h2>
             <p className="text-xl text-black max-w-2xl mx-auto">
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
               <p className="text-black">
                 Find relevant contracts with advanced filters by industry, location, value, 
                 and deadline. Never miss an opportunity again.
               </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Competition Analysis</h3>
              <p className="text-black">
                Analyze historical bid data, competitor success rates, and market trends 
                to make informed ai powered bidding decisions.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Smart Notifications</h3>
              <p className="text-black">
                Get real-time alerts for new contracts, deadline reminders, and 
                market intelligence updates.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Analytics Dashboard</h3>
              <p className="text-black">
                Track your bid performance, win rates, and market insights with 
                comprehensive analytics and reporting.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Team Collaboration</h3>
              <p className="text-black">
                Work together with your team to track contracts, share insights, 
                and coordinate bid preparation efforts.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Success Tracking</h3>
              <p className="text-black">
                Monitor your bid success rates, track wins and losses, and 
                optimize your bidding strategy over time .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contract Search Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Marketing text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Find. Filter. Win.
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Discover contracts that match your expertise in seconds.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our intelligent search doesn't just retrieve contracts, it understands your business. 
                Automatically detecting contract types, deadlines, and key requirements so you can 
                focus on what matters most - winning the right opportunities.
              </p>
            </div>
            
            {/* Right side - UI mockup */}
            <div className="bg-slate-50 rounded-2xl p-8 shadow-lg">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-slate-800">Contract Search</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Search className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700">Construction contracts in Kampala</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">Road Construction - Entebbe Highway</div>
                        <div className="text-sm text-slate-600">Deadline: Mar 15, 2025 • Value: 2.5B UGX</div>
                      </div>
                      <div className="text-green-600 font-semibold">Match: 95%</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">Building Construction - Nakawa</div>
                        <div className="text-sm text-slate-600">Deadline: Apr 2, 2025 • Value: 1.8B UGX</div>
                      </div>
                      <div className="text-green-600 font-semibold">Match: 87%</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">Infrastructure Development - Jinja</div>
                        <div className="text-sm text-slate-600">Deadline: May 10, 2025 • Value: 3.2B UGX</div>
                      </div>
                      <div className="text-blue-600 font-semibold">Match: 78%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Analysis Feature Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - UI mockup */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800">Competition Analysis</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">Historical Win Rate</span>
                      <span className="text-blue-600 font-bold">68%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">1</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">ABC Construction Ltd</div>
                          <div className="text-sm text-slate-600">Won 12/18 contracts (67%)</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">2</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">XYZ Builders</div>
                          <div className="text-sm text-slate-600">Won 8/15 contracts (53%)</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">3</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">DEF Engineering</div>
                          <div className="text-sm text-slate-600">Won 6/12 contracts (50%)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Marketing text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Know Your Competition.
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Analyze competitor success rates and market trends.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Get insights into who's winning what contracts, their success rates, and pricing patterns. 
                Make data-driven decisions about which opportunities to pursue and how to position your bids 
                for maximum success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Notifications Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Marketing text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Never Miss a Deadline.
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Stay ahead with intelligent contract alerts.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Whether it's a new contract posting, a submission deadline, or a market opportunity, 
                our smart notifications keep you one step ahead with personalized alerts and clear 
                action items so you never miss a winning opportunity.
              </p>
            </div>
            
            {/* Right side - UI mockup */}
            <div className="bg-slate-50 rounded-2xl p-8 shadow-lg">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-slate-800">Smart Notifications</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <Bell className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-800">Deadline Alert</div>
                      <div className="text-sm text-slate-600">Road Construction - Entebbe Highway</div>
                      <div className="text-xs text-red-600 font-semibold">Due in 2 days</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-800">New Contract</div>
                      <div className="text-sm text-slate-600">Building Construction - Nakawa</div>
                      <div className="text-xs text-blue-600 font-semibold">Posted 1 hour ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <Bell className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-800">Market Update</div>
                      <div className="text-sm text-slate-600">3 new construction contracts in your area</div>
                      <div className="text-xs text-green-600 font-semibold">High match probability</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intelligence Feature Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - UI mockup */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800">Market Intelligence</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-slate-800">Contract Distribution</span>
                      <span className="text-blue-600 font-bold">Q1 2025</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-100 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600">45%</div>
                        <div className="text-xs text-slate-600">Construction</div>
                      </div>
                      <div className="bg-green-100 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">32%</div>
                        <div className="text-xs text-slate-600">IT Services</div>
                      </div>
                      <div className="bg-purple-100 p-2 rounded">
                        <div className="text-lg font-bold text-purple-600">23%</div>
                        <div className="text-xs text-slate-600">Consulting</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-slate-800">Market Growth</div>
                          <div className="text-sm text-slate-600">Construction sector up 15%</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">+15%</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-slate-800">New Opportunities</div>
                          <div className="text-sm text-slate-600">23 contracts posted this week</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-bold">23</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Marketing text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                See the Market.
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Uncover opportunities with AI-powered market intelligence.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Get comprehensive insights into market trends, contract distributions, and growth patterns. 
                Our AI analyzes thousands of contracts to identify emerging opportunities, market shifts, 
                and the best sectors for your business to focus on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Management Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Marketing text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Manage Every Opportunity.
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Track, collaborate, and win with unlimited pipelines.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                From initial discovery to final submission, manage your entire bidding process in one place. 
                Set up unlimited pipelines, track progress, collaborate with your team, and never miss 
                a critical deadline or opportunity.
              </p>
            </div>
            
            {/* Right side - UI mockup */}
            <div className="bg-slate-50 rounded-2xl p-8 shadow-lg">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-slate-800">Opportunity Pipeline</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-blue-100 p-2 rounded">
                      <div className="font-bold text-blue-600">12</div>
                      <div>Identified</div>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded">
                      <div className="font-bold text-yellow-600">8</div>
                      <div>In Progress</div>
                    </div>
                    <div className="bg-orange-100 p-2 rounded">
                      <div className="font-bold text-orange-600">5</div>
                      <div>Submitted</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded">
                      <div className="font-bold text-green-600">3</div>
                      <div>Won</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">Road Construction - Entebbe</div>
                        <div className="text-sm text-slate-600">Due: Mar 15, 2025 • Team: 4 members</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-semibold">In Progress</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">Building Construction - Nakawa</div>
                        <div className="text-sm text-slate-600">Due: Apr 2, 2025 • Team: 3 members</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-yellow-600 font-semibold">Planning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Analysis Feature Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - UI mockup */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800">Competitor Intelligence</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">Likely Competitors</span>
                      <span className="text-red-600 font-bold">High Risk</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">ABC Construction Ltd</span>
                        <span className="text-sm font-semibold text-red-600">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">XYZ Builders</span>
                        <span className="text-sm font-semibold text-orange-600">72%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-slate-800">Market Share</div>
                          <div className="text-sm text-slate-600">Your position: #3 of 12</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-bold">23%</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-slate-800">Win Probability</div>
                          <div className="text-sm text-slate-600">Based on historical data</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">68%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Marketing text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Compete Smarter.
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Analyze competitors and position your bids strategically.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Get detailed insights into likely competitors, their success rates, and bidding patterns. 
                Understand your market position, identify competitive advantages, and make data-driven 
                decisions about pricing and positioning to maximize your win probability.
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
            <p className="text-xl text-black max-w-2xl mx-auto">
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
              <p className="text-black mb-6">
                "BidCloud has transformed how we approach contract bidding. We've increased our win rate by utilising prime historical data to optimize our stratergies."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">JK</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">John Kato</div>
                  <div className="text-sm text-black">Construction Manager, Kampala Builders</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-black mb-6">
                "The competition analysis feature is incredible. We now know exactly what to expect and can price our bids competitively."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah Muwonge</div>
                  <div className="text-sm text-black">CEO, Tech Solutions Uganda</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-black mb-6">
                "Real-time notifications ensure we never miss a deadline. The platform has streamlined our entire bidding process."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">DN</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">David Nalukenge</div>
                  <div className="text-sm text-black">Procurement Director, Uganda Logistics</div>
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
            <p className="text-xl text-black">
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
                  <span className="text-black"> UGX</span>
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
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using BidCloud to increase their contract win rates.
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
                 A premier contract intelligence platform helping businesses 
                 win more contracts through data driven insights.
               </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#" className="hover:text-gray-300 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-white">
                <li><Link href="/about" className="hover:text-gray-300 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-white">
                <li><Link href="/help" className="hover:text-gray-300 transition-colors">Help Center</Link></li>
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
