'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft,
  Save,
  Plus
} from 'lucide-react';

interface ContractForm {
  title: string;
  client: string;
  location: string;
  value: string;
  deadline: string;
  category: string;
  description: string;
  status: string;
  posted_date: string;
  requirements: string;
}

export default function AddContract() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContractForm>({
    title: '',
    client: '',
    location: '',
    value: '',
    deadline: '',
    category: 'Other',
    description: '',
    status: 'Open',
    posted_date: new Date().toISOString().split('T')[0],
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const statuses = [
    'Open',
    'Closed',
    'Awarded',
    'Cancelled'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    } else if (isNaN(Number(formData.value))) {
      newErrors.value = 'Value must be a number';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      // Parse requirements as array
      const requirements = formData.requirements ? 
        formData.requirements.split(';').map(req => req.trim()).filter(Boolean) : 
        [];

      const contractData = {
        title: formData.title.trim(),
        client: formData.client.trim(),
        location: formData.location.trim(),
        value: parseFloat(formData.value.replace(/[^\d.]/g, '')) || 0,
        deadline: formData.deadline,
        category: formData.category,
        description: formData.description.trim(),
        status: formData.status,
        posted_date: formData.posted_date,
        requirements: requirements
      };

      const { error } = await supabase
        .from('contracts')
        .insert(contractData);

      if (error) {
        console.error('Error creating contract:', error);
        alert('Failed to create contract. Please try again.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/contracts"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Contracts
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Contract</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new contract manually
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Contract Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter contract title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Client */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Client/Organization *
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.client ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter client name"
              />
              {errors.client && (
                <p className="mt-1 text-sm text-red-600">{errors.client}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Value */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Contract Value (UGX) *
              </label>
              <input
                type="text"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.value ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 50000000"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
            </div>

            {/* Category */}
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Submission Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.deadline ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
              )}
            </div>

            {/* Posted Date */}
            <div>
              <label htmlFor="posted_date" className="block text-sm font-medium text-gray-700 mb-2">
                Posted Date
              </label>
              <input
                type="date"
                id="posted_date"
                name="posted_date"
                value={formData.posted_date}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Status */}
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
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter detailed contract description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter requirements separated by semicolons (e.g., 5 years experience; Valid license; Insurance)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate multiple requirements with semicolons (;)
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/admin/contracts"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
