"use client";

import { 
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Building,
  FileText,
  Download,
  Share2,
  Bookmark,
  Target,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Contract {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export default function ContractDetailsPage() {
  const params = useParams();
  const contractId = params.id as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
        setError('Contract not found');
        return;
      }

      console.log('Fetched contract data:', data); // Debug log
      setContract(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (minValue?: number, maxValue?: number, currency: string = 'UGX') => {
    if (!minValue && !maxValue) return 'Value not specified';
    
    if (minValue && maxValue) {
      return `Estimated ${formatCurrency(minValue, currency)} - ${formatCurrency(maxValue, currency)}`;
    } else if (minValue) {
      return `Estimated ${formatCurrency(minValue, currency)}+`;
    } else if (maxValue) {
      return `Estimated up to ${formatCurrency(maxValue, currency)}`;
    }
    
    return 'Value not specified';
  };

  const formatCurrency = (value: number, currency: string) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B ${currency}`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currency}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${value.toLocaleString()} ${currency}`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompetitionLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitionLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Low Competition';
      case 'medium': return 'Medium Competition';
      case 'high': return 'High Competition';
      case 'very_high': return 'Very High Competition';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contract Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The contract you are looking for does not exist.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{contract.title}</h1>
                <p className="text-sm text-gray-500">Reference: {contract.reference_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
              
              {/* Short Description */}
              {contract.short_description && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{contract.short_description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{contract.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Procurement Method</label>
                  <p className="mt-1 text-sm text-gray-900">{contract.procurement_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estimated Value</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatValue(contract.estimated_value_min, contract.estimated_value_max, contract.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contract.status === 'open' ? 'bg-green-100 text-green-800' :
                    contract.status === 'closed' ? 'bg-red-100 text-red-800' :
                    contract.status === 'awarded' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Competition Level</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompetitionLevelColor(contract.competition_level)}`}>
                    {getCompetitionLevelText(contract.competition_level)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                {contract.publish_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Published</p>
                      <p className="text-sm text-gray-500">{formatDate(contract.publish_date)}</p>
                    </div>
                  </div>
                )}
                {contract.pre_bid_meeting_date && (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pre-bid Meeting</p>
                      <p className="text-sm text-gray-500">{formatDate(contract.pre_bid_meeting_date)}</p>
                    </div>
                  </div>
                )}
                {contract.site_visit_date && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Site Visit</p>
                      <p className="text-sm text-gray-500">{formatDate(contract.site_visit_date)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-red-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submission Deadline</p>
                    <p className="text-sm text-red-600 font-medium">{formatDateTime(contract.submission_deadline)}</p>
                  </div>
                </div>
                {contract.bid_opening_date && (
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bid Opening</p>
                      <p className="text-sm text-gray-500">{formatDateTime(contract.bid_opening_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Eligibility</h2>
              <div className="space-y-4">
                {contract.evaluation_methodology && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Evaluation Methodology</label>
                    <p className="mt-1 text-sm text-gray-900">{contract.evaluation_methodology}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Required Certificates</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {contract.requires_registration && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">Registration/Incorporation</span>
                      </div>
                    )}
                    {contract.requires_trading_license && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">Trading License</span>
                      </div>
                    )}
                    {contract.requires_tax_clearance && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">Tax Clearance Certificate</span>
                      </div>
                    )}
                    {contract.requires_nssf_clearance && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">NSSF Clearance</span>
                      </div>
                    )}
                    {contract.requires_manufacturer_auth && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">Manufacturer's Authorization</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Required Documents</label>
                  {contract.required_documents && contract.required_documents.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {contract.required_documents.map((doc, index) => (
                        <li key={index} className="text-sm text-gray-900">{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No specific documents required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Required Forms</label>
                  {contract.required_forms && contract.required_forms.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {contract.required_forms.map((form, index) => (
                        <li key={index} className="text-sm text-gray-900">{form}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No specific forms required</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Procuring Entity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Procuring Entity</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Entity Name</label>
                  <p className="mt-1 text-sm text-gray-900">{contract.procuring_entity}</p>
                </div>
                {contract.contact_person && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900">{contract.contact_person}</p>
                  </div>
                )}
                {contract.contact_position && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Position</label>
                    <p className="mt-1 text-sm text-gray-900">{contract.contact_position}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="space-y-3">
                {contract.bid_fee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bid Fee</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(contract.bid_fee, contract.currency)}
                    </p>
                  </div>
                )}
                {contract.bid_security_amount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bid Security</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(contract.bid_security_amount, contract.currency)}
                    </p>
                  </div>
                )}
                {contract.bid_security_type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bid Security Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{contract.bid_security_type}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Margin of Preference</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {contract.margin_of_preference ? 'Applicable' : 'Not Applicable'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
              <div className="space-y-3">
                {contract.submission_method && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Method</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{contract.submission_method}</p>
                  </div>
                )}
                {contract.submission_format && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Format</label>
                    <p className="mt-1 text-sm text-gray-900">{contract.submission_format}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bid Attachments */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Attachments</h3>
              {contract.bid_attachments && contract.bid_attachments.length > 0 ? (
                <div className="space-y-2">
                  {contract.bid_attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{attachment}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-500">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bid attachments available</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Target className="w-4 h-4 mr-2" />
                  Track This Contract
                </button>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Download Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
