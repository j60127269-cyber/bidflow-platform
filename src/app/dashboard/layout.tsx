'use client'

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { subscriptionService } from "@/lib/subscriptionService";
import { 
  Search, 
  TrendingUp, 
  Bell, 
  BarChart3, 
  Users, 
  Award, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Target,
  Calendar,
  Bookmark,
  ChevronDown,
  User,
  Star,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [trialExpiringSoon, setTrialExpiringSoon] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          const status = await subscriptionService.getUserSubscriptionStatus(user.id);
          setSubscriptionStatus(status);
        } catch (error) {
          console.error('Error checking subscription status:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const fullName = user.user_metadata?.full_name || user.email || "";
    return fullName
      .split(" ")
      .map((name: string) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard' },
    { name: 'Recommended', href: '/dashboard/recommended', icon: Star, current: pathname === '/dashboard/recommended' },
    { name: 'My Bids', href: '/dashboard/tracking', icon: Target, current: pathname.startsWith('/dashboard/tracking') },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, current: pathname.startsWith('/dashboard/analytics') },
    { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard, current: pathname === '/dashboard/subscription' },
  ];

  // Show upgrade prompt if user doesn't have active subscription
  const showUpgradePrompt = subscriptionStatus &&
    subscriptionStatus.status !== 'active' &&
    subscriptionStatus.status !== 'trial' &&
    pathname !== '/dashboard/subscription';

  const showTrialInfo = subscriptionStatus &&
    subscriptionStatus.status === 'trial' &&
    pathname !== '/dashboard/subscription';

  const showTrialExpired = subscriptionStatus &&
    subscriptionStatus.status === 'none' &&
    subscriptionStatus.trialEnded &&
    pathname !== '/dashboard/subscription';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and primary navigation */}
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center">
                  <h1 className="text-xl font-bold text-blue-600">BidFlow</h1>
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden md:flex ml-10 space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        item.current
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right side - Search, notifications, user menu */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden lg:block relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-slate-900">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {subscriptionStatus?.status === 'active' ? 'Professional Plan' : 'Free Plan'}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <Link
                        href="/dashboard/subscription"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <CreditCard className="mr-3 h-4 w-4" />
                        Subscription
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-6 w-6 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="lg:hidden border-t border-slate-200 px-4 py-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search contracts..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </header>

                     {/* Upgrade Prompt */}
             {showUpgradePrompt && (
               <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                 <div className="max-w-7xl mx-auto flex items-center justify-between">
                   <div className="flex items-center">
                     <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                     <p className="text-sm text-yellow-800">
                       Upgrade to Professional Plan to unlock all features and unlimited access.
                     </p>
                   </div>
                   <Link
                     href="/dashboard/subscription"
                     className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                     Upgrade Now
                   </Link>
                 </div>
               </div>
             )}

                           {/* Trial Info */}
              {showTrialInfo && subscriptionStatus?.trialEndsAt && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-5 w-5 text-blue-600 mr-2">🎉</div>
                      <p className="text-sm text-blue-800">
                        You're on a free trial! Trial ends on {new Date(subscriptionStatus.trialEndsAt).toLocaleDateString()}.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/subscription"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Manage Subscription
                    </Link>
                  </div>
                </div>
              )}

            {/* Trial Expired Banner */}
            {showTrialExpired && (
              <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-orange-600 mr-2">⏰</div>
                    <p className="text-sm text-orange-800">
                      Your free trial has ended. Subscribe now to continue accessing all features.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/subscription"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Subscribe Now
                  </Link>
                </div>
              </div>
            )}

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 