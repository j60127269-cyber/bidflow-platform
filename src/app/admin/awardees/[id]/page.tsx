'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  Tag, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  FileText,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';

interface Awardee {
  id: string;
  company_name: string;
  registration_number?: string;
  business_type?: string;
  female_owned?: boolean;
  primary_categories?: string[];
  locations?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Contract {
  id: string;
  reference_number: string;
  title: string;
  awarded_value?: number;
  award_date?: string;
  status: string;
  current_stage: string;
}

export default function AwardeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const awardeeId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [awardee, setAwardee] = useState<Awardee | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(true);

  // Fetch awardee data
  useEffect(() => {
    const fetchAwardee = async () => {
      try {
        const response = await fetch(`/api/awardees/${awardeeId}`);
        const data = await response.json();

        if (data.success) {
          setAwardee(data.awardee);
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

  // Fetch contracts for this awardee
  useEffect(() => {
    const fetchContracts = async () => {
      if (!awardeeId) return;
      
      try {
        const response = await fetch(`/api/contracts?awarded_company_id=${awardeeId}`);
        const data = await response.json();

        if (data.success) {
          setContracts(data.contracts || []);
        } else {
          console.error('Error fetching contracts:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setContractsLoading(false);
      }
    };

    fetchContracts();
  }, [awardeeId]);

  const handleDelete = async () => {
    if (!awardee) return;
    
    if (!confirm(`Are you sure you want to delete "${awardee.company_name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/awardees/${awardeeId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        alert('Awardee deleted successfully');
        router.push('/admin/awardees');
      } else {
        alert(`Failed to delete awardee: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete awardee');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'awarded':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!awardee) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Awardee not found</p>
          <Link href="/admin/awardees" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to Awardees
          </Link>
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
            <h1 className="text-2xl font-bold text-gray-900">{awardee.company_name}</h1>
            <p className="text-gray-600">Awardee Profile Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/awardees/edit/${awardeeId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {deleteLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{awardee.company_name}</p>
              </div>
              {awardee.registration_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Registration Number</label>
                  <p className="mt-1 text-sm text-gray-900">{awardee.registration_number}</p>
                </div>
              )}
              {awardee.business_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Business Type</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {awardee.business_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500">Female Owned</label>
                <p className="mt-1 text-sm text-gray-900">
                  {awardee.female_owned ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      Yes
                    </span>
                  ) : (
                    'No'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          {awardee.primary_categories && awardee.primary_categories.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Primary Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {awardee.primary_categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {awardee.locations && awardee.locations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Locations
              </h2>
              <div className="flex flex-wrap gap-2">
                {awardee.locations.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(awardee.contact_email || awardee.contact_phone || awardee.website || awardee.address) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-3">
                {awardee.contact_email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <a
                      href={`mailto:${awardee.contact_email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {awardee.contact_email}
                    </a>
                  </div>
                )}
                {awardee.contact_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <a
                      href={`tel:${awardee.contact_phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {awardee.contact_phone}
                    </a>
                  </div>
                )}
                {awardee.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400 mr-3" />
                    <a
                      href={awardee.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {awardee.website}
                    </a>
                  </div>
                )}
                {awardee.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                    <p className="text-sm text-gray-900">{awardee.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {awardee.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{awardee.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Contract History
            </h2>
            {contractsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading contracts...</p>
              </div>
            ) : contracts.length === 0 ? (
              <p className="text-sm text-gray-600">No contracts found</p>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {contract.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Ref: {contract.reference_number}
                        </p>
                        {contract.awarded_value && (
                          <p className="text-xs text-green-600 font-medium mb-1">
                            {formatCurrency(contract.awarded_value)}
                          </p>
                        )}
                        {contract.award_date && (
                          <p className="text-xs text-gray-500 mb-2">
                            Awarded: {formatDate(contract.award_date)}
                          </p>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Contracts</span>
                <span className="text-sm font-medium text-gray-900">{contracts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(contracts.reduce((sum, contract) => sum + (contract.awarded_value || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Categories</span>
                <span className="text-sm font-medium text-gray-900">
                  {awardee.primary_categories?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Locations</span>
                <span className="text-sm font-medium text-gray-900">
                  {awardee.locations?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Metadata
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(awardee.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(awardee.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
