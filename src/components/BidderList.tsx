'use client';

import React, { useState } from 'react';
import { ContractBidder } from '@/types/bidder-types';
import BidderForm from './BidderForm';

interface BidderListProps {
  contractId: string;
  bidders: ContractBidder[];
  onBidderUpdate: () => void;
}

export default function BidderList({ contractId, bidders, onBidderUpdate }: BidderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBidder, setEditingBidder] = useState<ContractBidder | null>(null);

  const handleAddBidder = () => {
    setEditingBidder(null);
    setShowForm(true);
  };

  const handleEditBidder = (bidder: ContractBidder) => {
    setEditingBidder(bidder);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBidder(null);
  };

  const handleBidderSave = () => {
    setShowForm(false);
    setEditingBidder(null);
    onBidderUpdate();
  };

  const handleDeleteBidder = async (bidderId: string) => {
    if (!confirm('Are you sure you want to delete this bidder?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${contractId}/bidders/${bidderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete bidder');
      }

      onBidderUpdate();
    } catch (error) {
      console.error('Error deleting bidder:', error);
      alert(`Failed to delete bidder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awarded':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'disqualified':
        return 'bg-gray-100 text-gray-800';
      case 'withdrawn':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case 'compliant':
      case 'responsive':
      case 'passed':
        return 'text-green-600';
      case 'non_compliant':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (showForm) {
    return (
      <BidderForm
        contractId={contractId}
        bidder={editingBidder || undefined}
        onSave={handleBidderSave}
        onCancel={handleFormClose}
        isEditing={!!editingBidder}
        useFormElement={false}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Contract Bidders ({bidders.length})
          </h3>
          <button
            onClick={handleAddBidder}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Bidder
          </button>
        </div>
      </div>

      {bidders.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>No bidders recorded for this contract yet.</p>
          <button
            onClick={handleAddBidder}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Add the first bidder
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failure Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bidders.map((bidder) => (
                <tr key={bidder.id} className={bidder.is_winner ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bidder.company_name}
                          {bidder.is_winner && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Winner
                            </span>
                          )}
                          {bidder.is_runner_up && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Runner-up
                            </span>
                          )}
                        </div>
                        {bidder.contact_person && (
                          <div className="text-sm text-gray-500">
                            {bidder.contact_person}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(bidder.bid_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bidder.rank || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bidder.bid_status)}`}>
                      {bidder.bid_status.charAt(0).toUpperCase() + bidder.bid_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-1">
                      {bidder.preliminary_evaluation && (
                        <div className={`text-xs ${getEvaluationColor(bidder.preliminary_evaluation)}`}>
                          Prelim: {bidder.preliminary_evaluation}
                        </div>
                      )}
                      {bidder.detailed_evaluation && (
                        <div className={`text-xs ${getEvaluationColor(bidder.detailed_evaluation)}`}>
                          Detailed: {bidder.detailed_evaluation}
                        </div>
                      )}
                      {bidder.financial_evaluation && (
                        <div className={`text-xs ${getEvaluationColor(bidder.financial_evaluation)}`}>
                          Financial: {bidder.financial_evaluation}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {bidder.reason_for_failure ? (
                      <div className="truncate" title={bidder.reason_for_failure}>
                        {bidder.reason_for_failure}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBidder(bidder)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBidder(bidder.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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
  );
}
