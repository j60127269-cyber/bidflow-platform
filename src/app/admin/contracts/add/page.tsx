'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { UploadedFile } from '@/lib/storageService';
import { CANONICAL_CATEGORIES } from '@/lib/categories';
import BidderList from '@/components/BidderList';
import { ContractBidder } from '@/types/bidder-types';
// Removed direct import of findOrCreateAwardee - will use API instead

interface DuplicateValidation {
  isUnique: boolean;
  hasExactMatch: boolean;
  potentialDuplicates: Array<{
    id: string;
    entity_name: string;
    entity_type: string;
    country: string;
    website?: string;
    similarity: number;
  }>;
  exactMatches: Array<{
    id: string;
    entity_name: string;
    entity_type: string;
    country: string;
    website?: string;
  }>;
  recommendation: string;
}

interface ContractForm {
  // 1. BASIC TENDER INFORMATION (19 variables)
  reference_number: string;
  title: string;
  short_description: string;
  category: string;
  procurement_method: string;
  estimated_value_min: string;
  estimated_value_max: string;
  currency: string;
  bid_fee: string;
  bid_security_amount: string;
  bid_security_type: string;
  margin_of_preference: boolean;
  competition_level: string;
  publish_date: string;
  pre_bid_meeting_date: string;
  site_visit_date: string;
  submission_deadline: string;
  bid_opening_date: string;
  
  // 2. PROCURING ENTITY INFORMATION (4 variables)
  procuring_entity: string;
  procuring_entity_id?: string;
  contact_person: string;
  contact_position: string;
  
  // 3. ELIGIBILITY & REQUIRED DOCUMENTS (8 variables)
  evaluation_methodology: string;
  requires_registration: boolean;
  requires_trading_license: boolean;
  requires_tax_clearance: boolean;
  requires_nssf_clearance: boolean;
  requires_manufacturer_auth: boolean;
  submission_method: string;
  submission_format: string;
  required_documents: string[];

  bid_attachments: UploadedFile[];
  
  // 4. STATUS & TRACKING (3 variables)
  status: string;
  current_stage: string;
  award_information: string;
  
  // 5. AWARD INFORMATION (4 variables)
  awarded_value?: number;
  awarded_to?: string;
  award_date?: string;
  awarded_company_id?: string;
}

