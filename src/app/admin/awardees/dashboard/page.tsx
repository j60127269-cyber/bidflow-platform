'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  TrendingUp, 
  Users, 
  MapPin, 
  Tag, 
  Plus,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react';

interface AwardeeStats {
  total: number;
  byBusinessType: Record<string, number>;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
  femaleOwned: number;
}

interface RecentAwardee {
  id: string;
  company_name: string;
  business_type?: string;
  created_at: string;
}

export default function AwardeeDashboardPage() {
  const [stats, setStats] = useState<AwardeeStats | null>(null);
  const [recentAwardees, setRecentAwardees] = useState<RecentAwardee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/awardees/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Fetch recent awardees
        const recentResponse = await fetch('/api/awardees?limit=5&page=1');
        const recentData = await recentResponse.json();
        
        if (recentData.success) {
          setRecentAwardees(recentData.awardees);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Awardee Dashboard</h1>
          <p className="text-gray-600">Overview of awardee management and statistics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/awardees"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            <span>View All</span>
          </Link>
          <Link
            href="/admin/awardees/add"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Awardee</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Awardees</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Female Owned</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.femaleOwned || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats?.byCategory || {}).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats?.byLocation || {}).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Types Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Business Types
          </h2>
          {stats?.byBusinessType && Object.keys(stats.byBusinessType).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byBusinessType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(stats.byBusinessType))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No business type data available</p>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Top Categories
          </h2>
          {stats?.byCategory && Object.keys(stats.byCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byCategory)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(stats.byCategory))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No category data available</p>
          )}
        </div>
      </div>

      {/* Recent Awardees */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Awardees</h2>
            <Link
              href="/admin/awardees"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentAwardees.length > 0 ? (
            <div className="space-y-4">
              {recentAwardees.map((awardee) => (
                <div key={awardee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{awardee.company_name}</h3>
                      {awardee.business_type && (
                        <p className="text-xs text-gray-500">
                          {awardee.business_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{formatDate(awardee.created_at)}</span>
                    <Link
                      href={`/admin/awardees/${awardee.id}`}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/awardees/edit/${awardee.id}`}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No awardees found</p>
              <Link
                href="/admin/awardees/add"
                className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Add your first awardee
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
