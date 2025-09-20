'use client';

import React, { useState, useEffect } from 'react';
import { ContractBidder, BidderFormData } from '@/types/bidder-types';

interface BidderFormProps {
  contractId: string;
  bidder?: ContractBidder;
  onSave: (bidder: ContractBidder) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const BID_STATUSES = [
  'submitted',
  'shortlisted', 
  'awarded',
  'rejected',
  'disqualified',
  'withdrawn'
];

const EVALUATION_OPTIONS = {
  preliminary: ['compliant', 'non_compliant'],
  detailed: ['responsive', 'failed'],
  financial: ['passed', 'failed']
};

export default function BidderForm({ 
  contractId, 
  bidder, 
  onSave, 
  onCancel, 
  isEditing = false 
}: BidderFormProps) {
  const [formData, setFormData] = useState<BidderFormData>({
    company_name: '',
    bid_amount: '',
    rank: '',
    bid_status: 'submitted',
    preliminary_evaluation: '',
    detailed_evaluation: '',
    financial_evaluation: '',
    reason_for_failure: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    company_registration_number: '',
    is_winner: false,
    is_runner_up: false,
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bidder && isEditing) {
      setFormData({
        company_name: bidder.company_name,
        bid_amount: bidder.bid_amount.toString(),
        rank: bidder.rank?.toString() || '',
        bid_status: bidder.bid_status,
        preliminary_evaluation: bidder.preliminary_evaluation || '',
        detailed_evaluation: bidder.detailed_evaluation || '',
        financial_evaluation: bidder.financial_evaluation || '',
        reason_for_failure: bidder.reason_for_failure || '',
        contact_person: bidder.contact_person || '',
        contact_email: bidder.contact_email || '',
        contact_phone: bidder.contact_phone || '',
        company_registration_number: bidder.company_registration_number || '',
        is_winner: bidder.is_winner,
        is_runner_up: bidder.is_runner_up,
        notes: bidder.notes || ''
      });
    }
  }, [bidder, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditing 
        ? `/api/contracts/${contractId}/bidders/${bidder?.id}`
        : `/api/contracts/${contractId}/bidders`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save bidder');
      }

      const result = await response.json();
      onSave(result.bidder);
    } catch (error) {
      console.error('Error saving bidder:', error);
      alert(`Failed to save bidder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BidderFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit Bidder' : 'Add New Bidder'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bid Amount (UGX) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.bid_amount}
              onChange={(e) => handleInputChange('bid_amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rank
            </label>
            <input
              type="number"
              value={formData.rank}
              onChange={(e) => handleInputChange('rank', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1, 2, 3, etc. (0 for unsuccessful)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bid Status
            </label>
            <select
              value={formData.bid_status}
              onChange={(e) => handleInputChange('bid_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BID_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Evaluation Results */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">Evaluation Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preliminary Evaluation
              </label>
              <select
                value={formData.preliminary_evaluation}
                onChange={(e) => handleInputChange('preliminary_evaluation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {EVALUATION_OPTIONS.preliminary.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Evaluation
              </label>
              <select
                value={formData.detailed_evaluation}
                onChange={(e) => handleInputChange('detailed_evaluation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {EVALUATION_OPTIONS.detailed.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Evaluation
              </label>
              <select
                value={formData.financial_evaluation}
                onChange={(e) => handleInputChange('financial_evaluation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {EVALUATION_OPTIONS.financial.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Failure Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Failure
          </label>
          <textarea
            value={formData.reason_for_failure}
            onChange={(e) => handleInputChange('reason_for_failure', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed reasons for failure (e.g., 'Did not buy required standards and the Audited books of Accounts was not signed')"
          />
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.company_registration_number}
                onChange={(e) => handleInputChange('company_registration_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status Flags */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">Status</h4>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_winner}
                onChange={(e) => handleInputChange('is_winner', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Winner</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_runner_up}
                onChange={(e) => handleInputChange('is_runner_up', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Runner-up (2nd BEB, 3rd BEB, etc.)</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about this bidder..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Bidder' : 'Add Bidder')}
          </button>
        </div>
      </form>
    </div>
  );
}
