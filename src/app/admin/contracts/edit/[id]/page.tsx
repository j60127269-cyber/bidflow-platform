'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { CANONICAL_CATEGORIES } from '@/lib/categories';
import FileUpload from '@/components/FileUpload';
import { UploadedFile } from '@/lib/storageService';
import BidderList from '@/components/BidderList';
import { ContractBidder } from '@/types/bidder-types';

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

  bid_attachments?: UploadedFile[];
  status: string;
  current_stage: string;
  award_information?: string;
  awarded_value?: number;
  awarded_to?: string;
  award_date?: string;
  publish_status: 'draft' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  detail_url?: string;
}

const categories = CANONICAL_CATEGORIES;

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [bidders, setBidders] = useState<ContractBidder[]>([]);
  const [loadingBidders, setLoadingBidders] = useState(false);
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
    
    bid_attachments: [] as UploadedFile[],
    status: 'Open',
    current_stage: 'Published',
    award_information: '',
    awarded_value: undefined,
    awarded_to: '',
    award_date: '',
         publish_status: 'draft',
     published_at: '',
     published_by: '',
     detail_url: ''
  });

  const [newDocument, setNewDocument] = useState('');

  const updateContract = useCallback((updates: Partial<ContractForm>) => {
    setContract(prev => {
      const newContract = { ...prev, ...updates };
      // Save to localStorage
      localStorage.setItem(`contract_edit_${id}`, JSON.stringify(newContract));
      return newContract;
    });
    setHasUnsavedChanges(true);
  }, [id]);

  // Override setContract to track changes
  const setContractWithTracking = useCallback((updater: ContractForm | ((prev: ContractForm) => ContractForm)) => {
    setContract(prev => {
      const newContract = typeof updater === 'function' ? updater(prev) : updater;
      // Save to localStorage
      localStorage.setItem(`contract_edit_${id}`, JSON.stringify(newContract));
      return newContract;
    });
    setHasUnsavedChanges(true);
  }, [id]);

  const addDocument = () => {
    if (newDocument.trim()) {
      // Split by comma and filter out empty strings
      const documents = newDocument
        .split(',')
        .map(doc => doc.trim())
        .filter(doc => doc.length > 0);
      
      if (documents.length > 0) {
        setContractWithTracking(prev => ({
          ...prev,
          required_documents: [...(prev.required_documents || []), ...documents]
        }));
        setNewDocument('');
      }
    }
  };

  const removeDocument = (index: number) => {
    setContractWithTracking(prev => ({
      ...prev,
      required_documents: prev.required_documents?.filter((_, i) => i !== index) || []
    }));
  };



  const handleFilesUploaded = (files: UploadedFile[]) => {
    setContractWithTracking(prev => ({
      ...prev,
      bid_attachments: [...(prev.bid_attachments || []), ...files]
    }));
  };

  const handleFileDeleted = (filePath: string) => {
    setContractWithTracking(prev => ({
      ...prev,
      bid_attachments: (prev.bid_attachments || []).filter(file => file.path !== filePath)
    }));
  };

  const clearSavedData = () => {
    localStorage.removeItem(`contract_edit_${id}`);
    setHasUnsavedChanges(false);
    fetchContract(); // Reload from database
  };

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check for saved form data in localStorage first
      const savedData = localStorage.getItem(`contract_edit_${id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setContract(parsedData);
          setHasUnsavedChanges(true);
          setLoading(false);
          return; // Use saved data instead of fetching from database
        } catch (e) {
          console.error('Error parsing saved data:', e);
          localStorage.removeItem(`contract_edit_${id}`);
        }
      }

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

          bid_attachments: data.bid_attachments ? data.bid_attachments.map((attachment: any) => {
            if (typeof attachment === 'string') {
              try {
                return JSON.parse(attachment);
              } catch {
                return { name: attachment, url: '', size: 0, type: 'application/octet-stream', path: attachment };
              }
            }
            return attachment;
          }) : [],
          status: data.status || 'Open',
          current_stage: data.current_stage || 'Published',
          award_information: data.award_information || '',
          awarded_value: data.awarded_value || undefined,
          awarded_to: data.awarded_to || '',
          award_date: data.award_date || '',
                     publish_status: data.publish_status || 'draft',
           published_at: data.published_at ? new Date(data.published_at).toISOString().split('T')[0] : '',
           published_by: data.published_by || '',
           detail_url: data.detail_url || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBidders = useCallback(async () => {
    try {
      setLoadingBidders(true);
      const response = await fetch(`/api/contracts/${id}/bidders`);
      if (response.ok) {
        const data = await response.json();
        setBidders(data.bidders || []);
      } else {
        console.error('Failed to fetch bidders');
      }
    } catch (error) {
      console.error('Error fetching bidders:', error);
    } finally {
      setLoadingBidders(false);
    }
  }, [id]);

  const createWinnerBidder = async () => {
    try {
      // Check if winner already exists
      const existingWinner = bidders.find(bidder => bidder.is_winner);
      if (existingWinner) {
        console.log('Winner bidder already exists, skipping creation');
        return;
      }

      const winnerBidderData = {
        company_name: contract.awarded_to,
        bid_amount: contract.awarded_value?.toString(),
        rank: '1',
        bid_status: 'awarded',
        preliminary_evaluation: 'compliant',
        detailed_evaluation: 'responsive',
        financial_evaluation: 'passed',
        is_winner: true,
        is_runner_up: false,
        evaluation_date: contract.award_date || new Date().toISOString().split('T')[0],
        notes: 'Automatically created from award information'
      };

      const response = await fetch(`/api/contracts/${id}/bidders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(winnerBidderData),
      });

      if (response.ok) {
        console.log('Winner bidder created successfully');
        // Refresh the bidders list
        fetchBidders();
      } else {
        const error = await response.json();
        console.error('Failed to create winner bidder:', error);
      }
    } catch (error) {
      console.error('Error creating winner bidder:', error);
    }
  };

  useEffect(() => {
    fetchContract();
    fetchBidders();
  }, [fetchContract, fetchBidders]);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const normalizeStatus = (value: string): string => {
        const v = (value || '').toLowerCase();
        // Map UI labels to DB enum values
        switch (v) {
          case 'open':
            return 'open';
          case 'closed':
            return 'closed';
          case 'awarded':
            return 'awarded';
          case 'cancelled':
            return 'cancelled';
          case 'completed':
            return 'completed';
          case 'evaluating':
            return 'evaluating';
          case 'draft':
            return 'draft';
          default:
            return v;
        }
      };

      const normalizeStage = (value: string): string => {
        const v = (value || '').toLowerCase();
        // Map UI labels to DB enum values
        switch (v) {
          case 'published':
            return 'published';
          case 'pre-bid meeting':
          case 'pre bid meeting':
            return 'pre_bid_meeting';
          case 'site visit':
            return 'site_visit';
          case 'submission':
            return 'submission_open';
          case 'evaluation':
            return 'evaluation';
          case 'award':
            return 'awarded';
          case 'contract signed':
            return 'contract_signed';
          case 'in progress':
            return 'in_progress';
          case 'completed':
            return 'completed';
          case 'archived':
            return 'archived';
          default:
            return v;
        }
      };
      
      // Check if we need to update published_at and published_by
      const originalData = await supabase
        .from('contracts')
        .select('publish_status')
        .eq('id', id)
        .single();

      const wasPublished = originalData.data?.publish_status === 'published';
      const isNowPublished = contract.publish_status === 'published';
      
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
        status: normalizeStatus(contract.status),
        current_stage: normalizeStage(contract.current_stage),
        publish_status: contract.publish_status,
        updated_at: new Date().toISOString()
      };

      // If changing from draft/archived to published, set published_at and published_by
      if (!wasPublished && isNowPublished) {
        updateData.published_at = new Date().toISOString();
        // TODO: Get current admin user ID for published_by
        // updateData.published_by = currentAdminUserId;
      }

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
      // Handle award fields - include them even if empty to clear previous values
      updateData.award_information = contract.award_information || null;
      updateData.awarded_value = contract.awarded_value || null;
      updateData.awarded_to = contract.awarded_to || null;
      updateData.award_date = contract.award_date || null;
      updateData.detail_url = contract.detail_url || null;

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

      if (contract.bid_attachments && contract.bid_attachments.length > 0) {
        updateData.bid_attachments = contract.bid_attachments;
      }

      console.log('Updating contract with data:', updateData);
      console.log('Original status:', contract.status, '-> normalized:', normalizeStatus(contract.status));
      console.log('Original current_stage:', contract.current_stage, '-> normalized:', normalizeStage(contract.current_stage));
      console.log('Award fields being sent:', {
        awarded_value: updateData.awarded_value,
        awarded_to: updateData.awarded_to,
        award_date: updateData.award_date,
        status: updateData.status
      });

      const { data, error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating contract:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to update contract: ${error.message}`);
        return;
      }

          console.log('Contract updated successfully:', data);

          // If contract status is changed to "awarded" and we have award information,
          // automatically create a winner bidder entry
          if (normalizeStatus(contract.status) === 'awarded' && 
              contract.awarded_to && 
              contract.awarded_value) {
            await createWinnerBidder();
      }

      alert('Contract updated successfully!');
      setHasUnsavedChanges(false);
      clearSavedData(); // Clear saved form data
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
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  router.push('/admin/contracts');
                }
              } else {
                router.push('/admin/contracts');
              }
            }}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
            <p className="text-sm text-gray-600">Update contract information</p>
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-orange-600">
                  ⚠️ You have unsaved changes
                </p>
                <button
                  type="button"
                  onClick={clearSavedData}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear saved data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Tender Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Tender Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                Reference Number *
              </label>
              <input
                type="text"
                required
                value={contract.reference_number}
                onChange={(e) => updateContract({ reference_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., URSB/SUPLS/2025-2026/00011"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={contract.title}
                onChange={(e) => updateContract({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Contract title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Short Description
              </label>
              <textarea
                value={contract.short_description || ''}
                onChange={(e) => updateContract({ short_description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Brief description of the contract"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Category *
              </label>
              <select
                required
                value={contract.category}
                onChange={(e) => updateContract({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Procurement Method *
              </label>
              <select
                required
                value={contract.procurement_method}
                onChange={(e) => updateContract({ procurement_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select method</option>
                {procurementMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Estimated Value Min
              </label>
              <input
                type="number"
                value={contract.estimated_value_min || ''}
                onChange={(e) => updateContract({ estimated_value_min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Minimum value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Estimated Value Max
              </label>
              <input
                type="number"
                value={contract.estimated_value_max || ''}
                onChange={(e) => updateContract({ estimated_value_max: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Maximum value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Currency *
              </label>
              <select
                required
                value={contract.currency}
                onChange={(e) => updateContract({ currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                <option value="UGX">UGX</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bid Fee
              </label>
              <input
                type="number"
                value={contract.bid_fee || ''}
                onChange={(e) => updateContract({ bid_fee: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Bid fee amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bid Security Amount
              </label>
              <input
                type="number"
                value={contract.bid_security_amount || ''}
                onChange={(e) => updateContract({ bid_security_amount: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Security amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bid Security Type
              </label>
              <input
                type="text"
                value={contract.bid_security_type || ''}
                onChange={(e) => updateContract({ bid_security_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Bank Guarantee"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contract.margin_of_preference}
                  onChange={(e) => updateContract({ margin_of_preference: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Margin of Preference Applicable</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Competition Level *
              </label>
              <select
                required
                value={contract.competition_level}
                onChange={(e) => updateContract({ competition_level: e.target.value as 'low' | 'medium' | 'high' | 'very_high' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                {competitionLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Publish Date
              </label>
              <input
                type="date"
                value={contract.publish_date || ''}
                onChange={(e) => updateContract({ publish_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Pre-bid Meeting Date
              </label>
              <input
                type="date"
                value={contract.pre_bid_meeting_date || ''}
                onChange={(e) => updateContract({ pre_bid_meeting_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Site Visit Date
              </label>
              <input
                type="date"
                value={contract.site_visit_date || ''}
                onChange={(e) => updateContract({ site_visit_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Submission Deadline *
              </label>
              <input
                type="date"
                required
                value={contract.submission_deadline}
                onChange={(e) => updateContract({ submission_deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bid Opening Date
              </label>
              <input
                type="date"
                value={contract.bid_opening_date || ''}
                onChange={(e) => updateContract({ bid_opening_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Procuring Entity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Procuring Entity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Entity Name *
              </label>
              <input
                type="text"
                required
                value={contract.procuring_entity}
                onChange={(e) => updateContract({ procuring_entity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Procuring entity name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contract.contact_person || ''}
                onChange={(e) => updateContract({ contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Contact person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Contact Position
              </label>
              <input
                type="text"
                value={contract.contact_position || ''}
                onChange={(e) => updateContract({ contact_position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Contact person position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Evaluation Methodology
              </label>
              <input
                type="text"
                value={contract.evaluation_methodology || ''}
                onChange={(e) => updateContract({ evaluation_methodology: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Technical Compliance Selection"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contract.requires_registration}
                  onChange={(e) => updateContract({ requires_registration: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Registration/Incorporation</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contract.requires_trading_license}
                  onChange={(e) => updateContract({ requires_trading_license: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Trading License</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contract.requires_tax_clearance}
                  onChange={(e) => updateContract({ requires_tax_clearance: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Tax Clearance Certificate</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contract.requires_nssf_clearance}
                  onChange={(e) => updateContract({ requires_nssf_clearance: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">NSSF Clearance</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contract.requires_manufacturer_auth}
                  onChange={(e) => updateContract({ requires_manufacturer_auth: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">Manufacturer's Authorization</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Submission Method
              </label>
              <input
                type="text"
                value={contract.submission_method || ''}
                onChange={(e) => updateContract({ submission_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Online, Physical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Submission Format
              </label>
              <input
                type="text"
                value={contract.submission_format || ''}
                onChange={(e) => updateContract({ submission_format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Electronic submission"
              />
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h2>
          <div className="space-y-4">
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> You can add multiple documents at once by separating them with commas
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Example: "Company Registration Certificate, Tax Clearance Certificate, Technical Proposal"
              </p>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Add required document(s) - separate multiple with commas"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
              />
              <button
                type="button"
                onClick={addDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {contract.required_documents && contract.required_documents.length > 0 && (
              <ul className="space-y-2">
                {contract.required_documents.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{doc}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>



        {/* Bid Attachments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bid Attachments</h2>
          <FileUpload
            contractId={contract.reference_number || 'edit-contract'}
            onFilesUploaded={handleFilesUploaded}
            existingFiles={contract.bid_attachments}
            onFileDeleted={handleFileDeleted}
          />
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Visibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Publish Status *
              </label>
              <select
                required
                value={contract.publish_status}
                onChange={(e) => updateContract({ publish_status: e.target.value as 'draft' | 'published' | 'archived' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                <option value="draft">Draft (Admin Only)</option>
                <option value="published">Published (Visible to Clients)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {contract.publish_status === 'draft' && 'Only visible to admin users'}
                {contract.publish_status === 'published' && 'Visible to all clients on dashboard'}
                {contract.publish_status === 'archived' && 'Hidden from all users'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Status *
              </label>
              <select
                required
                value={contract.status}
                onChange={(e) => updateContract({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Current Stage *
              </label>
              <select
                required
                value={contract.current_stage}
                onChange={(e) => updateContract({ current_stage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Published Info */}
          {contract.publish_status === 'published' && contract.published_at && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                📅 Published on: {new Date(contract.published_at).toLocaleDateString()} at {new Date(contract.published_at).toLocaleTimeString()}
              </p>
            </div>
          )}

          <div className="mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Award Information
              </label>
              <textarea
                value={contract.award_information || ''}
                onChange={(e) => updateContract({ award_information: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="Award details and information"
              />
            </div>
          </div>

          {/* Awarded Fields */}
          {contract.status === 'Awarded' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Awarded Value
                </label>
                <input
                  type="number"
                  value={contract.awarded_value || ''}
                  onChange={(e) => updateContract({ awarded_value: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                  placeholder="Actual awarded amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Awarded To
                </label>
                <input
                  type="text"
                  value={contract.awarded_to || ''}
                  onChange={(e) => updateContract({ awarded_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                  placeholder="Company that won the contract"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Award Date
                </label>
                <input
                  type="date"
                  value={contract.award_date || ''}
                  onChange={(e) => updateContract({ award_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Bidder Management */}
          <div className="mt-8">
            {contract.status === 'awarded' && contract.awarded_to && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> When you save this contract with "Awarded" status, 
                  a winner bidder entry will be automatically created from the award information above.
                </p>
              </div>
            )}
            <BidderList 
              contractId={id} 
              bidders={bidders} 
              onBidderUpdate={fetchBidders}
            />
          </div>

          {/* Source Information */}
          <div className="mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Detail URL
              </label>
              <input
                type="url"
                value={contract.detail_url || ''}
                onChange={(e) => updateContract({ detail_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="https://egpuganda.go.ug/bid/notice/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link to the original contract details on the procurement portal
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  router.push('/admin/contracts');
                }
              } else {
                router.push('/admin/contracts');
              }
            }}
            className="px-6 py-2 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 ${
              hasUnsavedChanges 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                {hasUnsavedChanges ? 'Save Changes*' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


