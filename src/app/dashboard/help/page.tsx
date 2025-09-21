'use client';

import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  FileText,
  Video,
  Download,
  Users,
  Settings,
  BarChart3,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  items: HelpItem[];
}

interface HelpItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'faq';
  url?: string;
  duration?: string;
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using BidFlow',
      icon: BookOpen,
      items: [
        {
          id: 'welcome',
          title: 'Welcome to BidFlow',
          description: 'Your complete guide to getting started with the platform',
          type: 'guide',
          url: '/help/welcome',
          duration: '5 min read'
        },
        {
          id: 'first-contract',
          title: 'Creating Your First Contract',
          description: 'Step-by-step guide to adding your first contract',
          type: 'article',
          url: '/help/first-contract',
          duration: '3 min read'
        },
        {
          id: 'dashboard-tour',
          title: 'Dashboard Tour',
          description: 'Video walkthrough of the main dashboard features',
          type: 'video',
          url: '/help/dashboard-tour',
          duration: '8 min'
        }
      ]
    },
    {
      id: 'contracts',
      title: 'Contract Management',
      description: 'Everything about managing contracts and tenders',
      icon: FileText,
      items: [
        {
          id: 'add-contract',
          title: 'Adding New Contracts',
          description: 'How to add and manage contract information',
          type: 'article',
          url: '/help/add-contract',
          duration: '4 min read'
        },
        {
          id: 'edit-contract',
          title: 'Editing Contract Details',
          description: 'Updating contract information and status',
          type: 'guide',
          url: '/help/edit-contract',
          duration: '3 min read'
        },
        {
          id: 'contract-status',
          title: 'Understanding Contract Status',
          description: 'Different contract statuses and what they mean',
          type: 'faq',
          url: '/help/contract-status'
        }
      ]
    },
    {
      id: 'awardees',
      title: 'Awardee Management',
      description: 'Managing awardee companies and their information',
      icon: Building2,
      items: [
        {
          id: 'add-awardee',
          title: 'Adding Awardee Companies',
          description: 'How to add and manage awardee information',
          type: 'article',
          url: '/help/add-awardee',
          duration: '3 min read'
        },
        {
          id: 'awardee-profiles',
          title: 'Awardee Profiles',
          description: 'Understanding and managing awardee profiles',
          type: 'guide',
          url: '/help/awardee-profiles',
          duration: '4 min read'
        }
      ]
    },
    {
      id: 'bidders',
      title: 'Bidder Tracking',
      description: 'Tracking bidders and competitive intelligence',
      icon: Users,
      items: [
        {
          id: 'add-bidders',
          title: 'Adding Bidders to Contracts',
          description: 'How to track bidders and their information',
          type: 'article',
          url: '/help/add-bidders',
          duration: '3 min read'
        },
        {
          id: 'competitive-analysis',
          title: 'Competitive Analysis',
          description: 'Using bidder data for market intelligence',
          type: 'guide',
          url: '/help/competitive-analysis',
          duration: '5 min read'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Understanding your data and generating insights',
      icon: BarChart3,
      items: [
        {
          id: 'dashboard-analytics',
          title: 'Dashboard Analytics',
          description: 'Understanding the analytics and metrics',
          type: 'article',
          url: '/help/dashboard-analytics',
          duration: '4 min read'
        },
        {
          id: 'export-data',
          title: 'Exporting Data',
          description: 'How to export your data for external analysis',
          type: 'guide',
          url: '/help/export-data',
          duration: '2 min read'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      description: 'Customizing your BidFlow experience',
      icon: Settings,
      items: [
        {
          id: 'account-settings',
          title: 'Account Settings',
          description: 'Managing your account and preferences',
          type: 'article',
          url: '/help/account-settings',
          duration: '3 min read'
        },
        {
          id: 'notifications',
          title: 'Notification Settings',
          description: 'Configuring alerts and notifications',
          type: 'guide',
          url: '/help/notifications',
          duration: '2 min read'
        }
      ]
    }
  ];

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How do I add a new contract?',
      answer: 'To add a new contract, navigate to the Contracts page and click the "Add Contract" button. Fill in the required information including title, reference number, and contract details.',
      category: 'Contracts',
      tags: ['contracts', 'adding', 'basics']
    },
    {
      id: 'faq-2',
      question: 'What is the difference between an awardee and a bidder?',
      answer: 'An awardee is a company that has won a contract, while a bidder is any company that submitted a bid for a contract. Awardees are a subset of bidders.',
      category: 'General',
      tags: ['awardees', 'bidders', 'terminology']
    },
    {
      id: 'faq-3',
      question: 'How do I track multiple bidders for a contract?',
      answer: 'When viewing a contract, you can add multiple bidders using the "Add Bidder" button. Each bidder will be tracked with their bid amount and other relevant information.',
      category: 'Bidders',
      tags: ['bidders', 'tracking', 'multiple']
    },
    {
      id: 'faq-4',
      question: 'Can I export my data?',
      answer: 'Yes, you can export your contract and bidder data in various formats including CSV and Excel. Use the export options in the respective sections.',
      category: 'Data',
      tags: ['export', 'data', 'csv']
    },
    {
      id: 'faq-5',
      question: 'How do I update contract status?',
      answer: 'To update a contract status, edit the contract and change the status field. Common statuses include "Open", "Awarded", "Cancelled", and "Pending".',
      category: 'Contracts',
      tags: ['status', 'update', 'contracts']
    },
    {
      id: 'faq-6',
      question: 'What information should I include for awardees?',
      answer: 'For awardees, include company name, business type, contact information, address, and any relevant notes. This helps build a comprehensive database.',
      category: 'Awardees',
      tags: ['awardees', 'information', 'details']
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const filteredSections = helpSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'guide':
        return BookOpen;
      case 'faq':
        return HelpCircle;
      default:
        return FileText;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-red-600 bg-red-100';
      case 'guide':
        return 'text-blue-600 bg-blue-100';
      case 'faq':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-2 text-gray-600">
            Find answers, guides, and resources to help you get the most out of BidFlow
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search help articles, FAQs, and guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-500">Get instant help from our support team</p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Start Chat →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-500">Send us a detailed message</p>
                <a href="mailto:support@bidflow.com" className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium">
                  support@bidflow.com →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-500">Call us for urgent issues</p>
                <a href="tel:+1-555-0123" className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
                  +1 (555) 012-3456 →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Help Sections */}
        {filteredSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <div className="flex items-center">
                  <Icon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="p-6 space-y-4">
                    {section.items.map((item) => {
                      const ItemIcon = getItemIcon(item.type);
                      const itemColor = getItemColor(item.type);
                      
                      return (
                        <div key={item.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50">
                          <div className={`flex-shrink-0 p-2 rounded-lg ${itemColor}`}>
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            {item.duration && (
                              <p className="text-xs text-gray-400 mt-1">{item.duration}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500 mt-1">Quick answers to common questions</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFAQs.map((faq) => {
              const isExpanded = expandedFAQs.includes(faq.id);
              
              return (
                <div key={faq.id}>
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{faq.question}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {faq.category}
                        </span>
                        {faq.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {searchTerm && filteredSections.length === 0 && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Search className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search terms or browse the categories above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
