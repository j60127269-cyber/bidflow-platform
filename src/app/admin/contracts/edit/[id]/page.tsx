'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface ContractForm {
  reference_number: string;
  title: string;
  short_description?: string;
  category: string;
  procurement_method: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  currency: string;
  bid_fee?: number;
  bid_security_amount?: number;
  bid_security_type?: string;
  margin_of_preference: boolean;
  competition_level: 'low' | 'medium' | 'high' | 'very_high';
  publish_date?: string;
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
  submission_method?: string;
  submission_format?: string;
  required_documents?: string[];
  required_forms?: string[];
  bid_attachments?: string[];
  status: string;
  current_stage: string;
  award_information?: string;
}

const categories = [
  'Construction & Engineering',
  'Information Technology',
  'Logistics & Transportation',
  'Healthcare & Medical',
  'Education & Training',
  'Agriculture & Farming',
  'Manufacturing',
  'Financial Services',
  'Real Estate',
  'Energy & Utilities',
  'Tourism & Hospitality',
  'Media & Communications',
  'Other'
];

const procurementMethods = [
  'Open Domestic Bidding',
  'Restricted Bidding',
  'Direct Procurement',
  'Framework Agreement',
  'Request for Quotations',
  'Request for Proposals',
  'Single Source',
  'Other'
];

const competitionLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' }
];

const statuses = ['Open', 'Closed', 'Awarded', 'Cancelled'];
const stages = ['Published', 'Pre-bid Meeting', 'Site Visit', 'Submission', 'Evaluation', 'Award', 'Contract Signed'];

