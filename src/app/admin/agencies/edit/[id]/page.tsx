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
  Loader
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

export default function EditAgencyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [agencyId, setAgencyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agencyNotFound, setAgencyNotFound] = useState(false);
  
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

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setAgencyId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (agencyId) {
      fetchAgency();
    }
  }, [agencyId]);

  const fetchAgency = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: agency, error: fetchError } = await supabase
        .from('procuring_entities')
        .select('*')
        .eq('id', agencyId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setAgencyNotFound(true);
          return;
        }
        throw new Error(`Failed to fetch agency: ${fetchError.message}`);
      }

      if (!agency) {
        setAgencyNotFound(true);
        return;
      }

      // Populate form with agency data
      setFormData({
        entity_name: agency.entity_name || '',
        entity_type: agency.entity_type || 'government_entity',
        parent_entity_id: agency.parent_entity_id || '',
        contact_person: agency.contact_person || '',
        contact_email: agency.contact_email || '',
        contact_phone: agency.contact_phone || '',
        website: agency.website || '',
        address: agency.address || '',
        city: agency.city || '',
        country: agency.country || 'Uganda',
        is_active: agency.is_active ?? true,
        data_source: agency.data_source || 'manual',
        description: agency.description || ''
      });

    } catch (error) {
      console.error('Error fetching agency:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
        description: formData.description?.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Update the agency
      const { error: updateError } = await supabase
        .from('procuring_entities')
        .update(agencyData)
        .eq('id', agencyId);

      if (updateError) {
        throw new Error(`Failed to update agency: ${updateError.message}`);
      }

      setSuccess(true);
      
      // Redirect to agencies list after a short delay
      setTimeout(() => {
        router.push('/admin/agencies');
      }, 2000);

    } catch (error) {
      console.error('Error updating agency:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading agency...</p>
        </div>
      </div>
    );
  }

  if (agencyNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Procuring Entity Not Found</h1>
          <p className="text-gray-600 mb-6">The procuring entity you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/admin/agencies"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procuring Entities
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Procuring Entity</h1>
          <p className="text-gray-600 mt-2">Update procuring entity information and settings</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Procuring Entity Updated Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  The procuring entity has been updated. Redirecting to procuring entities list...
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
                <input
                  type="text"
                  name="entity_name"
                  value={formData.entity_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Ministry of Health"
                />
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
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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