export default function AddContract() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContractForm>({
    // Basic Tender Information
    reference_number: '',
    title: '',
    short_description: '',
    category: 'supplies',
    procurement_method: 'open domestic bidding',
    estimated_value_min: '',
    estimated_value_max: '',
    currency: 'UGX',
    bid_fee: '',
    bid_security_amount: '',
    bid_security_type: '',
    margin_of_preference: false,
    competition_level: 'medium',
    publish_date: '',
    pre_bid_meeting_date: '',
    site_visit_date: '',
    submission_deadline: '',
    bid_opening_date: '',
    
    // Procuring Entity Information
    procuring_entity: '',
    procuring_entity_id: undefined,
    contact_person: '',
    contact_position: '',
    
    // Eligibility & Required Documents
    evaluation_methodology: '',
    requires_registration: true,
    requires_trading_license: true,
    requires_tax_clearance: true,
    requires_nssf_clearance: true,
    requires_manufacturer_auth: false,
    submission_method: 'physical',
    submission_format: '',
    required_documents: [],
    
    bid_attachments: [] as UploadedFile[],
    
    // Status & Tracking
    status: 'open',
    current_stage: 'published',
    award_information: '',
    
    // Award Information
    awarded_value: undefined,
    awarded_to: '',
    award_date: '',
    awarded_company_id: undefined
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newDocument, setNewDocument] = useState('');
  const [bidders, setBidders] = useState<ContractBidder[]>([]);
  const [contractId, setContractId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [awardees, setAwardees] = useState<any[]>([]);
  const [selectedAwardeeId, setSelectedAwardeeId] = useState<string>('');
  const [procuringEntities, setProcuringEntities] = useState<any[]>([]);
  const [selectedProcuringEntityId, setSelectedProcuringEntityId] = useState<string>('');
  const [duplicateValidation, setDuplicateValidation] = useState<DuplicateValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Save form data to localStorage
  const saveFormData = () => {
    localStorage.setItem('contract_add_draft', JSON.stringify(formData));
    setHasUnsavedChanges(true);
    console.log('Form data saved to localStorage:', formData);
  };

  // Load form data from localStorage
  const loadFormData = () => {
    const savedData = localStorage.getItem('contract_add_draft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setHasUnsavedChanges(true);
        console.log('Form data loaded from localStorage:', parsedData);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
        localStorage.removeItem('contract_add_draft');
      }
    }
  };

  // Clear saved form data
  const clearSavedData = () => {
    localStorage.removeItem('contract_add_draft');
    setHasUnsavedChanges(false);
  };

  const fetchBidders = async () => {
    if (!contractId) return;
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/bidders`);
      if (response.ok) {
        const data = await response.json();
        setBidders(data.bidders || []);
      }
    } catch (error) {
      console.error('Error fetching bidders:', error);
    }
  };

  // Load saved form data on component mount
  useEffect(() => {
    loadFormData();
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    // Only save if we have some data and it's not the initial empty state
    if (formData.reference_number || formData.title || formData.procuring_entity) {
      saveFormData();
    }
  }, [formData]);

  // Fetch bidders when contractId changes
  useEffect(() => {
    if (contractId) {
      fetchBidders();
    }
  }, [contractId]);

  // Fetch awardees on component mount
  useEffect(() => {
    fetchAwardees();
  }, []);

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

  const createWinnerBidder = async (contractId: string) => {
    try {
      // If no awardee is linked, create one automatically
      if (!formData.awarded_company_id && formData.awarded_to) {
        try {
          const response = await fetch('/api/awardees', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              company_name: formData.awarded_to,
              description: `Automatically created from contract award: ${formData.reference_number}`
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              // Update the form data with the awardee ID
              setFormData(prev => ({ ...prev, awarded_company_id: result.awardee.id }));
              console.log('Awardee created/updated:', result.awardee.company_name);
            }
          } else {
            console.error('Failed to create awardee via API');
          }
        } catch (error) {
          console.error('Error creating awardee:', error);
        }
      }

      const winnerBidderData = {
        company_name: formData.awarded_to,
        bid_amount: formData.awarded_value?.toString(),
        rank: '1',
        bid_status: 'awarded',
        preliminary_evaluation: 'compliant',
        detailed_evaluation: 'responsive',
        financial_evaluation: 'passed',
        is_winner: true,
        is_runner_up: false,
        evaluation_date: formData.award_date || new Date().toISOString().split('T')[0],
        notes: 'Automatically created from award information'
      };

      const response = await fetch(`/api/contracts/${contractId}/bidders`, {
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

  const fetchAwardees = async () => {
    try {
      const response = await fetch('/api/awardees?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setAwardees(data.awardees);
      } else {
        console.error('Error fetching awardees:', data.error);
      }
    } catch (error) {
      console.error('Error fetching awardees:', error);
    }
  };

  // Find or create procuring entity
  // Debounced validation function for procuring entity
  const validateProcuringEntityName = async (entityName: string) => {
    if (!entityName.trim() || entityName.length < 3) {
      setDuplicateValidation(null);
      setShowDuplicateWarning(false);
      return;
    }

    try {
      setValidating(true);
      const response = await fetch('/api/procuring-entities/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityName }),
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicateValidation(data.validation);
        setShowDuplicateWarning(!data.validation.isUnique);
      }
    } catch (error) {
      console.error('Error validating procuring entity name:', error);
    } finally {
      setValidating(false);
    }
  };

  const findOrCreateProcuringEntity = async (entityName: string, contactPerson?: string, contactPosition?: string) => {
    if (!entityName.trim()) return;

    try {
      const response = await fetch('/api/procuring-entities/find-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_name: entityName,
          contact_person: contactPerson,
          contact_position: contactPosition
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.entity) {
          setFormData(prev => ({
            ...prev,
            procuring_entity_id: result.entity.id
          }));
          setSelectedProcuringEntityId(result.entity.id);
          console.log('✅ Linked to procuring entity:', result.entity.entity_name, result.created ? '(created)' : '(found)');
        }
      } else {
        console.error('Failed to find or create procuring entity');
      }
    } catch (error) {
      console.error('Error finding or creating procuring entity:', error);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-link procuring entity when entity name changes
    if (name === 'procuring_entity' && value.trim()) {
      // Validate for duplicates first
      setTimeout(() => {
        validateProcuringEntityName(value);
      }, 500);
      
      // Then find or create entity
      setTimeout(() => {
        findOrCreateProcuringEntity(value, formData.contact_person, formData.contact_position);
      }, 1000);
    }
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      // Split by comma and filter out empty strings
      const documents = newDocument
        .split(',')
        .map(doc => doc.trim())
        .filter(doc => doc.length > 0);
      
      if (documents.length > 0) {
        setFormData(prev => ({
          ...prev,
          required_documents: [...prev.required_documents, ...documents]
        }));
        setNewDocument('');
      }
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      required_documents: prev.required_documents.filter((_, i) => i !== index)
    }));
  };



  const handleFilesUploaded = (files: UploadedFile[]) => {
    setFormData(prev => ({
      ...prev,
      bid_attachments: [...prev.bid_attachments, ...files]
    }));
  };

  const handleFileDeleted = (filePath: string) => {
    setFormData(prev => ({
      ...prev,
      bid_attachments: prev.bid_attachments.filter(file => file.path !== filePath)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.reference_number.trim()) {
      newErrors.reference_number = 'Reference number is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.procuring_entity.trim()) {
      newErrors.procuring_entity = 'Procuring entity is required';
    }
    if (!formData.submission_deadline) {
      newErrors.submission_deadline = 'Submission deadline is required';
    }
    if (formData.estimated_value_min && formData.estimated_value_max) {
      const min = parseFloat(formData.estimated_value_min);
      const max = parseFloat(formData.estimated_value_max);
      if (min > max) {
        newErrors.estimated_value_max = 'Maximum value must be greater than minimum value';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const contractData = {
        ...formData,
        estimated_value_min: formData.estimated_value_min ? parseFloat(formData.estimated_value_min) : null,
        estimated_value_max: formData.estimated_value_max ? parseFloat(formData.estimated_value_max) : null,
        bid_security_amount: formData.bid_security_amount ? parseFloat(formData.bid_security_amount) : null,
        publish_date: formData.publish_date || null,
        pre_bid_meeting_date: formData.pre_bid_meeting_date || null,
        site_visit_date: formData.site_visit_date || null,
        bid_opening_date: formData.bid_opening_date || null,
        contact_person: formData.contact_person || null,
        contact_position: formData.contact_position || null,
        evaluation_methodology: formData.evaluation_methodology || null,
        submission_method: formData.submission_method || null,
        submission_format: formData.submission_format || null,
        award_information: formData.award_information || null,
        awarded_value: formData.awarded_value || null,
        awarded_to: formData.awarded_to || null,
        award_date: formData.award_date || null,
        awarded_company_id: formData.awarded_company_id || null
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      const result = await response.json();
      console.log('Contract creation response:', result);

      if (!response.ok) {
        console.error('Error creating contract:', result.error);
        
        // Handle specific error cases
        if (result.error && result.error.includes('duplicate key value violates unique constraint "contracts_reference_number_key"')) {
          alert('Failed to create contract: A contract with this reference number already exists. Please use a different reference number.');
        } else {
        alert(`Failed to create contract: ${result.error || 'Unknown error'}`);
        }
        return;
      }

      if (!result.data || !result.data.id) {
        console.error('Invalid response structure:', result);
        alert('Failed to create contract: Invalid response from server');
        return;
      }

      // Set the contract ID for bidder management
      setContractId(result.data.id);
      
      // If contract status is "awarded" and we have award information,
      // automatically create a winner bidder entry
      if (formData.status === 'awarded' && 
          formData.awarded_to && 
          formData.awarded_value) {
        await createWinnerBidder(result.data.id);
      }
      
      alert('Contract created successfully! You can now add bidders below.');
      clearSavedData(); // Clear saved form data after successful creation
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = CANONICAL_CATEGORIES;

  const procurementMethods = [
    'open domestic bidding',
    'restricted bidding',
    'direct procurement',
    'framework agreement',
    'request for quotations',
    'request for proposals',
    'single source'
  ];

  const competitionLevels = [
    'low',
    'medium',
    'high',
    'very_high'
  ];

  const statuses = ['open', 'closed', 'awarded', 'cancelled'];
  const stages = ['published', 'pre-bid meeting', 'site visit', 'submission', 'evaluation', 'award', 'contract signed'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/contracts"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Contract</h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Duplicate Warning */}
            {showDuplicateWarning && duplicateValidation && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-orange-800">Potential Duplicate Procuring Entity</h3>
                    <p className="text-sm text-orange-700 mt-1">{duplicateValidation.recommendation}</p>
                    
                    {duplicateValidation.potentialDuplicates.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-orange-800 mb-2">Similar entities found:</p>
                        <div className="space-y-2">
                          {duplicateValidation.potentialDuplicates.slice(0, 3).map((duplicate, index) => (
                            <div key={duplicate.id} className="bg-orange-100 rounded p-2 text-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{duplicate.entity_name}</span>
                                  <span className="text-orange-600 ml-2">({duplicate.entity_type})</span>
                                </div>
                                <span className="text-orange-600 text-xs">
                                  {Math.round(duplicate.similarity * 100)}% similar
                                </span>
                              </div>
                              {duplicate.website && (
                                <div className="text-xs text-orange-600 mt-1">{duplicate.website}</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowDuplicateWarning(false)}
                            className="text-sm text-orange-600 hover:text-orange-800 underline"
                          >
                            Continue anyway
                          </button>
                          <span className="text-orange-600">•</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, procuring_entity: '' }))}
                            className="text-sm text-orange-600 hover:text-orange-800 underline"
                          >
                            Change name
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDuplicateWarning(false)}
                    className="text-orange-400 hover:text-orange-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 1. BASIC TENDER INFORMATION */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Tender Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div>
                  <label htmlFor="reference_number" className="block text-sm font-medium text-gray-900 mb-2">
                    Reference Number *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Must be unique - check existing contracts to avoid duplicates
                  </p>
                  <input
                    type="text"
                    id="reference_number"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    placeholder="e.g., URSB/SUPLS/2025-2026/00011"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                      errors.reference_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.reference_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.reference_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Contract title"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-900 mb-2">
                    Short Description
                  </label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Brief description of the contract"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="procurement_method" className="block text-sm font-medium text-gray-900 mb-2">
                    Procurement Method
                  </label>
                  <select
                    id="procurement_method"
                    name="procurement_method"
                    value={formData.procurement_method}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  >
                    {procurementMethods.map(method => (
                      <option key={method} value={method}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="estimated_value_min" className="block text-sm font-medium text-gray-900 mb-2">
                    Estimated Value Min
                  </label>
                  <input
                    type="number"
                    id="estimated_value_min"
                    name="estimated_value_min"
                    value={formData.estimated_value_min}
                    onChange={handleInputChange}
                    placeholder="Minimum value"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="estimated_value_max" className="block text-sm font-medium text-gray-900 mb-2">
                    Estimated Value Max
                  </label>
                  <input
                    type="number"
                    id="estimated_value_max"
                    name="estimated_value_max"
                    value={formData.estimated_value_max}
                    onChange={handleInputChange}
                    placeholder="Maximum value"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                      errors.estimated_value_max ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.estimated_value_max && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_value_max}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-900 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  >
                    <option value="UGX">UGX</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bid_fee" className="block text-sm font-medium text-gray-900 mb-2">
                    Bid Fee
                  </label>
                  <input
                    type="number"
                    id="bid_fee"
                    name="bid_fee"
                    value={formData.bid_fee}
                    onChange={handleInputChange}
                    placeholder="Bid fee amount"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="bid_security_amount" className="block text-sm font-medium text-gray-900 mb-2">
                    Bid Security Amount
                  </label>
                  <input
                    type="number"
                    id="bid_security_amount"
                    name="bid_security_amount"
                    value={formData.bid_security_amount}
                    onChange={handleInputChange}
                    placeholder="Security amount"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="bid_security_type" className="block text-sm font-medium text-gray-900 mb-2">
                    Bid Security Type
                  </label>
                  <input
                    type="text"
                    id="bid_security_type"
                    name="bid_security_type"
                    value={formData.bid_security_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Bank Guarantee"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="competition_level" className="block text-sm font-medium text-gray-900 mb-2">
                    Competition Level
                  </label>
                  <select
                    id="competition_level"
                    name="competition_level"
                    value={formData.competition_level}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  >
                    {competitionLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="margin_of_preference"
                    name="margin_of_preference"
                    checked={formData.margin_of_preference}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="margin_of_preference" className="ml-2 block text-sm text-gray-900">
                    Margin of Preference Applicable
                  </label>
                </div>

                <div>
                  <label htmlFor="publish_date" className="block text-sm font-medium text-gray-900 mb-2">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    id="publish_date"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="pre_bid_meeting_date" className="block text-sm font-medium text-gray-900 mb-2">
                    Pre-bid Meeting Date
                  </label>
                  <input
                    type="date"
                    id="pre_bid_meeting_date"
                    name="pre_bid_meeting_date"
                    value={formData.pre_bid_meeting_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="site_visit_date" className="block text-sm font-medium text-gray-900 mb-2">
                    Site Visit Date
                  </label>
                  <input
                    type="date"
                    id="site_visit_date"
                    name="site_visit_date"
                    value={formData.site_visit_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="submission_deadline" className="block text-sm font-medium text-gray-900 mb-2">
                    Submission Deadline *
                  </label>
                  <input
                    type="date"
                    id="submission_deadline"
                    name="submission_deadline"
                    value={formData.submission_deadline}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                      errors.submission_deadline ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.submission_deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.submission_deadline}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bid_opening_date" className="block text-sm font-medium text-gray-900 mb-2">
                    Bid Opening Date
                  </label>
                  <input
                    type="date"
                    id="bid_opening_date"
                    name="bid_opening_date"
                    value={formData.bid_opening_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. PROCURING ENTITY INFORMATION */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Procuring Entity Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div>
                  <label htmlFor="procuring_entity" className="block text-sm font-medium text-gray-900 mb-2">
                    Entity Name *
                  </label>
                  <div className="relative">
                  <input
                    type="text"
                    id="procuring_entity"
                    name="procuring_entity"
                    value={formData.procuring_entity}
                    onChange={handleInputChange}
                    placeholder="Procuring entity name"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                        errors.procuring_entity 
                          ? 'border-red-300' 
                          : duplicateValidation?.isUnique === false 
                          ? 'border-orange-300 focus:ring-orange-500' 
                          : duplicateValidation?.isUnique === true 
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-gray-300'
                    }`}
                  />
                    {validating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {!validating && duplicateValidation && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {duplicateValidation.isUnique ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {errors.procuring_entity && (
                    <p className="mt-1 text-sm text-red-600">{errors.procuring_entity}</p>
                  )}
                  {duplicateValidation && !errors.procuring_entity && (
                    <p className={`text-xs mt-1 ${
                      duplicateValidation.isUnique ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {duplicateValidation.isUnique ? '✓ Name appears to be unique' : '⚠ Similar entities found'}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact_person" className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    placeholder="Contact person name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="contact_position" className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Position
                  </label>
                  <input
                    type="text"
                    id="contact_position"
                    name="contact_position"
                    value={formData.contact_position}
                    onChange={handleInputChange}
                    placeholder="Contact person position"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="evaluation_methodology" className="block text-sm font-medium text-gray-900 mb-2">
                    Evaluation Methodology
                  </label>
                  <input
                    type="text"
                    id="evaluation_methodology"
                    name="evaluation_methodology"
                    value={formData.evaluation_methodology}
                    onChange={handleInputChange}
                    placeholder="e.g., Technical Compliance Selection"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* 3. ELIGIBILITY & REQUIRED DOCUMENTS */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Eligibility & Required Documents</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_registration"
                      name="requires_registration"
                      checked={formData.requires_registration}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_registration" className="ml-2 block text-sm text-gray-900">
                      Registration/Incorporation
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_trading_license"
                      name="requires_trading_license"
                      checked={formData.requires_trading_license}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_trading_license" className="ml-2 block text-sm text-gray-900">
                      Trading License
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_tax_clearance"
                      name="requires_tax_clearance"
                      checked={formData.requires_tax_clearance}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_tax_clearance" className="ml-2 block text-sm text-gray-900">
                      Tax Clearance Certificate
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_nssf_clearance"
                      name="requires_nssf_clearance"
                      checked={formData.requires_nssf_clearance}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_nssf_clearance" className="ml-2 block text-sm text-gray-900">
                      NSSF Clearance
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_manufacturer_auth"
                      name="requires_manufacturer_auth"
                      checked={formData.requires_manufacturer_auth}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_manufacturer_auth" className="ml-2 block text-sm text-gray-900">
                      Manufacturer's Authorization
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="submission_method" className="block text-sm font-medium text-gray-900 mb-2">
                      Submission Method
                    </label>
                    <select
                      id="submission_method"
                      name="submission_method"
                      value={formData.submission_method}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    >
                      <option value="physical">Physical</option>
                      <option value="online">Online</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="submission_format" className="block text-sm font-medium text-gray-900 mb-2">
                      Submission Format
                    </label>
                    <input
                      type="text"
                      id="submission_format"
                      name="submission_format"
                      value={formData.submission_format}
                      onChange={handleInputChange}
                      placeholder="e.g., Electronic submission"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Required Documents
                  </label>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      💡 <strong>Tip:</strong> You can add multiple documents at once by separating them with commas
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Example: "Company Registration Certificate, Tax Clearance Certificate, Technical Proposal"
                    </p>
                  </div>
                  <div className="space-y-2">
                    {formData.required_documents.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                          {doc}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newDocument}
                        onChange={(e) => setNewDocument(e.target.value)}
                        placeholder="Add required document(s) - separate multiple with commas"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                      />
                      <button
                        type="button"
                        onClick={addDocument}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>



                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Bid Attachments
                  </label>
                  <FileUpload
                    contractId="new"
                    onFilesUploaded={handleFilesUploaded}
                    existingFiles={formData.bid_attachments}
                    onFileDeleted={handleFileDeleted}
                  />
                </div>
              </div>
            </div>

            {/* 4. STATUS & TRACKING */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Tracking</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="current_stage" className="block text-sm font-medium text-gray-900 mb-2">
                    Current Stage
                  </label>
                  <select
                    id="current_stage"
                    name="current_stage"
                    value={formData.current_stage}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="award_information" className="block text-sm font-medium text-gray-900 mb-2">
                    Award Information
                  </label>
                  <textarea
                    id="award_information"
                    name="award_information"
                    value={formData.award_information}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Information about award if status is 'awarded'"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                {/* Award Details - Show when status is 'awarded' */}
                {formData.status === 'awarded' && (
                  <>
                    <div>
                      <label htmlFor="awarded_value" className="block text-sm font-medium text-gray-900 mb-2">
                        Awarded Value
                      </label>
                      <input
                        type="number"
                        id="awarded_value"
                        name="awarded_value"
                        value={formData.awarded_value || ''}
                        onChange={handleInputChange}
                        placeholder="Actual awarded amount"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="awarded_to" className="block text-sm font-medium text-gray-900 mb-2">
                        Awarded To
                      </label>
                      <div className="space-y-2">
                        <select
                          value={selectedAwardeeId}
                          onChange={(e) => {
                            const awardeeId = e.target.value;
                            setSelectedAwardeeId(awardeeId);
                            if (awardeeId) {
                              const selectedAwardee = awardees.find(a => a.id === awardeeId);
                              if (selectedAwardee) {
                                setFormData(prev => ({ 
                                  ...prev,
                                  awarded_to: selectedAwardee.company_name,
                                  awarded_company_id: selectedAwardee.id 
                                }));
                              }
                            } else {
                              setFormData(prev => ({ 
                                ...prev,
                                awarded_to: '',
                                awarded_company_id: undefined 
                              }));
                            }
                          }}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        >
                          <option value="">Select an awardee or enter manually</option>
                          {awardees.map((awardee) => (
                            <option key={awardee.id} value={awardee.id}>
                              {awardee.company_name}
                            </option>
                          ))}
                        </select>
                      <input
                        type="text"
                        id="awarded_to"
                        name="awarded_to"
                        value={formData.awarded_to}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, awarded_to: e.target.value }));
                            setSelectedAwardeeId(''); // Clear selection when typing manually
                          }}
                          placeholder="Or enter company name manually"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="award_date" className="block text-sm font-medium text-gray-900 mb-2">
                        Award Date
                      </label>
                      <input
                        type="date"
                        id="award_date"
                        name="award_date"
                        value={formData.award_date}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bidder Management - Show after contract is created */}
            {contractId && (
              <div className="border-b border-gray-200 pb-6">
                <BidderList 
                  contractId={contractId} 
                  bidders={bidders} 
                  onBidderUpdate={fetchBidders}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all saved data?')) {
                        clearSavedData();
                        setFormData({
                          reference_number: '',
                          title: '',
                          short_description: '',
                          category: '',
                          procurement_method: '',
                          estimated_value_min: '',
                          estimated_value_max: '',
                          currency: 'UGX',
                          bid_fee: '',
                          bid_security_amount: '',
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
                          bid_attachments: [],
                          status: 'open',
                          current_stage: 'published',
                          award_information: '',
                          awarded_value: undefined,
                          awarded_to: '',
                          award_date: ''
                        });
                      }
                    }}
                    className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Clear Draft
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
              <Link
                href="/admin/contracts"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {hasUnsavedChanges ? 'Create Contract*' : 'Create Contract'}
                  </>
                )}
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
