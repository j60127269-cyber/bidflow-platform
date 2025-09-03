'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Contract, CompetitorBid } from '@/types/database';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  FileText, 
  Users, 
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface ContractLifecycleTrackerProps {
  contract: Contract;
  onStatusUpdate?: (newStatus: string, newStage: string) => void;
  isAdmin?: boolean;
}

interface LifecycleStage {
  stage: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  date?: string;
}

export default function ContractLifecycleTracker({ 
  contract, 
  onStatusUpdate, 
  isAdmin = false 
}: ContractLifecycleTrackerProps) {
  const [bids, setBids] = useState<CompetitorBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBids();
  }, [contract.id]);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('competitor_bids')
        .select('*')
        .eq('contract_id', contract.id)
        .order('bid_date', { ascending: true });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLifecycleStages = (): LifecycleStage[] => {
    const stages: LifecycleStage[] = [
      {
        stage: 'draft',
        label: 'Draft',
        icon: <FileText className="w-5 h-5" />,
        description: 'Contract is being prepared',
        isCompleted: ['published', 'pre_bid_meeting', 'site_visit', 'submission_open', 'submission_closed', 'evaluation', 'awarded', 'contract_signed', 'in_progress', 'completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'draft',
        date: contract.created_at
      },
      {
        stage: 'published',
        label: 'Published',
        icon: <AlertCircle className="w-5 h-5" />,
        description: 'Contract is published and visible',
        isCompleted: ['pre_bid_meeting', 'site_visit', 'submission_open', 'submission_closed', 'evaluation', 'awarded', 'contract_signed', 'in_progress', 'completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'published',
        date: contract.published_at
      },
      {
        stage: 'submission_open',
        label: 'Bidding Open',
        icon: <Users className="w-5 h-5" />,
        description: 'Companies can submit bids',
        isCompleted: ['submission_closed', 'evaluation', 'awarded', 'contract_signed', 'in_progress', 'completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'submission_open',
        date: contract.publish_date
      },
      {
        stage: 'submission_closed',
        label: 'Bidding Closed',
        icon: <XCircle className="w-5 h-5" />,
        description: 'No more bids accepted',
        isCompleted: ['evaluation', 'awarded', 'contract_signed', 'in_progress', 'completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'submission_closed',
        date: contract.submission_deadline
      },
      {
        stage: 'evaluation',
        label: 'Under Evaluation',
        icon: <TrendingUp className="w-5 h-5" />,
        description: 'Bids are being evaluated',
        isCompleted: ['awarded', 'contract_signed', 'in_progress', 'completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'evaluation',
        date: contract.evaluation_start_date
      },
      {
        stage: 'awarded',
        label: 'Awarded',
        icon: <Award className="w-5 h-5" />,
        description: 'Contract has been awarded',
        isCompleted: ['contract_signed', 'in_progress', 'completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'awarded',
        date: contract.award_date
      },
      {
        stage: 'in_progress',
        label: 'In Progress',
        icon: <Clock className="w-5 h-5" />,
        description: 'Contract is being executed',
        isCompleted: ['completed', 'archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'in_progress',
        date: contract.contract_start_date
      },
      {
        stage: 'completed',
        label: 'Completed',
        icon: <CheckCircle className="w-5 h-5" />,
        description: 'Contract has been completed',
        isCompleted: ['archived'].includes(contract.current_stage),
        isCurrent: contract.current_stage === 'completed',
        date: contract.contract_end_date
      }
    ];

    return stages;
  };

  const handleStatusUpdate = async (newStage: string) => {
    if (!isAdmin) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          current_stage: newStage,
          updated_at: new Date().toISOString()
        })
        .eq('id', contract.id);

      if (error) throw error;
      
      onStatusUpdate?.(contract.status, newStage);
      // Refresh the component
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: contract.currency || 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stages = getLifecycleStages();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Contract Lifecycle</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            contract.status === 'completed' ? 'bg-green-100 text-green-800' :
            contract.status === 'awarded' ? 'bg-blue-100 text-blue-800' :
            contract.status === 'evaluating' ? 'bg-yellow-100 text-yellow-800' :
            contract.status === 'open' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {contract.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={stage.stage} className="relative flex items-start">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  stage.isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : stage.isCurrent 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {stage.icon}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{stage.label}</h4>
                      <p className="text-sm text-gray-500">{stage.description}</p>
                      {stage.date && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(stage.date)}
                        </p>
                      )}
                    </div>
                    {isAdmin && stage.isCurrent && (
                      <button
                        onClick={() => handleStatusUpdate(stage.stage)}
                        disabled={updating}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Updating...' : 'Update'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bidding Intelligence */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Bidding Intelligence</h4>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-lg font-semibold text-gray-900">{bids.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Winning Bid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {contract.awarded_to || 'Not awarded'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Awarded Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {contract.awarded_value ? formatCurrency(contract.awarded_value) : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Award Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(contract.award_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bids Table */}
        {bids.length > 0 && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-900 mb-3">All Bids</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bidder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bid Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bid.bidder_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(bid.bid_value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bid.bid_status === 'awarded' ? 'bg-green-100 text-green-800' :
                          bid.bid_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          bid.bid_status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bid.bid_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bid.bid_date)}
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
  );
}
