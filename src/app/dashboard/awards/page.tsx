'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, Building2, MapPin } from 'lucide-react';

interface Award {
  id: string;
  title: string;
  reference_number: string;
  status: string;
  award_date: string;
  contract_value: number;
  awarded_company_name: string;
  agency_name: string;
  location: string;
  description: string;
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('award_date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/contracts');
      if (response.ok) {
        const data = await response.json();
        setAwards(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAwards = awards
    .filter(award => {
      const matchesSearch = award.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           award.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           award.awarded_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           award.agency_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || award.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Award];
      let bValue = b[sortBy as keyof Award];
      
      if (sortBy === 'award_date') {
        aValue = new Date(a.award_date).getTime();
        bValue = new Date(b.award_date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'awarded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading awards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Awards</h1>
          <p className="mt-2 text-gray-600">
            Track and analyze all contract awards and their details
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search awards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="awarded">Awarded</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="award_date">Award Date</option>
              <option value="contract_value">Contract Value</option>
              <option value="title">Title</option>
              <option value="reference_number">Reference Number</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAwards.map((award) => (
            <div key={award.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {award.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {award.reference_number}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(award.status)}`}>
                    {award.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {/* Award Date */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(award.award_date)}</span>
                  </div>

                  {/* Contract Value */}
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{formatCurrency(award.contract_value)}</span>
                  </div>

                  {/* Awarded Company */}
                  {award.awarded_company_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">{award.awarded_company_name}</span>
                    </div>
                  )}

                  {/* Agency */}
                  {award.agency_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">{award.agency_name}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {award.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {award.description}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAwards.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Calendar className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No awards found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No awards have been recorded yet.'
              }
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Awards</p>
                <p className="text-2xl font-semibold text-gray-900">{awards.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(awards.reduce((sum, award) => sum + award.contract_value, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique Companies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(awards.filter(a => a.awarded_company_name).map(a => a.awarded_company_name)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique Agencies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(awards.filter(a => a.agency_name).map(a => a.agency_name)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
