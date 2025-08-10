'use client'

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
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
  Star
} from "lucide-react";
import { useState } from "react";

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

  const getUserName = () => {
    if (!user) return "User";
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  };

  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };

  // Navigation items with active state
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard' },
    { name: 'Recommended', href: '/dashboard/recommended', icon: Star, current: pathname === '/dashboard/recommended' },
    { name: 'My Bids', href: '/dashboard/tracking', icon: Target, current: pathname.startsWith('/dashboard/tracking') },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, current: pathname.startsWith('/dashboard/analytics') },
  ];

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
                    placeholder="Search contracts, clients..."
                    className="block w-64 pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-slate-900">{getUserName()}</div>
                      <div className="text-xs text-slate-500">{getUserEmail()}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="text-sm font-medium text-slate-900">{getUserName()}</div>
                        <div className="text-xs text-slate-500">{getUserEmail()}</div>
                      </div>
              <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Profile
              </Link>
                <Link
                  href="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                >
                        <Settings className="mr-3 h-4 w-4" />
                  Settings
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
                placeholder="Search contracts, clients..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-slate-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
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
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
          </main>
      </div>
    </ProtectedRoute>
  );
} 