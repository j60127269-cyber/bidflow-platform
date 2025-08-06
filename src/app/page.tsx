import Link from "next/link";
import { CheckCircle, Star, ArrowRight, Search, TrendingUp, Bell, BarChart3, Users, Award, Shield, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Contract Discovery",
    description: "AI-powered search finds contracts matching your exact criteria"
  },
  {
    icon: TrendingUp,
    title: "Competition Analytics",
    description: "Track competitors and understand market dynamics"
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Get instant notifications for new opportunities"
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    description: "Data-driven analytics to improve your win rate"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly on bids and proposals"
  },
  {
    icon: Award,
    title: "Success Tracking",
    description: "Monitor your bidding performance and ROI"
  }
];

const testimonials = [
  {
    name: "Sarah Muwonge",
    company: "Kampala Construction Ltd",
    content: "BidFlow helped us win 3 major contracts in just 6 months. The analytics are game-changing!",
    rating: 5
  },
  {
    name: "David Okello",
    company: "Tech Solutions Uganda",
    content: "The real-time alerts and competition insights have transformed how we approach bidding.",
    rating: 5
  },
  {
    name: "Grace Nakimera",
    company: "Green Energy Partners",
    content: "Finally, a platform that understands the Ugandan market. Highly recommended!",
    rating: 5
  }
];

const stats = [
  { number: "500+", label: "Active Businesses" },
  { number: "2,000+", label: "Contracts Tracked" },
  { number: "40%", label: "Average Win Rate Increase" },
  { number: "24/7", label: "Real-time Monitoring" }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Navigation */}
      <nav className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">BidFlow</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-sky-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Win More
                <span className="text-blue-600"> Contracts</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Uganda's premier contract intelligence platform. Discover opportunities, track competition, and boost your win rate with data-driven insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/register" className="btn-primary text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
                <button className="btn-secondary text-lg px-8 py-4">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="text-blue-600"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for the Ugandan market to help you find, track, and win more contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover p-8 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by
              <span className="text-blue-600"> Leading Businesses</span>
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about BidFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple,
              <span className="text-blue-600"> Transparent</span> Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start winning more contracts today
            </p>
          </div>

          <div className="card p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Plan</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-blue-600">30,000</span>
                <span className="text-gray-600 text-xl"> UGX</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Unlimited contract searches",
                "Advanced analytics & insights", 
                "Real-time notifications",
                "Team collaboration tools",
                "Mobile money & card payments",
                "Priority customer support"
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/register" className="btn-primary w-full text-center text-lg py-4">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Link>

            <p className="text-sm text-gray-500 text-center mt-6">
              No setup fees • Cancel anytime • 7-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="text-yellow-300"> Bidding Strategy?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ businesses already winning more contracts with BidFlow
          </p>
          <Link href="/register" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BidFlow</span>
              </div>
              <p className="text-gray-400">
                Uganda's premier contract intelligence platform helping businesses win more contracts.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BidFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
