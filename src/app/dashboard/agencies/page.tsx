'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Building, MapPin, DollarSign, FileText, TrendingUp, ChevronDown, Globe } from 'lucide-react';
import Link from 'next/link';

interface ProcuringEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  parent_entity_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_contracts?: number;
  total_value?: number;
  recent_contracts?: number;
}

interface ProcuringEntityStats {
  totalAgencies: number;
  totalValue: number;
  averageValue: number;
  topAgencies: Array<{
    name: string;
    value: number;
    contracts: number;
  }>;
}

export default function AgenciesPage() {
  const [procuringEntities, setProcuringEntities] = useState<ProcuringEntity[]>([]);
  const [stats, setStats] = useState<ProcuringEntityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('entity_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(17);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    entity_type: '',
    country: '',
    is_active: ''
  });

  useEffect(() => {
    fetchProcuringEntities();
    fetchStats();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, filters]);

  const fetchProcuringEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/procuring-entities?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setProcuringEntities(data.procuringEntities || []);
      }
    } catch (error) {
      console.error('Error fetching procuring entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/procuring-entities/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredProcuringEntities = procuringEntities.filter(entity => {
    const matchesSearch = entity.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.website?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.entity_type || entity.entity_type === filters.entity_type) &&
      (!filters.country || entity.country === filters.country) &&
      (!filters.is_active || entity.is_active.toString() === filters.is_active);
    
    return matchesSearch && matchesFilters;
  });

  const sortedProcuringEntities = [...filteredProcuringEntities].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'entity_name':
        aValue = a.entity_name.toLowerCase();
        bValue = b.entity_name.toLowerCase();
        break;
      case 'entity_type':
        aValue = a.entity_type.toLowerCase();
        bValue = b.entity_type.toLowerCase();
        break;
      case 'total_value':
        aValue = a.total_value || 0;
        bValue = b.total_value || 0;
        break;
      case 'total_contracts':
        aValue = a.total_contracts || 0;
        bValue = b.total_contracts || 0;
        break;
      case 'city':
        aValue = a.city?.toLowerCase() || '';
        bValue = b.city?.toLowerCase() || '';
        break;
      default:
        aValue = a.entity_name.toLowerCase();
        bValue = b.entity_name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedProcuringEntities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProcuringEntities = sortedProcuringEntities.slice(startIndex, endIndex);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ entity_type: '', country: '', is_active: '' });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Procuring Entities</h1>
          <p className="text-gray-800 mt-2">Explore government agencies and their procurement activities</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-black truncate">Total Procuring Entities</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalAgencies}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-black truncate">Total Awards Value</dt>
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
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-black truncate">Average Value</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.averageValue)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-black truncate">Active Agencies</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {procuringEntities.filter(e => e.is_active).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agencies by name or website..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              <button
                onClick={() => handleSort('entity_name')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sort by Name
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Entity Type
                  </label>
                  <select
                    value={filters.entity_type}
                    onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="ministry">Ministry</option>
                    <option value="department">Department</option>
                    <option value="agency">Agency</option>
                    <option value="authority">Authority</option>
                    <option value="commission">Commission</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Country
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Countries</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Status
                  </label>
                  <select
                    value={filters.is_active}
                    onChange={(e) => handleFilterChange('is_active', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-800">
            Showing {paginatedProcuringEntities.length} of {sortedProcuringEntities.length} procuring entities
          </p>
        </div>

        {/* Agencies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-800">Loading procuring entities...</p>
            </div>
          ) : paginatedProcuringEntities.length === 0 ? (
            <div className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-800">No procuring entities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Total Awards
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProcuringEntities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-bold text-blue-700">
                                {entity.entity_name?.charAt(0) || 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Link
                              href={`/dashboard/agencies/${encodeURIComponent(entity.entity_name.toLowerCase().replace(/\s+/g, '-'))}`}
                              className="text-sm font-medium transition-colors"
                              style={{ color: '#4392F1' }}
                              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#2B7CE6'}
                              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#4392F1'}
                            >
                              {entity.entity_name}
                            </Link>
                            {entity.parent_entity_id && (
                              <p className="text-xs text-black mt-1">
                                Parent: {entity.parent_entity_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entity.website ? (
                            <a 
                              href={entity.website.startsWith('http') ? entity.website : `https://${entity.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Globe className="h-4 w-4 mr-1" />
                              {entity.website}
                            </a>
                          ) : (
                            <span className="text-black">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(entity.total_value || 0)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-black">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
