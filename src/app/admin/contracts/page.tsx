'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Contract } from '@/types/database';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  Calendar,
  DollarSign,
  Building,
  MapPin,
  FileText
} from 'lucide-react';

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedPublishStatus, setSelectedPublishStatus] = useState('All Publish Statuses');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const categories = [
    'All Categories',
    'Construction & Engineering',
    'Information Technology',
    'Logistics & Transportation',
    'Healthcare & Medical',
    'Education & Training',
    'Agriculture & Farming',
    'Manufacturing',
    'Financial Services',
    'Real Estate',
    'Energy & Utilities',
    'Tourism & Hospitality',
    'Media & Communications',
    'Other'
  ];

  const statuses = [
    'All Statuses',
    'Open',
    'Closed',
    'Awarded',
    'Cancelled'
  ];

  const publishStatuses = [
    'All Publish Statuses',
    'Draft',
    'Published',
    'Archived'
  ];

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, selectedCategory, selectedStatus, selectedPublishStatus]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        return;
      }

      setContracts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = contracts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.procuring_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.short_description && contract.short_description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(contract => contract.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All Statuses') {
      filtered = filtered.filter(contract => contract.status === selectedStatus);
    }

    // Publish Status filter
    if (selectedPublishStatus !== 'All Publish Statuses') {
      const publishStatusValue = selectedPublishStatus.toLowerCase();
      filtered = filtered.filter(contract => 
        (contract.publish_status || 'draft').toLowerCase() === publishStatusValue
      );
    }

    setFilteredContracts(filtered);
  };

  const handleDelete = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      setDeleteLoading(contractId);
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);

      if (error) {
        console.error('Error deleting contract:', error);
        alert('Failed to delete contract');
        return;
      }

      // Remove from local state
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete contract');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B ${currency}`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currency}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${value.toLocaleString()} ${currency}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPublishStatusColor = (publishStatus: string) => {
    switch (publishStatus?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800'; // Default to draft
    }
  };

  const handleSelectContract = (contractId: string) => {
    const newSelected = new Set(selectedContracts);
    if (newSelected.has(contractId)) {
      newSelected.delete(contractId);
    } else {
      newSelected.add(contractId);
    }
    setSelectedContracts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContracts.size === filteredContracts.length) {
      setSelectedContracts(new Set());
    } else {
      setSelectedContracts(new Set(filteredContracts.map(c => c.id)));
    }
  };

  const handleBulkPublish = async () => {
    if (selectedContracts.size === 0) return;

    if (!confirm(`Are you sure you want to publish ${selectedContracts.size} contract(s)?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      const contractIds = Array.from(selectedContracts);
      
      const { error } = await supabase
        .from('contracts')
        .update({ 
          publish_status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', contractIds);

      if (error) {
        console.error('Error bulk publishing contracts:', error);
        alert('Failed to publish contracts');
        return;
      }

      // Update local state
      setContracts(prev => prev.map(contract => 
        contractIds.includes(contract.id) 
          ? { ...contract, publish_status: 'published' as const, published_at: new Date().toISOString() }
          : contract
      ));

      setSelectedContracts(new Set());
      alert(`Successfully published ${contractIds.length} contract(s)!`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to publish contracts');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedContracts.size === 0) return;

    if (!confirm(`Are you sure you want to unpublish ${selectedContracts.size} contract(s)? They will be set to draft status.`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      const contractIds = Array.from(selectedContracts);
      
      const { error } = await supabase
        .from('contracts')
        .update({ 
          publish_status: 'draft',
          updated_at: new Date().toISOString()
        })
        .in('id', contractIds);

      if (error) {
        console.error('Error bulk unpublishing contracts:', error);
        alert('Failed to unpublish contracts');
        return;
      }

      // Update local state
      setContracts(prev => prev.map(contract => 
        contractIds.includes(contract.id) 
          ? { ...contract, publish_status: 'draft' as const }
          : contract
      ));

      setSelectedContracts(new Set());
      alert(`Successfully unpublished ${contractIds.length} contract(s)!`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to unpublish contracts');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all contracts in the system
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/contracts/import"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Link>
          <Link
            href="/admin/contracts/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contract
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <select
            value={selectedPublishStatus}
            onChange={(e) => setSelectedPublishStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {publishStatuses.map((publishStatus) => (
              <option key={publishStatus} value={publishStatus}>
                {publishStatus}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredContracts.length} of {contracts.length} contracts
          {selectedContracts.size > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              • {selectedContracts.size} selected
            </span>
          )}
        </p>
      </div>

      {/* Bulk Actions */}
      {selectedContracts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedContracts.size} contract(s) selected
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkPublish}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
              <button
                onClick={handleBulkUnpublish}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Unpublishing...
                  </>
                ) : (
                  'Unpublish'
                )}
              </button>
              <button
                onClick={() => setSelectedContracts(new Set())}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'All Categories' || selectedStatus !== 'All Statuses' || selectedPublishStatus !== 'All Publish Statuses'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first contract'}
            </p>
            {!searchTerm && selectedCategory === 'All Categories' && selectedStatus === 'All Statuses' && selectedPublishStatus === 'All Publish Statuses' && (
              <div className="mt-6">
                <Link
                  href="/admin/contracts/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contract
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Select All Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filteredContracts.length > 0 && selectedContracts.size === filteredContracts.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Select all ({filteredContracts.length})
                </label>
              </div>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <li key={contract.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedContracts.has(contract.id)}
                          onChange={() => handleSelectContract(contract.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {contract.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPublishStatusColor(contract.publish_status || 'draft')}`}>
                                {(contract.publish_status || 'draft').charAt(0).toUpperCase() + (contract.publish_status || 'draft').slice(1)}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                                {contract.status}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {contract.procuring_entity}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {contract.competition_level.replace('_', ' ')}
                                </span>
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p>
                                Deadline: {formatDate(contract.submission_deadline)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {contract.category}
                                </span>
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p className="font-medium text-gray-900">
                                {contract.estimated_value_min && contract.estimated_value_max 
                                  ? `${formatCurrency(contract.estimated_value_min, contract.currency)} - ${formatCurrency(contract.estimated_value_max, contract.currency)}`
                                  : 'Value not specified'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0 flex space-x-2">
                        <Link
                          href={`/admin/contracts/edit/${contract.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(contract.id)}
                          disabled={deleteLoading === contract.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleteLoading === contract.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
