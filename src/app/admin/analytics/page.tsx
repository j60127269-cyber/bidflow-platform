'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeSubscriptions: number;
  totalContracts: number;
  totalValue: number;
  monthlyGrowth: number;
  topCategories: { category: string; count: number }[];
  recentActivity: any[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalContracts: 0,
    totalValue: 0,
    monthlyGrowth: 0,
    topCategories: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [usersResult, contractsResult, subscriptionsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('subscriptions').select('*').eq('status', 'active')
      ]);

      if (usersResult.error || contractsResult.error || subscriptionsResult.error) {
        console.error('Error fetching analytics:', { 
          usersError: usersResult.error, 
          contractsError: contractsResult.error, 
          subscriptionsError: subscriptionsResult.error 
        });
        return;
      }

      const users = usersResult.data || [];
      const contracts = contractsResult.data || [];
      const subscriptions = subscriptionsResult.data || [];

      // Calculate metrics
      const totalValue = contracts.reduce((sum, contract) => sum + (contract.value || 0), 0);
      
      // Calculate monthly growth (simplified)
      const currentMonth = new Date().getMonth();
      const lastMonth = new Date().getMonth() - 1;
      const currentMonthUsers = users.filter(user => new Date(user.created_at).getMonth() === currentMonth).length;
      const lastMonthUsers = users.filter(user => new Date(user.created_at).getMonth() === lastMonth).length;
      const monthlyGrowth = lastMonthUsers > 0 ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

      // Top categories
      const categoryCounts: { [key: string]: number } = {};
      contracts.forEach(contract => {
        const category = contract.category || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent activity (last 10 users and contracts)
      const recentUsers = users.slice(0, 5);
      const recentContracts = contracts.slice(0, 5);
      const recentActivity = [
        ...recentUsers.map(user => ({ type: 'user', data: user, date: user.created_at })),
        ...recentContracts.map(contract => ({ type: 'contract', data: contract, date: contract.created_at }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      setData({
        totalUsers: users.length,
        activeSubscriptions: subscriptions.length,
        totalContracts: contracts.length,
        totalValue,
        monthlyGrowth,
        topCategories,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K UGX`;
    }
    return `${value} UGX`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Platform insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Contracts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.totalContracts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatValue(data.totalValue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Growth
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.monthlyGrowth > 0 ? '+' : ''}{data.monthlyGrowth.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Contract Categories
            </h3>
            <div className="space-y-3">
              {data.topCategories.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">{item.count} contracts</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...data.topCategories.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Subscription Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Active Subscriptions</span>
                </div>
                <span className="text-sm text-gray-500">{data.activeSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">No Subscription</span>
                </div>
                <span className="text-sm text-gray-500">{data.totalUsers - data.activeSubscriptions}</span>
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Conversion Rate</span>
                  <span className="font-medium text-gray-900">
                    {data.totalUsers > 0 ? ((data.activeSubscriptions / data.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'user' ? (
                      <Users className="h-5 w-5 text-blue-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'user' 
                        ? `New user registered: ${activity.data.email}`
                        : `New contract posted: ${activity.data.title}`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium opacity-75 truncate">
                  Average Contract Value
                </dt>
                <dd className="text-lg font-medium">
                  {data.totalContracts > 0 ? formatValue(data.totalValue / data.totalContracts) : '0 UGX'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PieChart className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium opacity-75 truncate">
                  User Engagement
                </dt>
                <dd className="text-lg font-medium">
                  {data.totalUsers > 0 ? ((data.activeSubscriptions / data.totalUsers) * 100).toFixed(1) : 0}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium opacity-75 truncate">
                  Platform Health
                </dt>
                <dd className="text-lg font-medium">
                  {data.totalContracts > 0 && data.totalUsers > 0 ? 'Good' : 'Needs Data'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
