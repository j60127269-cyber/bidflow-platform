'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Database, 
  Link, 
  Users, 
  Building, 
  Award, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Edit,
  Filter,
  Search,
  Download,
  BarChart3,
  Network
} from 'lucide-react';

interface EntityRelationship {
  contract_id: string;
  reference_number: string;
  title: string;
  procuring_entity: string;
  procuring_entity_id: string | null;
  resolved_procuring_entity: string | null;
  awarded_to: string | null;
  awarded_company_id: string | null;
  resolved_awardee: string | null;
  procuring_entity_resolved: boolean;
  awarded_to_resolved: boolean;
  data_quality_score: number | null;
  relationships_updated_at: string | null;
}

interface CompetitiveIntelligence {
  contract_id: string;
  reference_number: string;
  title: string;
  procuring_entity: string;
  awarded_to: string | null;
  awarded_value: number | null;
  total_bidders: number | null;
  total_bids_received: number | null;
  actual_bids: number;
  winning_bids: number;
  rejected_bids: number;
  lowest_bid: number | null;
  highest_bid: number | null;
  average_bid_value: number | null;
  savings_vs_lowest: number | null;
  savings_percentage: number | null;
}

interface DataQualityStats {
  total_contracts: number;
  resolved_entities: number;
  unresolved_entities: number;
  high_quality_data: number;
  medium_quality_data: number;
  low_quality_data: number;
  average_quality_score: number;
}

