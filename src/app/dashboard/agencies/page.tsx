'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, MapPin, Phone, Mail, ExternalLink, Calendar, DollarSign } from 'lucide-react';

interface Agency {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface AgencyStats {
  total_contracts: number;
  total_value: number;
  average_contract_value: number;
  last_contract_date: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyStats, setAgencyStats] = useState<Record<string, AgencyStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      // For now, we'll create mock data since we don't have an agencies API yet
      // In a real implementation, you'd fetch from /api/agencies
      const mockAgencies: Agency[] = [
        {
          id: '1',
          name: 'Department of Defense',
          type: 'Federal',
          address: '1000 Defense Pentagon',
          city: 'Washington',
          state: 'DC',
          zip_code: '20301',
          country: 'USA',
          phone: '(703) 571-3343',
          email: 'info@defense.gov',
          website: 'https://www.defense.gov',
          description: 'The Department of Defense is responsible for providing the military forces needed to deter war and protect the security of our country.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'General Services Administration',
          type: 'Federal',
          address: '1800 F Street NW',
          city: 'Washington',
          state: 'DC',
          zip_code: '20405',
          country: 'USA',
          phone: '(202) 501-0800',
          email: 'info@gsa.gov',
          website: 'https://www.gsa.gov',
          description: 'GSA provides centralized procurement for the federal government, offering billions of dollars worth of products, services, and facilities.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'California Department of Transportation',
          type: 'State',
          address: '1120 N Street',
          city: 'Sacramento',
          state: 'CA',
          zip_code: '95814',
          country: 'USA',
          phone: '(916) 654-2852',
          email: 'info@dot.ca.gov',
          website: 'https://www.dot.ca.gov',
          description: 'Caltrans is responsible for planning, designing, building, and maintaining the state highway system.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setAgencies(mockAgencies);

      // Mock stats - in real implementation, fetch from API
      const mockStats: Record<string, AgencyStats> = {
        '1': {
          total_contracts: 45,
          total_value: 125000000,
          average_contract_value: 2777777,
          last_contract_date: '2024-01-15',
        },
        '2': {
          total_contracts: 32,
          total_value: 89000000,
          average_contract_value: 2781250,
          last_contract_date: '2024-01-20',
        },
        '3': {
          total_contracts: 28,
          total_value: 67000000,
          average_contract_value: 2392857,
          last_contract_date: '2024-01-18',
        },
      };

      setAgencyStats(mockStats);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || agency.type === typeFilter;
    
    return matchesSearch && matchesType;
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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'federal':
        return 'bg-blue-100 text-blue-800';
      case 'state':
        return 'bg-green-100 text-green-800';
      case 'local':
        return 'bg-purple-100 text-purple-800';
      case 'municipal':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agencies</h1>
          <p className="mt-2 text-gray-600">
            Track and analyze government agencies and their contracting activity
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search agencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Federal">Federal</option>
              <option value="State">State</option>
              <option value="Local">Local</option>
              <option value="Municipal">Municipal</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-500">
              <span>{filteredAgencies.length} of {agencies.length} agencies</span>
            </div>
          </div>
        </div>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgencies.map((agency) => {
            const stats = agencyStats[agency.id];
            return (
              <div key={agency.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {agency.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {agency.type} Agency
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(agency.type)}`}>
                      {agency.type}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    {/* Address */}
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{agency.address}</p>
                        <p>{agency.city}, {agency.state} {agency.zip_code}</p>
                        <p>{agency.country}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    {agency.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{agency.phone}</span>
                      </div>
                    )}

                    {/* Email */}
                    {agency.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{agency.email}</span>
                      </div>
                    )}

                    {/* Website */}
                    {agency.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                        <a 
                          href={agency.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate"
                        >
                          {agency.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {stats && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Contracts</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{stats.total_contracts}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-sm text-gray-600 mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>Total Value</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(stats.total_value)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm text-gray-500">
                          Avg: {formatCurrency(stats.average_contract_value)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last: {formatDate(stats.last_contract_date)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {agency.description && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {agency.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full text-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50">
                      View Contracts →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAgencies.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Building2 className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No agencies have been added yet.'
              }
            </p>
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
                <p className="text-sm font-medium text-gray-500">Total Agencies</p>
                <p className="text-2xl font-semibold text-gray-900">{agencies.length}</p>
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
                  {new Set(agencies.map(a => a.state)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(agencyStats).reduce((sum, stats) => sum + stats.total_contracts, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(Object.values(agencyStats).reduce((sum, stats) => sum + stats.total_value, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
