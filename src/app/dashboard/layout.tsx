'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  FileText,
  Star,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { subscriptionService } from "@/lib/subscriptionService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          const status = await subscriptionService.getUserSubscriptionStatus(user.id);
          setSubscriptionStatus(status?.status || 'none');
          
          // Show upgrade prompt if user is not subscribed and not on subscription page
          const isSubscriptionPage = pathname === '/dashboard/subscription';
          const isOnboardingSubscription = pathname === '/onboarding/subscription';
          
          if ((status?.status === 'none' || status?.status === 'trial') && 
              !isSubscriptionPage && !isOnboardingSubscription) {
            setShowUpgradePrompt(true);
          } else {
            setShowUpgradePrompt(false);
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };

    checkSubscriptionStatus();
  }, [user, pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Recommended', href: '/dashboard/recommended', icon: Star },
    { name: 'Tracking', href: '/dashboard/tracking', icon: FileText },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-8 ml-4 lg:ml-0">
                <h1 className="text-xl font-bold text-blue-600">BidFlow</h1>
                
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex space-x-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tenders..."
                  className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder-slate-400 w-48"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  <User className="w-5 h-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.email?.split('@')[0]}
                  </span>
                </button>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Upgrade Prompt for Non-Subscribers */}
      {showUpgradePrompt && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    You're currently on a free plan
                  </p>
                  <p className="text-xs text-blue-700">
                    Upgrade to access unlimited tenders, advanced features, and priority support
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => router.push('/onboarding/subscription')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Subscription Limitations Overlay */}
        {subscriptionStatus === 'none' && pathname !== '/dashboard/subscription' && pathname !== '/onboarding/subscription' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Subscription Required</h3>
              <p className="text-slate-600 mb-6">
                You need an active subscription to access BidFlow features. Subscribe now to unlock:
              </p>
              <div className="text-left space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Unlimited tender access
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Advanced search & filtering
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Bid tracking & analytics
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  AI-powered recommendations
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/onboarding/subscription')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Subscribe Now
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
} 