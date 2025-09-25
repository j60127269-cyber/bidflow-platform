'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Building2, Award, ChevronDown, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface Awardee {
  id: string;
  company_name: string;
  registration_number?: string;
  business_type?: string;
  country?: string;
  founded_year?: number;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  total_awarded_value?: number;
  total_contracts?: number;
}

interface AwardeeStats {
  totalAwardees: number;
  totalValue: number;
  averageValue: number;
  topAwardees: Array<{
    company_name: string;
    total_contracts: number;
    total_value: number;
  }>;
}

export default function AwardeesPage() {
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [stats, setStats] = useState<AwardeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('company_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(17);

  useEffect(() => {
    fetchAwardees();
    fetchStats();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const fetchAwardees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/awardees?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setAwardees(data.awardees || []);
      }
    } catch (error) {
      console.error('Error fetching awardees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/awardees/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredAwardees = awardees.filter(awardee => {
    const matchesSearch = awardee.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         awardee.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedAwardees = [...filteredAwardees].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'company_name':
        aValue = a.company_name.toLowerCase();
        bValue = b.company_name.toLowerCase();
        break;
      case 'total_awarded_value':
        aValue = a.total_awarded_value || 0;
        bValue = b.total_awarded_value || 0;
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        aValue = a.company_name.toLowerCase();
        bValue = b.company_name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedAwardees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAwardees = sortedAwardees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'UGX 0';
    
    if (amount >= 1000000000) {
      return `UGX ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `UGX ${(amount / 1000).toFixed(1)}K`;
    }
    
    return `UGX ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Awardees</h1>
          <p className="mt-2 text-lg text-gray-800">
            Companies and organizations that have received contract awards
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-700 truncate">Total Awardees</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalAwardees}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Award className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-700 truncate">Total Value</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalValue)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-700 truncate">Average Value</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.averageValue)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* Left side - Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                     placeholder="Search by Company Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-3">
                {/* Add Filters Button */}
                <button className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filters
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>

                 {/* Sort Button */}
                 <button 
                   onClick={() => setSortBy(sortBy === 'company_name' ? 'total_awarded_value' : 'company_name')}
                   className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                 >
                   <ArrowUpDown className="h-4 w-4 mr-2" />
                   Sort by {sortBy === 'company_name' ? 'Name' : 'Value'}
                   <ChevronDown className="h-4 w-4 ml-2" />
                 </button>
              </div>
            </div>
          </div>

          {/* Keywords Filter */}
          {searchTerm && (
            <div className="mt-6 flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-800">Keywords:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Awardees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {sortedAwardees.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No awardees found</h3>
              <p className="mt-1 text-sm text-gray-700">
                {searchTerm ? 'Try adjusting your search terms.' : 'No awardees have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                       Company Name
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                       Total Awards Value
                     </th>
                   </tr>
                 </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAwardees.map((awardee) => (
                    <tr key={awardee.id} className="hover:bg-gray-50 transition-colors duration-150">
                       <td className="px-6 py-5">
                         <div className="flex items-center">
                           <div className="flex-shrink-0 h-10 w-10">
                             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                               <span className="text-sm font-bold text-blue-700">
                                 {awardee.company_name?.charAt(0) || 'A'}
                               </span>
                             </div>
                           </div>
                           <div className="ml-4">
                             <Link
                               href={`/dashboard/awardees/${encodeURIComponent(awardee.company_name.toLowerCase().replace(/\s+/g, '-'))}`}
                               className="text-sm font-medium transition-colors"
                               style={{ color: '#4392F1' }}
                               onMouseEnter={(e) => e.target.style.color = '#2B7CE6'}
                               onMouseLeave={(e) => e.target.style.color = '#4392F1'}
                             >
                               {awardee.company_name}
                             </Link>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">
                           {formatCurrency(awardee.total_awarded_value || 0)}
                         </div>
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
                    <span className="font-medium">{Math.min(endIndex, sortedAwardees.length)}</span>
                    {' '}of{' '}
                    <span className="font-medium">{sortedAwardees.length}</span>
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