export default function EditContract({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contract, setContract] = useState<ContractForm>({
    reference_number: '',
    title: '',
    short_description: '',
    category: '',
    procurement_method: '',
    estimated_value_min: undefined,
    estimated_value_max: undefined,
    currency: 'UGX',
    bid_fee: undefined,
    bid_security_amount: undefined,
    bid_security_type: '',
    margin_of_preference: false,
    competition_level: 'medium',
    publish_date: '',
    pre_bid_meeting_date: '',
    site_visit_date: '',
    submission_deadline: '',
    bid_opening_date: '',
    procuring_entity: '',
    contact_person: '',
    contact_position: '',
    evaluation_methodology: '',
    requires_registration: false,
    requires_trading_license: false,
    requires_tax_clearance: false,
    requires_nssf_clearance: false,
    requires_manufacturer_auth: false,
    submission_method: '',
    submission_format: '',
    required_documents: [],
    required_forms: [],
    bid_attachments: [],
    status: 'Open',
    current_stage: 'Published',
    award_information: ''
  });

  const [newDocument, setNewDocument] = useState('');
  const [newForm, setNewForm] = useState('');
  const [newAttachment, setNewAttachment] = useState('');

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
        alert('Failed to fetch contract');
        return;
      }

      if (data) {
        setContract({
          reference_number: data.reference_number || '',
          title: data.title || '',
          short_description: data.short_description || '',
          category: data.category || '',
          procurement_method: data.procurement_method || '',
          estimated_value_min: data.estimated_value_min || undefined,
          estimated_value_max: data.estimated_value_max || undefined,
          currency: data.currency || 'UGX',
          bid_fee: data.bid_fee || undefined,
          bid_security_amount: data.bid_security_amount || undefined,
          bid_security_type: data.bid_security_type || '',
          margin_of_preference: data.margin_of_preference || false,
          competition_level: data.competition_level || 'medium',
          publish_date: data.publish_date ? new Date(data.publish_date).toISOString().split('T')[0] : '',
          pre_bid_meeting_date: data.pre_bid_meeting_date ? new Date(data.pre_bid_meeting_date).toISOString().split('T')[0] : '',
          site_visit_date: data.site_visit_date ? new Date(data.site_visit_date).toISOString().split('T')[0] : '',
          submission_deadline: data.submission_deadline ? new Date(data.submission_deadline).toISOString().split('T')[0] : '',
          bid_opening_date: data.bid_opening_date ? new Date(data.bid_opening_date).toISOString().split('T')[0] : '',
          procuring_entity: data.procuring_entity || '',
          contact_person: data.contact_person || '',
          contact_position: data.contact_position || '',
          evaluation_methodology: data.evaluation_methodology || '',
          requires_registration: data.requires_registration || false,
          requires_trading_license: data.requires_trading_license || false,
          requires_tax_clearance: data.requires_tax_clearance || false,
          requires_nssf_clearance: data.requires_nssf_clearance || false,
          requires_manufacturer_auth: data.requires_manufacturer_auth || false,
          submission_method: data.submission_method || '',
          submission_format: data.submission_format || '',
          required_documents: data.required_documents || [],
          required_forms: data.required_forms || [],
          bid_attachments: data.bid_attachments || [],
          status: data.status || 'Open',
          current_stage: data.current_stage || 'Published',
          award_information: data.award_information || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Only update the fields that are actually in the form
      const updateData: any = {
        reference_number: contract.reference_number,
        title: contract.title,
        category: contract.category,
        procurement_method: contract.procurement_method,
        estimated_value_min: contract.estimated_value_min,
        estimated_value_max: contract.estimated_value_max,
        currency: contract.currency,
        submission_deadline: contract.submission_deadline,
        procuring_entity: contract.procuring_entity,
        status: contract.status,
        current_stage: contract.current_stage,
        updated_at: new Date().toISOString()
      };

      // Only add optional fields if they have values
      if (contract.short_description) updateData.short_description = contract.short_description;
      if (contract.bid_fee) updateData.bid_fee = contract.bid_fee;
      if (contract.bid_security_amount) updateData.bid_security_amount = contract.bid_security_amount;
      if (contract.bid_security_type) updateData.bid_security_type = contract.bid_security_type;
      if (contract.publish_date) updateData.publish_date = contract.publish_date;
      if (contract.pre_bid_meeting_date) updateData.pre_bid_meeting_date = contract.pre_bid_meeting_date;
      if (contract.site_visit_date) updateData.site_visit_date = contract.site_visit_date;
      if (contract.bid_opening_date) updateData.bid_opening_date = contract.bid_opening_date;
      if (contract.contact_person) updateData.contact_person = contract.contact_person;
      if (contract.contact_position) updateData.contact_position = contract.contact_position;
      if (contract.evaluation_methodology) updateData.evaluation_methodology = contract.evaluation_methodology;
      if (contract.submission_method) updateData.submission_method = contract.submission_method;
      if (contract.submission_format) updateData.submission_format = contract.submission_format;
      if (contract.award_information) updateData.award_information = contract.award_information;

      // Add boolean fields
      updateData.margin_of_preference = contract.margin_of_preference;
      updateData.competition_level = contract.competition_level;
      updateData.requires_registration = contract.requires_registration;
      updateData.requires_trading_license = contract.requires_trading_license;
      updateData.requires_tax_clearance = contract.requires_tax_clearance;
      updateData.requires_nssf_clearance = contract.requires_nssf_clearance;
      updateData.requires_manufacturer_auth = contract.requires_manufacturer_auth;

      // Add array fields only if they exist
      if (contract.required_documents && contract.required_documents.length > 0) {
        updateData.required_documents = contract.required_documents;
      }
      if (contract.required_forms && contract.required_forms.length > 0) {
        updateData.required_forms = contract.required_forms;
      }
      if (contract.bid_attachments && contract.bid_attachments.length > 0) {
        updateData.bid_attachments = contract.bid_attachments;
      }

      console.log('Updating contract with data:', updateData);

      const { error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating contract:', error);
        alert('Failed to update contract');
        return;
      }

      alert('Contract updated successfully!');
      router.push('/admin/contracts');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update contract');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></Loader2>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/contracts"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
            <p className="text-sm text-gray-600">Update contract information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
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
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procurement Method *
              </label>
              <select
                required
                value={contract.procurement_method}
                onChange={(e) => setContract(prev => ({ ...prev, procurement_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select method</option>
                {procurementMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value Min
              </label>
              <input
                type="number"
                value={contract.estimated_value_min || ''}
                onChange={(e) => setContract(prev => ({ ...prev, estimated_value_min: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value Max
              </label>
              <input
                type="number"
                value={contract.estimated_value_max || ''}
                onChange={(e) => setContract(prev => ({ ...prev, estimated_value_max: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Procuring Entity *
              </label>
              <input
                type="text"
                required
                value={contract.procuring_entity}
                onChange={(e) => setContract(prev => ({ ...prev, procuring_entity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stage *
              </label>
              <select
                required
                value={contract.current_stage}
                onChange={(e) => setContract(prev => ({ ...prev, current_stage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
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
