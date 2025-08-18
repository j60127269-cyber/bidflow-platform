"use client";

import { 
  Target, 
  Clock, 
  XCircle, 
  Calendar,
  DollarSign,
  Building,
  Plus,
  ArrowRight,
  Eye,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Contract } from "@/types/database";

interface TrackedContract extends Contract {
  tracking_id: string;
  email_alerts: boolean;
  whatsapp_alerts: boolean;
  push_alerts: boolean;
  tracking_active: boolean;
}

export default function TrackingPage() {
  const { user } = useAuth();
  const [trackedContracts, setTrackedContracts] = useState<TrackedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch tracked contracts
  useEffect(() => {
    if (user) {
      fetchTrackedContracts();
    }
  }, [user]);

  const fetchTrackedContracts = async () => {
    try {
      setLoading(true);
      // Step 1: fetch tracking rows for the current user
      const { data: trackingRows, error: trackingError } = await supabase
        .from('bid_tracking')
        .select('id, contract_id, email_alerts, whatsapp_alerts, push_alerts, tracking_active')
        .eq('user_id', user?.id)
        .eq('tracking_active', true);

      if (trackingError) {
        console.error('Error fetching tracked contracts:', trackingError);
        return;
      }

      if (!trackingRows || trackingRows.length === 0) {
        setTrackedContracts([]);
        return;
      }

      // Step 2: fetch the corresponding contracts
      const contractIds = trackingRows.map((row: any) => row.contract_id);
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .in('id', contractIds);

      if (contractsError) {
        console.error('Error fetching related contracts:', contractsError);
        return;
      }

      // Merge tracking info into each contract
      const transformedData = (contracts || []).map((contract: any) => {
        const tracking = trackingRows.find((row: any) => row.contract_id === contract.id);
        return {
          ...contract,
          tracking_id: tracking?.id,
          email_alerts: tracking?.email_alerts ?? false,
          whatsapp_alerts: tracking?.whatsapp_alerts ?? false,
          push_alerts: tracking?.push_alerts ?? false,
          tracking_active: tracking?.tracking_active ?? false
        };
      });

      setTrackedContracts(transformedData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async (trackingId: string) => {
    if (!confirm('Are you sure you want to stop tracking this contract?')) {
      return;
    }

    setDeleteLoading(trackingId);
    try {
      const { error } = await supabase
        .from('bid_tracking')
        .update({ tracking_active: false })
        .eq('id', trackingId);

      if (error) {
        console.error('Error stopping tracking:', error);
        return;
      }

      // Remove from local state
      setTrackedContracts(prev => prev.filter(contract => contract.tracking_id !== trackingId));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) { // 1B+
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) { // 1M+
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 100000) { // 100K+
      return `${(value / 100000).toFixed(1)}00K UGX`;
    } else if (value >= 10000) { // 10K+
      return `${(value / 10000).toFixed(1)}0K UGX`;
    } else {
      return `${(value / 1000).toFixed(1)}K UGX`;
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
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Track Bids</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor your bid progress and deadlines
          </p>
        </div>
        <Link
          href="/dashboard/contracts"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Track New Bid
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Tracked Contracts</p>
              <p className="text-2xl font-semibold text-slate-900">{trackedContracts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Upcoming Deadlines</p>
              <p className="text-2xl font-semibold text-slate-900">
                {trackedContracts.filter(contract => 
                  new Date(contract.submission_deadline) > new Date()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Contract Value</p>
              <p className="text-2xl font-semibold text-slate-900">
                {formatValue(
                  trackedContracts.reduce((sum, c) => {
                    const v = c.estimated_value_max ?? c.estimated_value_min ?? 0;
                    return sum + v;
                  }, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Overdue</p>
              <p className="text-2xl font-semibold text-slate-900">
                {trackedContracts.filter(contract => new Date(contract.submission_deadline) < new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tracked contracts...</p>
        </div>
      )}

      {/* Tracked Contracts List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Tracked Contracts</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {trackedContracts.map((contract) => (
            <div key={contract.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{contract.title}</h4>
                  <div className="flex items-center text-sm text-slate-600 mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    {contract.procuring_entity}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {contract.estimated_value_min && contract.estimated_value_max 
                        ? `Estimated ${formatValue(contract.estimated_value_min)}-${formatValue(contract.estimated_value_max)}`
                        : contract.estimated_value_min 
                          ? `Estimated ${formatValue(contract.estimated_value_min)}`
                          : contract.estimated_value_max 
                            ? `Estimated ${formatValue(contract.estimated_value_max)}`
                            : 'Value not specified'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline: {formatDate(contract.submission_deadline)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {contract.category}
                  </span>
                </div>
              </div>

              {/* Alert Preferences */}
              <div className="mb-4">
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${contract.email_alerts ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Email Alerts
                  </span>
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${contract.whatsapp_alerts ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    WhatsApp Alerts
                  </span>
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${contract.push_alerts ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Push Alerts
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/contracts/${contract.id}`}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStopTracking(contract.tracking_id)}
                    disabled={deleteLoading === contract.tracking_id}
                    className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === contract.tracking_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Stop Tracking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Empty State */}
      {!loading && trackedContracts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bids tracked yet</h3>
          <p className="text-slate-600 mb-6">
            Start tracking your bids to monitor progress and deadlines
          </p>
          <Link
            href="/dashboard/contracts"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Find Contracts to Track
          </Link>
        </div>
      )}
    </div>
  );
}

