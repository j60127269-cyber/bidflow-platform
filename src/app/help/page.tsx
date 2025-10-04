'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, BookOpen, Video, MessageCircle, FileText, Users, Settings, Bell, BarChart3, Target, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I get started with BidCloud?',
    answer: 'Getting started is easy! Simply sign up for a free account, complete your business profile, and set your contract preferences. Our AI will then start matching you with relevant opportunities.',
    category: 'Getting Started'
  },
  {
    id: '2',
    question: 'What types of contracts does BidCloud track?',
    answer: 'BidCloud tracks government contracts, private sector opportunities, and procurement notices across various industries including construction, IT, consulting, healthcare, and more.',
    category: 'Features'
  },
  {
    id: '3',
    question: 'How accurate is the contract matching?',
    answer: 'Our AI algorithms provide match scores based on your business profile and contract requirements. Most matches achieve 80%+ accuracy rates, helping you focus on the most relevant opportunities.',
    category: 'Features'
  },
  {
    id: '4',
    question: 'Can I customize my notification preferences?',
    answer: 'Yes! You can customize your notification preferences in the dashboard settings. Choose which types of contracts you want to be notified about, how often, and through which channels (email, SMS, in-app).',
    category: 'Settings'
  },
  {
    id: '5',
    question: 'How do I update my business profile?',
    answer: 'Go to your dashboard and click on "Profile" in the navigation. From there, you can update your company information, capabilities, location, and other details that help us match you with better opportunities.',
    category: 'Account'
  },
  {
    id: '6',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, mobile money payments, and bank transfers. Our payment processing is secure and handled through trusted payment providers.',
    category: 'Billing'
  },
  {
    id: '7',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.',
    category: 'Billing'
  },
  {
    id: '8',
    question: 'How do I contact customer support?',
    answer: 'You can contact our support team via email at support@bidcloud.org, through the contact form on our website, or by phone during business hours. We typically respond within 24 hours.',
    category: 'Support'
  }
];

const categories = [
  { id: 'all', name: 'All Topics', icon: BookOpen },
  { id: 'Getting Started', name: 'Getting Started', icon: Target },
  { id: 'Features', name: 'Features', icon: BarChart3 },
  { id: 'Account', name: 'Account', icon: Users },
  { id: 'Settings', name: 'Settings', icon: Settings },
  { id: 'Billing', name: 'Billing', icon: FileText },
  { id: 'Support', name: 'Support', icon: MessageCircle }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Help Center
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to your questions, learn how to use BidCloud effectively, 
              and get the support you need to succeed.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Quick Links</h2>
            <p className="text-lg text-slate-600">Get help with common tasks</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard" className="group">
              <div className="bg-blue-50 rounded-xl p-6 text-center hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Getting Started</h3>
                <p className="text-sm text-slate-600">Learn the basics of using BidCloud</p>
              </div>
            </Link>
            
            <Link href="/dashboard/profile" className="group">
              <div className="bg-green-50 rounded-xl p-6 text-center hover:bg-green-100 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Account Setup</h3>
                <p className="text-sm text-slate-600">Set up your business profile</p>
              </div>
            </Link>
            
            <Link href="/dashboard/notifications" className="group">
              <div className="bg-purple-50 rounded-xl p-6 text-center hover:bg-purple-100 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Notifications</h3>
                <p className="text-sm text-slate-600">Manage your alerts and preferences</p>
              </div>
            </Link>
            
            <Link href="/contact" className="group">
              <div className="bg-orange-50 rounded-xl p-6 text-center hover:bg-orange-100 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Contact Support</h3>
                <p className="text-sm text-slate-600">Get help from our team</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Find answers to the most common questions about BidCloud.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            
            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-sm">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900">{faq.question}</span>
                    {expandedItems.includes(faq.id) ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  
                  {expandedItems.includes(faq.id) && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-600">Try adjusting your search or browse different categories.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our support team is here to help you succeed with BidCloud.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Email Support</h3>
              <p className="text-slate-600 mb-4">
                Get help via email from our support team.
              </p>
              <a 
                href="mailto:support@bidcloud.org" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                support@bidcloud.org
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Video Tutorials</h3>
              <p className="text-slate-600 mb-4">
                Watch step-by-step guides to get the most out of BidCloud.
              </p>
              <Link 
                href="/tutorials" 
                className="text-green-600 hover:text-green-500 font-medium"
              >
                View Tutorials
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Documentation</h3>
              <p className="text-slate-600 mb-4">
                Comprehensive guides and API documentation.
              </p>
              <Link 
                href="/docs" 
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Read Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using BidCloud to discover more opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center"
            >
              Start Free Trial
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

