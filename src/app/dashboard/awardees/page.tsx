'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, MapPin, Phone, Mail, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';

interface Awardee {
  id: string;
  company_name: string;
  business_type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function AwardeesPage() {
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');

  useEffect(() => {
    fetchAwardees();
  }, []);

  const fetchAwardees = async () => {
    try {
      const response = await fetch('/api/awardees');
      if (response.ok) {
        const data = await response.json();
        setAwardees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching awardees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAwardees = awardees.filter(awardee => {
    const matchesSearch = awardee.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         awardee.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         awardee.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         awardee.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBusinessType = businessTypeFilter === 'all' || awardee.business_type === businessTypeFilter;
    
    return matchesSearch && matchesBusinessType;
  });

  const getBusinessTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'corporation':
        return 'bg-blue-100 text-blue-800';
      case 'llc':
        return 'bg-green-100 text-green-800';
      case 'partnership':
        return 'bg-purple-100 text-purple-800';
      case 'sole_proprietorship':
        return 'bg-yellow-100 text-yellow-800';
      case 'limited_company':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading awardees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Awardees</h1>
            <p className="mt-2 text-gray-600">
              Manage and track all awardee companies and their information
            </p>
          </div>
          <Link
            href="/admin/awardees/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Awardee
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search awardees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Business Type Filter */}
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Business Types</option>
              <option value="corporation">Corporation</option>
              <option value="llc">LLC</option>
              <option value="partnership">Partnership</option>
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="limited_company">Limited Company</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-500">
              <span>{filteredAwardees.length} of {awardees.length} awardees</span>
            </div>
          </div>
        </div>

        {/* Awardees Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAwardees.map((awardee) => (
            <div key={awardee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {awardee.company_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {awardee.business_type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBusinessTypeColor(awardee.business_type)}`}>
                    {awardee.business_type.replace('_', ' ')}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{awardee.address}</p>
                      <p>{awardee.city}, {awardee.state} {awardee.zip_code}</p>
                      <p>{awardee.country}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {awardee.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{awardee.phone}</span>
                    </div>
                  )}

                  {/* Email */}
                  {awardee.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{awardee.email}</span>
                    </div>
                  )}

                  {/* Website */}
                  {awardee.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={awardee.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        {awardee.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {awardee.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {awardee.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  <Link
                    href={`/admin/awardees/${awardee.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/admin/awardees/edit/${awardee.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAwardees.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Building2 className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No awardees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || businessTypeFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No awardees have been added yet.'
              }
            </p>
            {!searchTerm && businessTypeFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/admin/awardees/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Awardee
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Awardees</p>
                <p className="text-2xl font-semibold text-gray-900">{awardees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique States</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(awardees.map(a => a.state)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">With Contact Info</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {awardees.filter(a => a.phone || a.email).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExternalLink className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">With Websites</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {awardees.filter(a => a.website).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
