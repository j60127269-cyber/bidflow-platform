'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { UploadedFile } from '@/lib/storageService';
import { CANONICAL_CATEGORIES } from '@/lib/categories';

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
  
  // 2. PROCURING ENTITY INFORMATION (3 variables)
  procuring_entity: string;
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
    award_information: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newDocument, setNewDocument] = useState('');


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
        award_information: formData.award_information || null
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error creating contract:', result.error);
        alert(`Failed to create contract: ${result.error || 'Unknown error'}`);
        return;
      }

      alert('Contract created successfully!');
      router.push('/admin/contracts');
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
            {/* 1. BASIC TENDER INFORMATION */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Tender Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div>
                  <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number *
                  </label>
                  <input
                    type="text"
                    id="reference_number"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    placeholder="e.g., URSB/SUPLS/2025-2026/00011"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.reference_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.reference_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.reference_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Contract title"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Brief description of the contract"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="procurement_method" className="block text-sm font-medium text-gray-700 mb-2">
                    Procurement Method
                  </label>
                  <select
                    id="procurement_method"
                    name="procurement_method"
                    value={formData.procurement_method}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {procurementMethods.map(method => (
                      <option key={method} value={method}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="estimated_value_min" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value Min
                  </label>
                  <input
                    type="number"
                    id="estimated_value_min"
                    name="estimated_value_min"
                    value={formData.estimated_value_min}
                    onChange={handleInputChange}
                    placeholder="Minimum value"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="estimated_value_max" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value Max
                  </label>
                  <input
                    type="number"
                    id="estimated_value_max"
                    name="estimated_value_max"
                    value={formData.estimated_value_max}
                    onChange={handleInputChange}
                    placeholder="Maximum value"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.estimated_value_max ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.estimated_value_max && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_value_max}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="UGX">UGX</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bid_fee" className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Fee
                  </label>
                  <input
                    type="number"
                    id="bid_fee"
                    name="bid_fee"
                    value={formData.bid_fee}
                    onChange={handleInputChange}
                    placeholder="Bid fee amount"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="bid_security_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Security Amount
                  </label>
                  <input
                    type="number"
                    id="bid_security_amount"
                    name="bid_security_amount"
                    value={formData.bid_security_amount}
                    onChange={handleInputChange}
                    placeholder="Security amount"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="bid_security_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Security Type
                  </label>
                  <input
                    type="text"
                    id="bid_security_type"
                    name="bid_security_type"
                    value={formData.bid_security_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Bank Guarantee"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="competition_level" className="block text-sm font-medium text-gray-700 mb-2">
                    Competition Level
                  </label>
                  <select
                    id="competition_level"
                    name="competition_level"
                    value={formData.competition_level}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    id="publish_date"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="pre_bid_meeting_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-bid Meeting Date
                  </label>
                  <input
                    type="date"
                    id="pre_bid_meeting_date"
                    name="pre_bid_meeting_date"
                    value={formData.pre_bid_meeting_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="site_visit_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Site Visit Date
                  </label>
                  <input
                    type="date"
                    id="site_visit_date"
                    name="site_visit_date"
                    value={formData.site_visit_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="submission_deadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Deadline *
                  </label>
                  <input
                    type="date"
                    id="submission_deadline"
                    name="submission_deadline"
                    value={formData.submission_deadline}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.submission_deadline ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.submission_deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.submission_deadline}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bid_opening_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Opening Date
                  </label>
                  <input
                    type="date"
                    id="bid_opening_date"
                    name="bid_opening_date"
                    value={formData.bid_opening_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. PROCURING ENTITY INFORMATION */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Procuring Entity Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div>
                  <label htmlFor="procuring_entity" className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Name *
                  </label>
                  <input
                    type="text"
                    id="procuring_entity"
                    name="procuring_entity"
                    value={formData.procuring_entity}
                    onChange={handleInputChange}
                    placeholder="Procuring entity name"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.procuring_entity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.procuring_entity && (
                    <p className="mt-1 text-sm text-red-600">{errors.procuring_entity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    placeholder="Contact person name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="contact_position" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Position
                  </label>
                  <input
                    type="text"
                    id="contact_position"
                    name="contact_position"
                    value={formData.contact_position}
                    onChange={handleInputChange}
                    placeholder="Contact person position"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="evaluation_methodology" className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Methodology
                  </label>
                  <input
                    type="text"
                    id="evaluation_methodology"
                    name="evaluation_methodology"
                    value={formData.evaluation_methodology}
                    onChange={handleInputChange}
                    placeholder="e.g., Technical Compliance Selection"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <label htmlFor="submission_method" className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Method
                    </label>
                    <select
                      id="submission_method"
                      name="submission_method"
                      value={formData.submission_method}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="physical">Physical</option>
                      <option value="online">Online</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="submission_format" className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Format
                    </label>
                    <input
                      type="text"
                      id="submission_format"
                      name="submission_format"
                      value={formData.submission_format}
                      onChange={handleInputChange}
                      placeholder="e.g., Electronic submission"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="current_stage" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stage
                  </label>
                  <select
                    id="current_stage"
                    name="current_stage"
                    value={formData.current_stage}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="award_information" className="block text-sm font-medium text-gray-700 mb-2">
                    Award Information
                  </label>
                  <textarea
                    id="award_information"
                    name="award_information"
                    value={formData.award_information}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Information about award if status is 'awarded'"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/contracts"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    Create Contract
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
