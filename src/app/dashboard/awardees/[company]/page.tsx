'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Awardee, Contract } from '@/types/database';
import { 
  Building, MapPin, Users, DollarSign, Award, TrendingUp, Calendar, Phone, Mail, 
  Globe, FileText, CheckCircle, Clock, AlertCircle, Share2, Download, 
  Heart, Bell, ChevronDown, BarChart3, PieChart, Map, Award as AwardIcon,
  Users as UsersIcon, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'overview' | 'analysis' | 'contracts' | 'performance' | 'people';

export default function AwardeeDetailPage() {
  const params = useParams();
  const [awardee, setAwardee] = useState<Awardee | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analysisTab, setAnalysisTab] = useState<'trends' | 'shares' | 'categories' | 'maps' | 'agency-rankings'>('trends');

  const companySlug = params.company as string;
  const companyName = companySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    fetchAwardeeData();
  }, [companyName]);

  const fetchAwardeeData = async () => {
    try {
      setLoading(true);
      
      const { data: awardeeData, error: awardeeError } = await supabase
        .from('awardees')
        .select('*')
        .eq('company_name', companyName)
        .single();

      if (awardeeError) {
        setError('Awardee not found');
        return;
      }

      setAwardee(awardeeData);

      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .eq('awarded_to', companyName)
        .order('award_date', { ascending: false });

      setContracts(contractsData || []);

    } catch (err) {
      setError('Failed to load awardee data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-7xl mx-auto p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !awardee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Awardee Not Found</h2>
            <p className="text-gray-600 mb-4">The awardee "{companyName}" could not be found.</p>
            <Link href="/dashboard/contracts" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Back to Contracts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalWonValue = contracts.reduce((sum, contract) => sum + (contract.awarded_value || 0), 0);
  const activeContracts = contracts.filter(c => c.completion_status === 'on_track' || c.completion_status === 'delayed');
  const completedContracts = contracts.filter(c => c.completion_status === 'completed');

  // Get unique agencies for rankings
  const agencyRankings = contracts
    .filter(c => c.procuring_entity)
    .reduce((acc, contract) => {
      const agency = contract.procuring_entity!;
      if (!acc[agency]) {
        acc[agency] = { name: agency, totalValue: 0, contractCount: 0 };
      }
      acc[agency].totalValue += contract.awarded_value || 0;
      acc[agency].contractCount += 1;
      return acc;
    }, {} as Record<string, { name: string; totalValue: number; contractCount: number }>);

  const topAgencies = Object.values(agencyRankings)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'analysis', label: 'Analysis', count: null },
    { id: 'contracts', label: `Contracts ${contracts.length}`, count: contracts.length },
    { id: 'performance', label: 'Performance', count: null },
    { id: 'people', label: 'People', count: null },
  ];

  const analysisTabs = [
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'shares', label: 'Shares', icon: PieChart },
    { id: 'categories', label: 'Categories', icon: BarChart3 },
    { id: 'maps', label: 'Maps', icon: Map },
    { id: 'agency-rankings', label: 'Agency Rankings', icon: AwardIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/contracts" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Search Awardees
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{awardee.company_name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                <Share2 className="w-4 h-4 mr-1" />
                Share
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                <Download className="w-4 h-4 mr-1" />
                Export
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                <Heart className="w-4 h-4 mr-1" />
                Favorite
              </button>
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                <Bell className="w-4 h-4 mr-1" />
                Notify
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                  <dd className="text-sm text-gray-900 mt-1">{awardee.registration_number || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{awardee.business_type || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Team Size</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {awardee.team_size ? `${awardee.team_size} employees` : 'N/A'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {awardee.contact_email || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {awardee.contact_phone || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {awardee.website ? (
                      <a href={awardee.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {awardee.website}
                      </a>
                    ) : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Locations</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {awardee.locations?.join(', ') || 'N/A'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Categories & Certifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Primary Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {awardee.primary_categories?.map((category, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category}
                      </span>
                    )) || <span className="text-gray-500">No categories specified</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {awardee.certifications?.map((cert, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {cert}
                      </span>
                    )) || <span className="text-gray-500">No certifications specified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Contracts Won</p>
                    <p className="text-2xl font-semibold text-gray-900">{contracts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Value Won</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalWonValue)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Contracts</p>
                    <p className="text-2xl font-semibold text-gray-900">{activeContracts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Contracts</p>
                    <p className="text-2xl font-semibold text-gray-900">{completedContracts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Analysis Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    Award Analysis
                    <AlertCircle className="w-4 h-4 ml-2 text-gray-400" />
                  </h2>
                  <p className="text-sm text-gray-600">{awardee.company_name} contract and award analysis</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select className="text-sm border border-gray-300 rounded px-3 py-1">
                    <option>Type: All Awards</option>
                  </select>
                  <select className="text-sm border border-gray-300 rounded px-3 py-1">
                    <option>Years: Max</option>
                  </select>
                  <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>

              {/* Analysis Sub-tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {analysisTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAnalysisTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                        analysisTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-1" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Analysis Content */}
              <div className="mt-6">
                {analysisTab === 'trends' && (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Award trends chart will be displayed here</p>
                  </div>
                )}

                {analysisTab === 'agency-rankings' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Agency Rankings</h3>
                      <p className="text-sm text-gray-600">Total: {formatCurrency(topAgencies.reduce((sum, a) => sum + a.totalValue, 0))}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                              Agency
                              <ArrowUpDown className="w-3 h-3 ml-1" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                              Total Value
                              <ArrowUpDown className="w-3 h-3 ml-1" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                              Contracts
                              <ArrowUpDown className="w-3 h-3 ml-1" />
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {topAgencies.map((agency, index) => (
                            <tr key={agency.name} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <Link 
                                  href={`/dashboard/agencies/${agency.name.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <Globe className="w-4 h-4 mr-1" />
                                  {agency.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(agency.totalValue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {agency.contractCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Contract Awards</h2>
                  <p className="text-sm text-gray-600">{awardee.company_name} prime contract awards</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Explore
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Award ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awarding Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                      Potential Value
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                      Start
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                      End
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.slice(0, 10).map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/contracts/${contract.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          {contract.reference_number || `CON-${contract.id.slice(-6)}`}
                        </Link>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{contract.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link 
                          href={`/dashboard/agencies/${contract.procuring_entity?.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          {contract.procuring_entity}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.awarded_value ? formatCurrency(contract.awarded_value, contract.currency) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(contract.contract_start_date || '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(contract.contract_end_date || '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Performance metrics and analytics will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'people' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Key personnel information will be displayed here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