export default function DataManagementPage() {
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [competitiveData, setCompetitiveData] = useState<CompetitiveIntelligence[]>([]);
  const [stats, setStats] = useState<DataQualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'relationships' | 'intelligence' | 'quality'>('relationships');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResolved, setFilterResolved] = useState<'all' | 'resolved' | 'unresolved'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch entity relationships
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('entity_relationships_view')
        .select('*')
        .order('relationships_updated_at', { ascending: false });

      if (relationshipsError) {
        console.error('Error fetching relationships:', relationshipsError);
      } else {
        setRelationships(relationshipsData || []);
      }

      // Fetch competitive intelligence data
      const { data: competitiveData, error: competitiveError } = await supabase
        .from('competitive_intelligence_view')
        .select('*')
        .order('awarded_value', { ascending: false });

      if (competitiveError) {
        console.error('Error fetching competitive data:', competitiveError);
      } else {
        setCompetitiveData(competitiveData || []);
      }

      // Calculate stats
      calculateStats(relationshipsData || []);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: EntityRelationship[]) => {
    const total = data.length;
    if (total === 0) {
      setStats({
        total_contracts: 0,
        resolved_entities: 0,
        unresolved_entities: 0,
        high_quality_data: 0,
        medium_quality_data: 0,
        low_quality_data: 0,
        average_quality_score: 0
      });
      return;
    }

    const resolved = data.filter(d => d.procuring_entity_resolved && d.awarded_to_resolved).length;
    const unresolved = total - resolved;
    
    const highQuality = data.filter(d => (d.data_quality_score || 0) >= 0.8).length;
    const mediumQuality = data.filter(d => (d.data_quality_score || 0) >= 0.5 && (d.data_quality_score || 0) < 0.8).length;
    const lowQuality = data.filter(d => (d.data_quality_score || 0) < 0.5).length;
    
    const avgQuality = data.reduce((sum, d) => sum + (d.data_quality_score || 0), 0) / total;

    setStats({
      total_contracts: total,
      resolved_entities: resolved,
      unresolved_entities: unresolved,
      high_quality_data: highQuality,
      medium_quality_data: mediumQuality,
      low_quality_data: lowQuality,
      average_quality_score: avgQuality
    });
  };

  const filteredRelationships = relationships.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.procuring_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.awarded_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterResolved === 'all' ||
      (filterResolved === 'resolved' && item.procuring_entity_resolved && item.awarded_to_resolved) ||
      (filterResolved === 'unresolved' && (!item.procuring_entity_resolved || !item.awarded_to_resolved));

    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQualityColor = (score: number | null) => {
    const safeScore = score || 0;
    if (safeScore >= 0.8) return 'text-green-600 bg-green-100';
    if (safeScore >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityLabel = (score: number | null) => {
    const safeScore = score || 0;
    if (safeScore >= 0.8) return 'High';
    if (safeScore >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Data Management & Relationships</h1>
                <p className="text-gray-600">
                  Monitor and manage data quality, entity relationships, and competitive intelligence
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Link className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entity Resolution</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.resolved_entities}/{stats.total_contracts}
                  </p>
                  <p className="text-sm text-gray-500">
                    {((stats.resolved_entities / stats.total_contracts) * 100).toFixed(1)}% resolved
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Quality Data</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.high_quality_data}</p>
                  <p className="text-sm text-gray-500">
                    {((stats.high_quality_data / stats.total_contracts) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unresolved Entities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unresolved_entities}</p>
                  <p className="text-sm text-gray-500">Need attention</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.average_quality_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500">Overall data quality</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('relationships')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'relationships'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Link className="h-4 w-4 inline mr-2" />
                Entity Relationships
              </button>
              <button
                onClick={() => setActiveTab('intelligence')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'intelligence'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Competitive Intelligence
              </button>
              <button
                onClick={() => setActiveTab('quality')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quality'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Data Quality
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading data...</p>
              </div>
            ) : (
              <>
                {/* Entity Relationships Tab */}
                {activeTab === 'relationships' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Entity Resolution Status</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search contracts, entities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={filterResolved}
                      onChange={(e) => setFilterResolved(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Records</option>
                      <option value="resolved">Resolved Only</option>
                      <option value="unresolved">Unresolved Only</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contract
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Procuring Entity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Awardee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resolution Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quality Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRelationships.map((item) => (
                        <tr key={item.contract_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.reference_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{item.procuring_entity}</div>
                              {item.resolved_procuring_entity && (
                                <div className="text-sm text-green-600">
                                  ✓ {item.resolved_procuring_entity}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{item.awarded_to || 'Not awarded'}</div>
                              {item.resolved_awardee && (
                                <div className="text-sm text-green-600">
                                  ✓ {item.resolved_awardee}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {item.procuring_entity_resolved ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              {item.awarded_to_resolved ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </td>
                                                     <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(item.data_quality_score)}`}>
                               {getQualityLabel(item.data_quality_score)} ({((item.data_quality_score || 0) * 100).toFixed(0)}%)
                             </span>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.relationships_updated_at || '')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Competitive Intelligence Tab */}
            {activeTab === 'intelligence' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Competitive Intelligence Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contract
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Awarded Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bidding Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bid Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Savings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {competitiveData.map((item) => (
                        <tr key={item.contract_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.reference_number}</div>
                              <div className="text-sm text-gray-500">{item.procuring_entity}</div>
                            </div>
                          </td>
                                                     <td className="px-6 py-4 whitespace-nowrap">
                             <div className="text-sm font-medium text-gray-900">
                               {formatCurrency(item.awarded_value)}
                             </div>
                             <div className="text-sm text-gray-500">Awarded to: {item.awarded_to || 'Not specified'}</div>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.actual_bids} bids received
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.winning_bids} winning, {item.rejected_bids} rejected
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(item.lowest_bid)} - {formatCurrency(item.highest_bid)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Avg: {formatCurrency(item.average_bid_value)}
                            </div>
                          </td>
                                                     <td className="px-6 py-4 whitespace-nowrap">
                             <div className="text-sm font-medium text-green-600">
                               {formatCurrency(item.savings_vs_lowest)}
                             </div>
                             <div className="text-sm text-gray-500">
                               {(item.savings_percentage || 0).toFixed(1)}% vs highest bid
                             </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Data Quality Tab */}
            {activeTab === 'quality' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Quality Analysis</h3>
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Quality Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">High Quality (≥80%)</span>
                          <span className="text-sm font-medium text-green-600">{stats.high_quality_data}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(stats.high_quality_data / stats.total_contracts) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Medium Quality (50-79%)</span>
                          <span className="text-sm font-medium text-yellow-600">{stats.medium_quality_data}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${(stats.medium_quality_data / stats.total_contracts) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Low Quality (&lt;50%)</span>
                          <span className="text-sm font-medium text-red-600">{stats.low_quality_data}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(stats.low_quality_data / stats.total_contracts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Entity Resolution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Resolved Entities</span>
                          <span className="text-sm font-medium text-green-600">{stats.resolved_entities}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(stats.resolved_entities / stats.total_contracts) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Unresolved Entities</span>
                          <span className="text-sm font-medium text-red-600">{stats.unresolved_entities}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(stats.unresolved_entities / stats.total_contracts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Overall Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {(stats.average_quality_score * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Average Quality Score</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{stats.total_contracts}</div>
                          <div className="text-sm text-gray-600">Total Contracts</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {((stats.resolved_entities / stats.total_contracts) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Entity Resolution Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                                 )}
               </div>
             )}
               </>
             )}
           </div>
         </div>
       </div>
     </div>
   );
 }
