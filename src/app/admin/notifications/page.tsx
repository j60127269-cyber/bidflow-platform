'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface QueueStats {
  total_notifications: number;
  pending_count: number;
  processing_count: number;
  sent_count: number;
  failed_count: number;
  cancelled_count: number;
  success_rate: number;
  avg_processing_time: string;
}

interface QueueItem {
  id: string;
  user_email: string;
  user_name: string;
  contract_title: string;
  procuring_entity: string;
  contract_version: number;
  type: string;
  status: string;
  priority: number;
  created_at: string;
  scheduled_at: string;
  processed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  email_sent: boolean;
  email_sent_at?: string;
  status_display: string;
  priority_display: string;
}

export default function NotificationQueuePage() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchQueueItems();
  }, [selectedStatus, currentPage]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_notification_queue_stats');
      if (error) throw error;
      setStats(data[0] || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchQueueItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notification_queue_dashboard')
        .select('*')
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setQueueItems(data || []);
    } catch (error) {
      console.error('Error fetching queue items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (notificationId: string) => {
    setActionLoading(notificationId);
    try {
      const response = await fetch(`/api/admin/notifications/retry/${notificationId}`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchQueueItems();
        await fetchStats();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (notificationId: string) => {
    setActionLoading(notificationId);
    try {
      const response = await fetch(`/api/admin/notifications/cancel/${notificationId}`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchQueueItems();
        await fetchStats();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRetry = async () => {
    setActionLoading('bulk-retry');
    try {
      const response = await fetch('/api/admin/notifications/bulk-retry', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully retried ${result.retriedCount} notifications`);
        await fetchQueueItems();
        await fetchStats();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkCancel = async () => {
    setActionLoading('bulk-cancel');
    try {
      const response = await fetch('/api/admin/notifications/bulk-cancel', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully cancelled ${result.cancelledCount} notifications`);
        await fetchQueueItems();
        await fetchStats();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setActionLoading(null);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Queue Management</h1>
          <p className="mt-2 text-gray-600">Monitor and control email notifications</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.total_notifications}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_notifications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.pending_count}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.sent_count}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Sent</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.sent_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.failed_count}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Failed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.failed_count}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Queue Controls</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleBulkRetry}
                disabled={actionLoading === 'bulk-retry'}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading === 'bulk-retry' ? 'Retrying...' : 'Retry All Failed'}
              </button>
              
              <button
                onClick={handleBulkCancel}
                disabled={actionLoading === 'bulk-cancel'}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === 'bulk-cancel' ? 'Cancelling...' : 'Cancel All Pending'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue Items Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Queue Items</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queueItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.user_name}</div>
                          <div className="text-sm text-gray-500">{item.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.contract_title}</div>
                          <div className="text-sm text-gray-500">{item.procuring_entity}</div>
                          <div className="text-xs text-gray-400">v{item.contract_version}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status_display}
                        </span>
                        {item.error_message && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={item.error_message}>
                            {item.error_message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {item.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(item.id)}
                              disabled={actionLoading === item.id}
                              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                            >
                              {actionLoading === item.id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                          {(item.status === 'pending' || item.status === 'processing') && (
                            <button
                              onClick={() => handleCancel(item.id)}
                              disabled={actionLoading === item.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === item.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, queueItems.length)} of {queueItems.length} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={queueItems.length < itemsPerPage}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
