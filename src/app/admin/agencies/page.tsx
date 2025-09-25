'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Building, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign,
  ChevronDown,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface Agency {
  id: string;
  entity_name: string;
  entity_type: string;
  parent_entity_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  is_active: boolean;
  data_source?: string;
  created_at: string;
  updated_at: string;
  total_contracts?: number;
  total_value?: number;
  recent_contracts?: number;
}

interface AgencyStats {
  totalAgencies: number;
  activeAgencies: number;
  totalValue: number;
  totalContracts: number;
  averageValue: number;
  topAgencies: Array<{
    name: string;
    value: number;
    contracts: number;
  }>;
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('entity_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    entity_type: '',
    country: '',
    is_active: '',
    data_source: ''
  });
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchAgencies();
    fetchStats();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, filters]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/procuring-entities?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setAgencies(data.procuringEntities || []);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
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

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.entity_type || agency.entity_type === filters.entity_type) &&
      (!filters.country || agency.country === filters.country) &&
      (!filters.is_active || agency.is_active.toString() === filters.is_active) &&
      (!filters.data_source || agency.data_source === filters.data_source);
    
    return matchesSearch && matchesFilters;
  });

  const sortedAgencies = [...filteredAgencies].sort((a, b) => {
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
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
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

  const totalPages = Math.ceil(sortedAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencies = sortedAgencies.slice(startIndex, endIndex);

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
    setFilters({ entity_type: '', country: '', is_active: '', data_source: '' });
    setSearchTerm('');
  };

  const handleSelectAgency = (agencyId: string) => {
    const newSelected = new Set(selectedAgencies);
    if (newSelected.has(agencyId)) {
      newSelected.delete(agencyId);
    } else {
      newSelected.add(agencyId);
    }
    setSelectedAgencies(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedAgencies.size === paginatedAgencies.length) {
      setSelectedAgencies(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(paginatedAgencies.map(agency => agency.id));
      setSelectedAgencies(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAgencies.size === 0) return;

    try {
      if (bulkAction === 'activate') {
        // Activate selected agencies
        const { error } = await supabase
          .from('procuring_entities')
          .update({ is_active: true })
          .in('id', Array.from(selectedAgencies));

        if (error) throw error;
      } else if (bulkAction === 'deactivate') {
        // Deactivate selected agencies
        const { error } = await supabase
          .from('procuring_entities')
          .update({ is_active: false })
          .in('id', Array.from(selectedAgencies));

        if (error) throw error;
      } else if (bulkAction === 'delete') {
        // Delete selected agencies (with confirmation)
        if (confirm(`Are you sure you want to delete ${selectedAgencies.size} agencies? This action cannot be undone.`)) {
          const { error } = await supabase
            .from('procuring_entities')
            .delete()
            .in('id', Array.from(selectedAgencies));

          if (error) throw error;
        }
      }

      // Refresh data
      await fetchAgencies();
      setSelectedAgencies(new Set());
      setShowBulkActions(false);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Procuring Entities Management</h1>
              <p className="text-gray-600 mt-2">Manage government agencies and their procurement data</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAgencies}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/admin/agencies/add"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Procuring Entity
              </Link>
            </div>
          </div>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Procuring Entities</dt>
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
                    <CheckCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Procuring Entities</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeAgencies}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
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
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Contracts</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalContracts}</dd>
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
                  placeholder="Search agencies by name, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <option value="government_entity">Government Entity</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Source
                  </label>
                  <select
                    value={filters.data_source}
                    onChange={(e) => handleFilterChange('data_source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sources</option>
                    <option value="migration">Migration</option>
                    <option value="manual">Manual</option>
                    <option value="scraper">Scraper</option>
                    <option value="government_csv">Government CSV</option>
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

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-800">
                  {selectedAgencies.size} agencies selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setSelectedAgencies(new Set());
                    setShowBulkActions(false);
                    setBulkAction('');
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {paginatedAgencies.length} of {sortedAgencies.length} agencies
          </p>
        </div>

        {/* Agencies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading agencies...</p>
            </div>
          ) : paginatedAgencies.length === 0 ? (
            <div className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No agencies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAgencies.size === paginatedAgencies.length && paginatedAgencies.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contracts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAgencies.map((agency) => (
                    <tr 
                      key={agency.id} 
                      className={`hover:bg-gray-50 ${selectedAgencies.has(agency.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAgencies.has(agency.id)}
                          onChange={() => handleSelectAgency(agency.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-bold text-blue-700">
                                {agency.entity_name?.charAt(0) || 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {agency.entity_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {agency.data_source || 'Unknown source'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {agency.entity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {agency.city && agency.country ? `${agency.city}, ${agency.country}` : agency.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(agency.total_value || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {agency.total_contracts || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agency.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {agency.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/agencies/${encodeURIComponent(agency.entity_name.toLowerCase().replace(/\s+/g, '-'))}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/agencies/edit/${agency.id}`}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this agency?')) {
                                // Handle delete
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
            <div className="text-sm text-gray-700">
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
