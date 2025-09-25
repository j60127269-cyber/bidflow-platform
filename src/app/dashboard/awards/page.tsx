'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Building2, Award, ChevronDown, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface Award {
  id: string;
  title: string;
  reference_number: string;
  status: string;
  estimated_value: number;
  award_date: string;
  awarded_company_id: string;
  awarded_company_name?: string;
  description: string;
  created_at: string;
  procuring_entity?: string;
}

interface AwardsAnalytics {
  totalAwards: number;
  totalValue: number;
  topAwardees: Array<{
    company_name: string;
    award_count: number;
    total_value: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [analytics, setAnalytics] = useState<AwardsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('award_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(17);

  useEffect(() => {
    fetchAwards();
    fetchAnalytics();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy, sortOrder]);

  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/contracts?awarded=true');
      if (response.ok) {
        const data = await response.json();
        setAwards(data.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/awards/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const filteredAwards = awards.filter(award => {
    const matchesSearch = award.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         award.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         award.awarded_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         award.procuring_entity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || award.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedAwards = [...filteredAwards].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'award_date':
        aValue = new Date(a.award_date).getTime();
        bValue = new Date(b.award_date).getTime();
        break;
      case 'estimated_value':
        aValue = a.estimated_value || 0;
        bValue = b.estimated_value || 0;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'reference_number':
        aValue = a.reference_number.toLowerCase();
        bValue = b.reference_number.toLowerCase();
        break;
      default:
        aValue = a.award_date;
        bValue = b.award_date;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedAwards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAwards = sortedAwards.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'UGX 0';
    
    // Add K, M, B suffixes for better readability
    if (amount >= 1000000000) {
      return `UGX ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `UGX ${(amount / 1000).toFixed(1)}K`;
    }
    
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-10 bg-gray-200 rounded w-64 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-full mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="h-10 bg-gray-200 rounded w-80"></div>
              <div className="flex space-x-3">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-28"></div>
                  <div className="h-10 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
            
            {/* Table Skeleton */}
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-36"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Contract Awards</h1>
              <p className="mt-3 text-lg text-gray-600">
                Track and analyze contract awards and market trends
              </p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Awards</p>
                <p className="mt-1 text-3xl font-bold text-blue-600">
                  {analytics?.totalAwards || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Value</p>
                <p className="mt-1 text-3xl font-bold text-green-600">
                  {formatCurrency(analytics?.totalValue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Left side - Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Add Filters Button */}
              <button className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Add Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              {/* Sort Button */}
              <button className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>

          </div>

          {/* Keywords Filter */}
          {searchTerm && (
            <div className="mt-6 flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Keywords:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Awards Table */}
      <div className="max-w-full mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          {/* Awards Table */}
          {sortedAwards.length === 0 ? (
            <div className="text-center py-16">
              <Award className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No awards found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters to find more results.'
                  : 'No contracts have been awarded yet. Check back later for updates.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contract ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Awardee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Procuring Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Awarded Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Award Date
                    </th>
                  </tr>
                </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedAwards.map((award) => (
                    <tr key={award.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-5">
                        <div>
                          <Link
                            href={`/dashboard/contracts/${award.id}`}
                            className="text-sm font-semibold flex items-center group transition-colors"
                            style={{ color: '#4392F1' }}
                            onMouseEnter={(e) => e.target.style.color = '#2B7CE6'}
                            onMouseLeave={(e) => e.target.style.color = '#4392F1'}
                          >
                            {award.reference_number}
                            <svg className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                          <div className="text-xs text-gray-500 mt-1 font-normal leading-relaxed">
                            {award.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <Link
                            href={`/dashboard/awardees/${encodeURIComponent((award.awarded_company_name || 'Unknown Company').toLowerCase().replace(/\s+/g, '-'))}`}
                            className="text-sm font-medium transition-colors"
                            style={{ color: '#4392F1' }}
                            onMouseEnter={(e) => e.target.style.color = '#2B7CE6'}
                            onMouseLeave={(e) => e.target.style.color = '#4392F1'}
                          >
                            {award.awarded_company_name || 'Unknown Company'}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8 mt-0.5">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <Link
                              href={`/dashboard/agencies/${encodeURIComponent(award.procuring_entity || 'BidFlow Platform')}`}
                              className="text-sm font-medium transition-colors leading-relaxed"
                              style={{ color: '#4392F1' }}
                              onMouseEnter={(e) => e.target.style.color = '#2B7CE6'}
                              onMouseLeave={(e) => e.target.style.color = '#4392F1'}
                            >
                              {award.procuring_entity || 'BidFlow Platform'}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(award.estimated_value || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(award.award_date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{startIndex + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedAwards.length)}</span>
                    {' '}of{' '}
                    <span className="font-medium">{sortedAwards.length}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* First Page Button */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">First</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Next Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Last Page Button */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Last</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
