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
  Target,
  User,
  Star,
  CreditCard,
  AlertCircle,
  Building,
  Trophy,
  List
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
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


  // Show upgrade prompt if user doesn't have active subscription
  const showUpgradePrompt = subscriptionStatus &&
    subscriptionStatus.status !== 'active' &&
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
      <div className="min-h-screen bg-gray-50">
        {/* Top Header Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left Side - Logo */}
              <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">BIDFLOW</h1>
              </Link>
            </div>

            {/* Middle - Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name or ID"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              </div>

            {/* Right Side - Actions */}
              <div className="flex items-center space-x-4">
              {/* Chat */}
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs">💬</span>
                </div>
                <span className="text-sm">Off</span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Settings className="h-5 w-5" />
              </button>

              {/* Subscribe Button */}
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Subscribe
                <span className="ml-2 text-xs bg-purple-500 px-2 py-1 rounded-full">
                  6 Days Left
                </span>
                </button>

              {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                  </button>

                  {userMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user?.email}</div>
                        <div className="text-xs text-gray-500">
                          {subscriptionStatus?.status === 'active' ? 'Active Subscription' :
                           subscriptionStatus?.status === 'trial' ? 'Free Trial' :
                           'No Subscription'}
                        </div>
                      </div>
              <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
              >
                        Profile Settings
              </Link>
              <Link
                        href="/dashboard/subscription"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Subscription
                </Link>
              <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Panel
                </Link>
                <button 
                  onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
                  )}
        </div>
                </div>
              </div>
        </header>

                     {/* Upgrade Prompt */}
             {showUpgradePrompt && (
               <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                 <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                   <div className="flex items-start sm:items-center min-w-0 flex-1">
                     <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                     <p className="text-sm text-yellow-800 break-words">
                       Upgrade to Professional Plan to unlock all features and unlimited access.
                     </p>
                   </div>
                   <Link
                     href="/dashboard/subscription"
                     className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 text-center"
                   >
                     Upgrade Now
                   </Link>
                 </div>
               </div>
             )}

        <div className="flex">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex flex-col h-full">
              {/* Mobile close button */}
              <div className="lg:hidden flex justify-end p-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="flex-1 overflow-y-auto">
                {/* Contract Opportunities */}
                <div className="p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Opportunities
                  </div>
                  
                  {/* Contracts */}
                  <div className="mb-2">
                    <Link
                      href="/dashboard/contracts"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/contracts' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <List className="h-4 w-4" />
                      <span>Contracts</span>
                    </Link>
                  </div>

                </div>

                {/* Main Navigation */}
                <div className="p-4 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Main
                  </div>
                  
                  {/* Dashboard */}
                  <div className="mb-2">
              <Link
                href="/dashboard"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
              </Link>
                  </div>

                  {/* Recommended */}
                  <div className="mb-2">
              <Link
                href="/dashboard/recommended"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/recommended' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                      <Star className="h-4 w-4" />
                      <span>Recommended</span>
              </Link>
                  </div>

                  {/* My Tracking */}
                  <div className="mb-2">
              <Link
                href="/dashboard/tracking"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/tracking' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Target className="h-4 w-4" />
                      <span>My Tracking</span>
                    </Link>
                  </div>

                  {/* Analytics */}
                  <div className="mb-6">
                    <Link
                      href="/dashboard/analytics"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/analytics' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                  </div>
                </div>

                {/* Market Intelligence */}
                <div className="p-4 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Market Intelligence
                  </div>
                  
                  {/* Awardees */}
                  <div className="mb-2">
                    <Link
                      href="/dashboard/awardees"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/awardees' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Awardees</span>
                    </Link>
                  </div>

                  {/* Agencies */}
                  <div className="mb-2">
                    <Link
                      href="/dashboard/agencies"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/agencies' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Building className="h-4 w-4" />
                      <span>Procuring Agencies</span>
                    </Link>
                  </div>

                  {/* Competitive Analysis */}
                  <div className="mb-6">
                    <Link
                      href="/dashboard/competitive"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/competitive' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Competitive Analysis</span>
              </Link>
                  </div>
                </div>

                {/* Account & Settings */}
                <div className="p-4 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Account
                  </div>
                  
                  <div className="space-y-1">
              <Link
                href="/dashboard/profile"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/profile' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/subscription"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/subscription' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                    <Link
                      href="/dashboard/notifications"
                      className={`flex items-center space-x-2 p-2 rounded-md text-sm font-medium ${
                        pathname === '/dashboard/notifications' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
              </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-6">
              {children}
          </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 