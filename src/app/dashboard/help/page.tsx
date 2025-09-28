'use client'

import { useState, useEffect } from 'react';
import { Construction, Wrench, Clock, Sparkles, ArrowRight, BookOpen, MessageCircle, Mail, Phone } from 'lucide-react';

export default function HelpPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className={`text-center py-20 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Animated Construction Icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                <Construction className="w-12 h-12 text-white" />
              </div>
              {/* Floating particles around the icon */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-4 -left-4 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Help Center
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 block">
              Coming Soon!
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            We're building something amazing for you. Our comprehensive help center with guides, 
            tutorials, and support resources will be available soon.
          </p>

          {/* Animated Progress Bar */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-center mb-6">
                <Wrench className="w-6 h-6 text-orange-500 mr-3 animate-spin" />
                <span className="text-lg font-semibold text-slate-700">Under Construction</span>
                <Clock className="w-6 h-6 text-blue-500 ml-3 animate-pulse" />
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              
              <p className="text-slate-600 text-sm">
                Development Progress: 75% Complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mx-4 mb-20 border border-white/20 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Need Help Right Now?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            While we're building the help center, you can still reach out to us for support.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Mail className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <p className="text-blue-100 text-sm mb-4">Get detailed support</p>
              <a href="mailto:support@bidcloud.org" className="inline-flex items-center text-sm font-medium hover:text-blue-200 transition-colors">
                support@bidcloud.org
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <MessageCircle className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
              <p className="text-green-100 text-sm mb-4">Instant messaging</p>
              <a href="https://wa.me/256770874913" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium hover:text-green-200 transition-colors">
                Chat on WhatsApp
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className={`text-center pb-20 transition-all duration-1000 delay-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 font-semibold shadow-lg">
          <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
          Thank you for your patience as we build something amazing for you!
        </div>
      </div>
    </div>
  );
}
