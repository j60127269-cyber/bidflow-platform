'use client'

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
  Bell as BellIcon
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile sidebar overlay */}
        <div className="fixed inset-0 z-40 lg:hidden" style={{ display: 'none' }}>
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75"></div>
        </div>

        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform -translate-x-full lg:translate-x-0 lg:static lg:inset-0">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">BidFlow</h1>
            </Link>
            <button className="lg:hidden">
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <nav className="mt-8 px-4">
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/contracts"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <FileText className="mr-3 h-5 w-5" />
                Contracts
              </Link>
              <Link
                href="/dashboard/tracking"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Target className="mr-3 h-5 w-5" />
                Track Bids
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Analytics
              </Link>
              <Link
                href="/dashboard/calendar"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Calendar className="mr-3 h-5 w-5" />
                Calendar
              </Link>
              <Link
                href="/dashboard/team"
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Users className="mr-3 h-5 w-5" />
                Team
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="space-y-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button className="lg:hidden mr-4">
                  <Menu className="h-6 w-6 text-slate-400" />
                </button>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-slate-900">{getUserName()}</div>
                    <div className="text-xs text-slate-500">{getUserEmail()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 