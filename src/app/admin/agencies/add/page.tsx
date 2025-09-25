'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Building, 
  Save, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  User,
  Search,
  X
} from 'lucide-react';
import Link from 'next/link';

interface AgencyForm {
  entity_name: string;
  entity_type: string;
  parent_entity_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  is_active: boolean;
  data_source: string;
  description?: string;
}

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

export default function AddAgencyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [duplicateValidation, setDuplicateValidation] = useState<DuplicateValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  const [formData, setFormData] = useState<AgencyForm>({
    entity_name: '',
    entity_type: 'government_entity',
    parent_entity_id: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    city: '',
    country: 'Uganda',
    is_active: true,
    data_source: 'manual',
    description: ''
  });

  // Debounced validation function
  const validateEntityName = async (entityName: string) => {
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
      console.error('Error validating entity name:', error);
    } finally {
      setValidating(false);
    }
  };

  // Debounce the validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.entity_name) {
        validateEntityName(formData.entity_name);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.entity_name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.entity_name.trim()) {
        throw new Error('Agency name is required');
      }

      if (!formData.entity_type) {
        throw new Error('Entity type is required');
      }

      if (!formData.country.trim()) {
        throw new Error('Country is required');
      }

      // Check for duplicates before submission
      if (duplicateValidation && !duplicateValidation.isUnique) {
        throw new Error(`Potential duplicate detected: ${duplicateValidation.recommendation}`);
      }

      // Prepare data for submission
      const agencyData = {
        ...formData,
        entity_name: formData.entity_name.trim(),
        parent_entity_id: formData.parent_entity_id || null,
        contact_person: formData.contact_person?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        contact_phone: formData.contact_phone?.trim() || null,
        website: formData.website?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        country: formData.country.trim(),
        description: formData.description?.trim() || null
      };

      // Insert the new agency
      const { data, error: insertError } = await supabase
        .from('procuring_entities')
        .insert([agencyData])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create agency: ${insertError.message}`);
      }

      setSuccess(true);
      
      // Redirect to agencies list after a short delay
      setTimeout(() => {
        router.push('/admin/agencies');
      }, 2000);

    } catch (error) {
      console.error('Error creating agency:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/agencies"
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Procuring Entities
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Procuring Entity</h1>
          <p className="text-gray-600 mt-2">Create a new government agency or department in the system</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Agency Created Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  The agency has been added to the system. Redirecting to agencies list...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Warning */}
        {showDuplicateWarning && duplicateValidation && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">Potential Duplicate Detected</h3>
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
                        onClick={() => setFormData(prev => ({ ...prev, entity_name: '' }))}
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

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="entity_name"
                    value={formData.entity_name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      duplicateValidation?.isUnique === false 
                        ? 'border-orange-300 focus:ring-orange-500' 
                        : duplicateValidation?.isUnique === true 
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., Ministry of Health"
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
                {duplicateValidation && (
                  <p className={`text-xs mt-1 ${
                    duplicateValidation.isUnique ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {duplicateValidation.isUnique ? '✓ Name appears to be unique' : '⚠ Similar entities found'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type *
                </label>
                <select
                  name="entity_type"
                  value={formData.entity_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="government_entity">Government Entity</option>
                  <option value="ministry">Ministry</option>
                  <option value="department">Department</option>
                  <option value="agency">Agency</option>
                  <option value="authority">Authority</option>
                  <option value="commission">Commission</option>
                  <option value="corporation">Corporation</option>
                  <option value="board">Board</option>
                  <option value="council">Council</option>
                  <option value="office">Office</option>
                  <option value="bureau">Bureau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Uganda">Uganda</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Burundi">Burundi</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Contact Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., contact@ministry.gov.ug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., +256 123 456 789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., https://www.ministry.gov.ug"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Location Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Kampala"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Plot 1, Parliament Avenue"
                />
              </div>

              {/* Additional Information */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Additional Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Source
                </label>
                <select
                  name="data_source"
                  value={formData.data_source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="migration">Migration</option>
                  <option value="scraper">Scraper</option>
                  <option value="government_csv">Government CSV</option>
                  <option value="api">API</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the agency's role and responsibilities..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/admin/agencies"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Agency
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
