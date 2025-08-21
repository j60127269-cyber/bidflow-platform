'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader2 } from 'lucide-react';

interface ContractForm {
  reference_number: string;
  title: string;
  short_description: string;
  category: string;
  procurement_method: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  currency: string;
  bid_fee?: number;
  bid_security_amount?: number;
  bid_security_type?: string;
  margin_of_preference?: string;
  competition_level?: string;
  publish_date: string;
  pre_bid_meeting_date?: string;
  site_visit_date?: string;
  submission_deadline: string;
  bid_opening_date?: string;
  procuring_entity: string;
  contact_person?: string;
  contact_position?: string;
  evaluation_methodology?: string;
  requires_registration: boolean;
  requires_trading_license: boolean;
  requires_tax_clearance: boolean;
  requires_nssf_clearance: boolean;
  requires_manufacturer_auth: boolean;
  submission_method: string;
  submission_format: string;
  required_documents?: string;
  required_forms?: string;
  status: string;
  current_stage: string;
  award_information?: string;
  awarded_value?: number;
  awarded_to?: string;
}

const categories = [
  'construction',
  'supplies', 
  'services',
  'it',
  'healthcare',
  'education',
  'other'
];

const stages = [
  'draft',
  'published',
  'evaluation',
  'awarded',
  'completed',
  'cancelled'
];

export default function EditContractPage() {
  const params = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<ContractForm>({
    reference_number: '',
    title: '',
    short_description: '',
    category: '',
    procurement_method: '',
    currency: 'UGX',
    publish_date: '',
    submission_deadline: '',
    procuring_entity: '',
    requires_registration: true,
    requires_trading_license: true,
    requires_tax_clearance: true,
    requires_nssf_clearance: true,
    requires_manufacturer_auth: false,
    submission_method: 'online',
    submission_format: 'electronic submission',
    status: 'open',
    current_stage: 'published'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchContract(params.id as string);
    }
  }, [params.id]);

  const fetchContract = async (id: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContract(data);
      } else {
        console.error('Failed to fetch contract');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...contract,
        estimated_value_min: contract.estimated_value_min || undefined,
        estimated_value_max: contract.estimated_value_max || undefined,
        bid_fee: contract.bid_fee || undefined,
        bid_security_amount: contract.bid_security_amount || undefined,
        awarded_value: contract.awarded_value || undefined,
        awarded_to: contract.awarded_to || undefined
      };

      const response = await fetch(`/api/contracts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push('/admin/contracts');
      } else {
        console.error('Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
        <p className="text-gray-600">Update contract information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number *
              </label>
              <input
                type="text"
                required
                value={contract.reference_number}
                onChange={(e) => setContract(prev => ({ ...prev, reference_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Contract reference number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={contract.title}
                onChange={(e) => setContract(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Contract title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                value={contract.short_description}
                onChange={(e) => setContract(prev => ({ ...prev, short_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief description of the contract"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={contract.category}
                onChange={(e) => setContract(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procurement Method *
              </label>
              <input
                type="text"
                required
                value={contract.procurement_method}
                onChange={(e) => setContract(prev => ({ ...prev, procurement_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Open Domestic Bidding"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procuring Entity *
              </label>
              <input
                type="text"
                required
                value={contract.procuring_entity}
                onChange={(e) => setContract(prev => ({ ...prev, procuring_entity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Government entity name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={contract.status}
                onChange={(e) => setContract(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value (Min)
              </label>
              <input
                type="number"
                value={contract.estimated_value_min || ''}
                onChange={(e) => setContract(prev => ({ ...prev, estimated_value_min: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Minimum value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value (Max)
              </label>
              <input
                type="number"
                value={contract.estimated_value_max || ''}
                onChange={(e) => setContract(prev => ({ ...prev, estimated_value_max: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Maximum value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                required
                value={contract.currency}
                onChange={(e) => setContract(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="UGX">UGX</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Fee
              </label>
              <input
                type="number"
                value={contract.bid_fee || ''}
                onChange={(e) => setContract(prev => ({ ...prev, bid_fee: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Bid fee amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Security Amount
              </label>
              <input
                type="number"
                value={contract.bid_security_amount || ''}
                onChange={(e) => setContract(prev => ({ ...prev, bid_security_amount: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Security amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Security Type
              </label>
              <select
                value={contract.bid_security_type || ''}
                onChange={(e) => setContract(prev => ({ ...prev, bid_security_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select security type</option>
                <option value="bank guarantee">Bank Guarantee</option>
                <option value="insurance bond">Insurance Bond</option>
                <option value="cash deposit">Cash Deposit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dates and Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates and Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date *
              </label>
              <input
                type="date"
                required
                value={contract.publish_date}
                onChange={(e) => setContract(prev => ({ ...prev, publish_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Deadline *
              </label>
              <input
                type="date"
                required
                value={contract.submission_deadline}
                onChange={(e) => setContract(prev => ({ ...prev, submission_deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-bid Meeting Date
              </label>
              <input
                type="date"
                value={contract.pre_bid_meeting_date || ''}
                onChange={(e) => setContract(prev => ({ ...prev, pre_bid_meeting_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Visit Date
              </label>
              <input
                type="date"
                value={contract.site_visit_date || ''}
                onChange={(e) => setContract(prev => ({ ...prev, site_visit_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Opening Date
              </label>
              <input
                type="date"
                value={contract.bid_opening_date || ''}
                onChange={(e) => setContract(prev => ({ ...prev, bid_opening_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status & Stage */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Stage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stage
              </label>
              <select
                value={contract.current_stage}
                onChange={(e) => setContract(prev => ({ ...prev, current_stage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {contract.status === 'awarded' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Awarded Value
                  </label>
                  <input
                    type="number"
                    value={contract.awarded_value || ''}
                    onChange={(e) => setContract(prev => ({ ...prev, awarded_value: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Awarded contract value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Awarded To
                  </label>
                  <input
                    type="text"
                    value={contract.awarded_to || ''}
                    onChange={(e) => setContract(prev => ({ ...prev, awarded_to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Company awarded the contract"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contract.contact_person || ''}
                onChange={(e) => setContract(prev => ({ ...prev, contact_person: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Position
              </label>
              <input
                type="text"
                value={contract.contact_position || ''}
                onChange={(e) => setContract(prev => ({ ...prev, contact_position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Contact position"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Methodology
              </label>
              <input
                type="text"
                value={contract.evaluation_methodology || ''}
                onChange={(e) => setContract(prev => ({ ...prev, evaluation_methodology: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Evaluation methodology"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Method
              </label>
              <select
                value={contract.submission_method}
                onChange={(e) => setContract(prev => ({ ...prev, submission_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="online">Online</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Format
              </label>
              <input
                type="text"
                value={contract.submission_format}
                onChange={(e) => setContract(prev => ({ ...prev, submission_format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Submission format"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition Level
              </label>
              <select
                value={contract.competition_level || ''}
                onChange={(e) => setContract(prev => ({ ...prev, competition_level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award Information
            </label>
            <textarea
              value={contract.award_information || ''}
              onChange={(e) => setContract(prev => ({ ...prev, award_information: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Award details and information"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/contracts"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
