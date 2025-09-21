'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';

interface AwardeeFormData {
  company_name: string;
  registration_number: string;
  business_type: string;
  female_owned: boolean;
  primary_categories: string[];
  locations: string[];
  contact_email: string;
  contact_phone: string;
  website: string;
  address: string;
  description: string;
}

export default function EditAwardeePage() {
  const router = useRouter();
  const params = useParams();
  const awardeeId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<AwardeeFormData>({
    company_name: '',
    registration_number: '',
    business_type: '',
    female_owned: false,
    primary_categories: [],
    locations: [],
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    description: ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const businessTypes = [
    'corporation',
    'limited_company',
    'partnership',
    'sole_proprietorship',
    'non_profit',
    'government_entity',
    'cooperative'
  ];

  const commonCategories = [
    'Construction',
    'IT Services',
    'Consulting',
    'Manufacturing',
    'Transportation',
    'Healthcare',
    'Education',
    'Agriculture',
    'Energy',
    'Security Services'
  ];

  const commonLocations = [
    'Kampala',
    'Entebbe',
    'Jinja',
    'Mbarara',
    'Gulu',
    'Central Region',
    'Eastern Region',
    'Northern Region',
    'Western Region'
  ];

  // Fetch awardee data
  useEffect(() => {
    const fetchAwardee = async () => {
      try {
        const response = await fetch(`/api/awardees/${awardeeId}`);
        const data = await response.json();

        if (data.success) {
          const awardee = data.awardee;
          setFormData({
            company_name: awardee.company_name || '',
            registration_number: awardee.registration_number || '',
            business_type: awardee.business_type || '',
            female_owned: awardee.female_owned || false,
            primary_categories: awardee.primary_categories || [],
            locations: awardee.locations || [],
            contact_email: awardee.contact_email || '',
            contact_phone: awardee.contact_phone || '',
            website: awardee.website || '',
            address: awardee.address || '',
            description: awardee.description || ''
          });
        } else {
          alert(`Failed to fetch awardee: ${data.error}`);
          router.push('/admin/awardees');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch awardee');
        router.push('/admin/awardees');
      } finally {
        setLoading(false);
      }
    };

    if (awardeeId) {
      fetchAwardee();
    }
  }, [awardeeId, router]);

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

  const addCategory = () => {
    if (newCategory.trim() && !formData.primary_categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        primary_categories: [...prev.primary_categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      primary_categories: prev.primary_categories.filter(c => c !== category)
    }));
  };

  const addLocation = () => {
    if (newLocation.trim() && !formData.locations.includes(newLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/awardees/${awardeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Awardee updated successfully!');
        router.push('/admin/awardees');
      } else {
        alert(`Failed to update awardee: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update awardee. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading awardee...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/awardees"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Awardees
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Awardee</h1>
            <p className="text-gray-600">Update awardee information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-900 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="registration_number" className="block text-sm font-medium text-gray-900 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="business_type" className="block text-sm font-medium text-gray-900 mb-2">
                  Business Type
                </label>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="female_owned"
                  name="female_owned"
                  checked={formData.female_owned}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="female_owned" className="ml-2 block text-sm text-gray-900">
                  Female Owned Business
                </label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Categories</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.primary_categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Common categories:</p>
                <div className="flex flex-wrap gap-2">
                  {commonCategories.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (!formData.primary_categories.includes(category)) {
                          setFormData(prev => ({
                            ...prev,
                            primary_categories: [...prev.primary_categories, category]
                          }));
                        }
                      }}
                      disabled={formData.primary_categories.includes(category)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.locations.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removeLocation(location)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Common locations:</p>
                <div className="flex flex-wrap gap-2">
                  {commonLocations.map(location => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => {
                        if (!formData.locations.includes(location)) {
                          setFormData(prev => ({
                            ...prev,
                            locations: [...prev.locations, location]
                          }));
                        }
                      }}
                      disabled={formData.locations.includes(location)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-900 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Brief description of the company and its services..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/admin/awardees"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
