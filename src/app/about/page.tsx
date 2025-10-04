'use client';

import { ArrowRight, Users, Target, Award, TrendingUp, Shield, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              About BidCloud
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing how businesses discover, analyze, and win contracts 
              through AI-powered intelligence and data-driven insights.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                To democratize access to contract opportunities by providing businesses 
                with the intelligence, tools, and insights they need to compete effectively 
                in today's dynamic procurement landscape.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Level the Playing Field</h3>
                    <p className="text-slate-600">Give small and medium businesses the same intelligence as large corporations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Drive Success</h3>
                    <p className="text-slate-600">Help businesses increase their contract win rates through data-driven decisions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Expand Opportunities</h3>
                    <p className="text-slate-600">Connect businesses with opportunities they might otherwise miss.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Vision</h3>
              <p className="text-lg text-slate-600 mb-6">
                To become the world's leading contract intelligence platform, 
                empowering businesses of all sizes to discover, analyze, and win 
                more contracts through AI-powered insights.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">500+</div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">2,000+</div>
                  <div className="text-sm text-slate-600">Contracts Tracked</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
                  <div className="text-sm text-slate-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Story
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Born from the frustration of missing opportunities and the complexity of modern procurement.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-slate-600 mb-6">
                BidCloud was founded by a team of procurement professionals, data scientists, 
                and technology experts who experienced firsthand the challenges businesses face 
                in discovering and winning contracts.
              </p>
              <p className="text-lg text-slate-600 mb-6">
                We noticed that while large corporations had access to sophisticated contract 
                intelligence tools, small and medium businesses were left behind, relying on 
                manual processes and incomplete information to make critical bidding decisions.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                This gap inspired us to create BidCloud – a platform that democratizes access 
                to contract intelligence, giving businesses of all sizes the tools they need 
                to compete effectively and win more contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Trust & Security</h3>
              <p className="text-slate-600">
                We prioritize the security and privacy of our users' data, 
                implementing industry-leading security measures.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">User-Centric</h3>
              <p className="text-slate-600">
                Every feature we build is designed with our users' success in mind, 
                ensuring maximum value and impact.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Innovation</h3>
              <p className="text-slate-600">
                We continuously push the boundaries of what's possible in contract 
                intelligence and procurement analytics.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Excellence</h3>
              <p className="text-slate-600">
                We strive for excellence in everything we do, from product quality 
                to customer service and support.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Accessibility</h3>
              <p className="text-slate-600">
                We believe contract intelligence should be accessible to businesses 
                of all sizes, not just large corporations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Growth</h3>
              <p className="text-slate-600">
                We're committed to helping our users grow their businesses through 
                better contract opportunities and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Contract Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using BidCloud to increase their contract win rates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/contact" 
              className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
