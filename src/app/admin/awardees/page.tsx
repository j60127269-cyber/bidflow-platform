'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building,
  MapPin,
  Tag,
  Phone,
  Mail,
  Globe,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';

interface Awardee {
  id: string;
  company_name: string;
  registration_number?: string;
  business_type?: string;
  female_owned?: boolean;
  primary_categories?: string[];
  locations?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  notes?: string; // Changed from description to notes
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AwardeesPage() {
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    business_type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedAwardees, setSelectedAwardees] = useState<Set<string>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Fetch awardees
  const fetchAwardees = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.business_type && { business_type: filters.business_type })
      });

      const response = await fetch(`/api/awardees?${params}`);
      const data = await response.json();

      if (data.success) {
        setAwardees(data.awardees);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching awardees:', data.error);
        alert('Failed to fetch awardees');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch awardees');
    } finally {
      setLoading(false);
    }
  };

  // Delete awardee
  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/awardees/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        alert('Awardee deleted successfully');
        fetchAwardees(pagination.page);
      } else {
        alert(`Failed to delete awardee: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete awardee');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAwardees(1);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchAwardees(1);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ category: '', location: '', business_type: '' });
    setSearchTerm('');
    fetchAwardees(1);
  };

  // Handle individual checkbox selection
  const handleSelectAwardee = (id: string) => {
    setSelectedAwardees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedAwardees.size === awardees.length) {
      setSelectedAwardees(new Set());
    } else {
      setSelectedAwardees(new Set(awardees.map(awardee => awardee.id)));
    }
  };

  // Bulk delete selected awardees
  const handleBulkDelete = async () => {
    if (selectedAwardees.size === 0) {
      alert('Please select awardees to delete');
      return;
    }

    const selectedNames = awardees
      .filter(awardee => selectedAwardees.has(awardee.id))
      .map(awardee => awardee.company_name);

    if (!confirm(`Are you sure you want to delete ${selectedAwardees.size} awardee(s)?\n\nSelected: ${selectedNames.join(', ')}\n\nThis action cannot be undone.`)) {
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const response = await fetch('/api/awardees/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedAwardees) })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully deleted ${data.deletedCount} awardee(s)`);
        setSelectedAwardees(new Set());
        fetchAwardees(pagination.page);
      } else {
        alert(`Failed to delete awardees: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete awardees');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchAwardees();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Awardee Management</h1>
          <p className="text-gray-600">Manage company awardees and their information</p>
        </div>
        <Link
          href="/admin/awardees/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Awardee</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Construction, IT Services"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kampala, Central Region"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  value={filters.business_type}
                  onChange={(e) => handleFilterChange('business_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="non_profit">Non-Profit</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Apply Filters
              </button>
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

      {/* Results Summary and Bulk Actions */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {awardees.length} of {pagination.total} awardees
          {selectedAwardees.size > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({selectedAwardees.size} selected)
            </span>
          )}
        </p>
        
        {selectedAwardees.size > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>
                {bulkDeleteLoading ? 'Deleting...' : `Delete ${selectedAwardees.size} Selected`}
              </span>
            </button>
            <button
              onClick={() => setSelectedAwardees(new Set())}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Awardees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading awardees...</p>
          </div>
        ) : awardees.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No awardees found</p>
            <Link
              href="/admin/awardees/add"
              className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              Add your first awardee
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <button
                        onClick={handleSelectAll}
                        className="mr-3 p-1 hover:bg-gray-200 rounded"
                        title={selectedAwardees.size === awardees.length ? 'Deselect All' : 'Select All'}
                      >
                        {selectedAwardees.size === awardees.length ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      Select
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {awardees.map((awardee) => (
                  <tr key={awardee.id} className={`hover:bg-gray-50 ${selectedAwardees.has(awardee.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleSelectAwardee(awardee.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title={selectedAwardees.has(awardee.id) ? 'Deselect' : 'Select'}
                        >
                          {selectedAwardees.has(awardee.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {awardee.company_name}
                          </div>
                          {awardee.registration_number && (
                            <div className="text-sm text-gray-500">
                              Reg: {awardee.registration_number}
                            </div>
                          )}
                          {awardee.female_owned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 mt-1">
                              Female Owned
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {awardee.business_type ? 
                          awardee.business_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          '-'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {awardee.primary_categories && awardee.primary_categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {awardee.primary_categories.slice(0, 2).map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {category}
                              </span>
                            ))}
                            {awardee.primary_categories.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{awardee.primary_categories.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {awardee.locations && awardee.locations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {awardee.locations.slice(0, 2).map((location, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {location}
                              </span>
                            ))}
                            {awardee.locations.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{awardee.locations.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {awardee.contact_email && (
                          <div className="flex items-center mb-1">
                            <Mail className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{awardee.contact_email}</span>
                          </div>
                        )}
                        {awardee.contact_phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{awardee.contact_phone}</span>
                          </div>
                        )}
                        {!awardee.contact_email && !awardee.contact_phone && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/awardees/${awardee.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/awardees/edit/${awardee.id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(awardee.id, awardee.company_name)}
                          disabled={deleteLoading === awardee.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === awardee.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchAwardees(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchAwardees(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
