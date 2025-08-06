'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Star, TrendingUp, Users, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const benefits = [
  {
    icon: TrendingUp,
    title: "40% Average Win Rate Increase",
    description: "Our users see significant improvements in their bidding success"
  },
  {
    icon: Users,
    title: "500+ Active Businesses",
    description: "Join a growing community of successful Ugandan companies"
  },
  {
    icon: Award,
    title: "24/7 Real-time Monitoring",
    description: "Never miss an opportunity with instant contract alerts"
  }
];

const testimonial = {
  name: "Sarah Muwonge",
  company: "Kampala Construction Ltd",
  content: "BidFlow helped us win 3 major contracts in just 6 months. The analytics are game-changing!",
  rating: 5
};

export default function OnboardingWelcome() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    setLoading(true);
    router.push('/onboarding/preferences');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-900">Welcome</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm text-gray-500">Preferences</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="text-sm text-gray-500">Notifications</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-sm text-gray-500">Subscription</span>
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
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Welcome to
              <span className="text-blue-600"> BidFlow</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Let's set up your account to help you discover, track, and win more contracts in Uganda.
            </p>
          </div>

          {/* Value Proposition */}
          <div className="card p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose BidFlow?
              </h2>
              <p className="text-gray-600">
                Join hundreds of Ugandan businesses already winning more contracts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2,000+</div>
                <div className="text-sm text-gray-600">Contracts Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">40%</div>
                <div className="text-sm text-gray-600">Win Rate Increase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="card p-8 mb-12">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-lg text-gray-700 italic mb-4">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-gray-500">{testimonial.company}</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="btn-primary text-lg px-8 py-4"
            >
              {loading ? "Setting up..." : "Let's Get Started"}
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
            <p className="text-sm text-gray-500 mt-4">
              This will only take a few minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 