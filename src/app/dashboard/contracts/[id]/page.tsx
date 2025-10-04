"use client";

import React from "react";
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
  Info,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { parseBidAttachments, getFileDownloadUrl } from "@/lib/fileDisplayHelper";
import { Contract } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import TrackingSetupModal from "@/components/TrackingSetupModal";
import { TrackingPreferencesService } from "@/lib/trackingPreferences";
import ContractLifecycleTracker from "@/components/ContractLifecycleTracker";

export default function ContractDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contractId = params.id as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [similarContracts, setSimilarContracts] = useState<Contract[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [similarActiveOpportunities, setSimilarActiveOpportunities] = useState<Contract[]>([]);
  const [loadingActiveOpportunities, setLoadingActiveOpportunities] = useState(false);

  useEffect(() => {
    fetchContract();
    if (user) {
      checkTrackingStatus();
    }
  }, [contractId, user]);

  useEffect(() => {
    if (contract) {
      fetchSimilarContracts();
      fetchSimilarActiveOpportunities();
    }
  }, [contract]);

  const checkTrackingStatus = async () => {
    if (!user || !contractId) return;
    
    try {
      const { data, error } = await supabase
        .from('bid_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('contract_id', contractId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking tracking status:', error);
        return;
      }

      setIsTracking(!!data && data.tracking_active);
    } catch (error) {
      console.error('Error checking tracking status:', error);
    }
  };

  const handleTrackContract = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isTracking) {
      // Stop tracking
      setTrackingLoading(true);
      try {
        const { error } = await supabase
          .from('bid_tracking')
          .update({ tracking_active: false })
          .eq('user_id', user.id)
          .eq('contract_id', contractId);

        if (error) {
          console.error('Error stopping tracking:', error);
          return;
        }

        setIsTracking(false);
      } catch (error) {
        console.error('Error stopping tracking:', error);
      } finally {
        setTrackingLoading(false);
      }
    } else {
      // Check if user has existing preferences for one-click tracking
      const hasPreferences = await TrackingPreferencesService.hasExistingPreferences(user.id);
      
      if (hasPreferences) {
        // Try to track with existing preferences
        setTrackingLoading(true);
        try {
          const success = await TrackingPreferencesService.trackContractWithDefaults(user.id, contractId);
          if (success) {
            setIsTracking(true);
          } else {
            // Fallback to modal if tracking fails
            setShowTrackingModal(true);
          }
        } catch (error) {
          console.error('Error tracking with defaults:', error);
          setShowTrackingModal(true);
        } finally {
          setTrackingLoading(false);
        }
      } else {
        // First time tracking - show modal for preferences
        setShowTrackingModal(true);
      }
    }
  };

  const handleTrackingSetup = async (preferences: any) => {
    if (!user || !contract) return;

    setTrackingLoading(true);
    try {
                const { error } = await supabase
            .from('bid_tracking')
            .upsert({
              user_id: user.id,
              contract_id: contractId,
              email_alerts: preferences.email_alerts,
              whatsapp_alerts: preferences.whatsapp_alerts,
              push_alerts: preferences.push_alerts,
              tracking_active: true
            });

      if (error) {
        console.error('Error starting tracking:', error);
        return;
      }

      setIsTracking(true);
      setShowTrackingModal(false);
    } catch (error) {
      console.error('Error starting tracking:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

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

  const fetchSimilarContracts = async () => {
    if (!contract) return;
    
    try {
      setLoadingSimilar(true);
      
      // Get recent awarded contracts from the same procuring entity
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('procuring_entity', contract.procuring_entity)
        .eq('status', 'awarded')
        .order('publish_date', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching recent awards:', error);
        return;
      }

      // If no real data, show demo content
      if (!data || data.length === 0) {
        setSimilarContracts(getDemoAwards(contract.procuring_entity));
      } else {
        setSimilarContracts(data);
      }
    } catch (error) {
      console.error('Error fetching recent awards:', error);
      // Show demo content on error
      setSimilarContracts(getDemoAwards(contract.procuring_entity));
    } finally {
      setLoadingSimilar(false);
    }
  };

  const fetchSimilarActiveOpportunities = async () => {
    if (!contract) return;
    
    setLoadingActiveOpportunities(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('procuring_entity', contract.procuring_entity)
        .eq('status', 'open')
        .order('submission_deadline', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Error fetching active opportunities:', error);
        return;
      }

      // If no real data, show demo content
      if (!data || data.length === 0) {
        setSimilarActiveOpportunities(getDemoActiveOpportunities(contract.procuring_entity));
      } else {
        setSimilarActiveOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching active opportunities:', error);
      // Show demo content on error
      setSimilarActiveOpportunities(getDemoActiveOpportunities(contract.procuring_entity));
    } finally {
      setLoadingActiveOpportunities(false);
    }
  };

  const getDemoAwards = (procuringEntity: string) => {
    const demoAwards = [
      {
        id: 'demo-1',
        reference_number: 'CON-2024-001',
        title: 'Construction of Office Complex Phase 2',
        estimated_value_min: 250000000,
        estimated_value_max: 300000000,
        awarded_value: 275000000,
        awarded_to: 'Kampala Construction Ltd.',
        currency: 'UGX',
        status: 'awarded',
        publish_date: '2024-02-15',
        procuring_entity: procuringEntity
      },
      {
        id: 'demo-2',
        reference_number: 'CON-2024-002',
        title: 'Supply of IT Equipment and Software Licenses',
        estimated_value_min: 45000000,
        estimated_value_max: 55000000,
        awarded_value: 48500000,
        awarded_to: 'Tech Solutions Uganda',
        currency: 'UGX',
        status: 'awarded',
        publish_date: '2024-01-28',
        procuring_entity: procuringEntity
      },
      {
        id: 'demo-3',
        reference_number: 'CON-2024-003',
        title: 'Renovation of Conference Hall and Meeting Rooms',
        estimated_value_min: 80000000,
        estimated_value_max: 95000000,
        awarded_value: 87500000,
        awarded_to: 'Modern Interiors Co.',
        currency: 'UGX',
        status: 'awarded',
        publish_date: '2024-01-10',
        procuring_entity: procuringEntity
      },
      {
        id: 'demo-4',
        reference_number: 'CON-2024-004',
        title: 'Provision of Security Services for 12 Months',
        estimated_value_min: 35000000,
        estimated_value_max: 40000000,
        awarded_value: 37500000,
        awarded_to: 'SecureGuard Services',
        currency: 'UGX',
        status: 'awarded',
        publish_date: '2023-12-20',
        procuring_entity: procuringEntity
      }
    ];
    
    return demoAwards as any[];
  };

  const getDemoActiveOpportunities = (procuringEntity: string) => {
    const demoActiveOpportunities = [
      {
        id: 'demo-active-1',
        reference_number: 'CON-2024-005',
        title: 'Supply of Office Furniture and Equipment',
        estimated_value_min: 35000000,
        estimated_value_max: 45000000,
        currency: 'UGX',
        status: 'open',
        publish_date: '2024-03-01',
        submission_deadline: '2024-04-15',
        procuring_entity: procuringEntity,
        category: 'supplies'
      },
      {
        id: 'demo-active-2',
        reference_number: 'CON-2024-006',
        title: 'Maintenance of Air Conditioning Systems',
        estimated_value_min: 25000000,
        estimated_value_max: 30000000,
        currency: 'UGX',
        status: 'open',
        publish_date: '2024-02-28',
        submission_deadline: '2024-04-10',
        procuring_entity: procuringEntity,
        category: 'services'
      },
      {
        id: 'demo-active-3',
        reference_number: 'CON-2024-007',
        title: 'Construction of Staff Parking Lot',
        estimated_value_min: 150000000,
        estimated_value_max: 180000000,
        currency: 'UGX',
        status: 'open',
        publish_date: '2024-02-25',
        submission_deadline: '2024-04-20',
        procuring_entity: procuringEntity,
        category: 'works'
      },
      {
        id: 'demo-active-4',
        reference_number: 'CON-2024-008',
        title: 'Provision of Catering Services for Events',
        estimated_value_min: 20000000,
        estimated_value_max: 25000000,
        currency: 'UGX',
        status: 'open',
        publish_date: '2024-02-20',
        submission_deadline: '2024-04-05',
        procuring_entity: procuringEntity,
        category: 'services'
      }
    ];
    
    return demoActiveOpportunities as any[];
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
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'very_high': return 'Very High';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading contract details...</p>
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
          <p className="text-black mb-4">{error || 'The contract you are looking for does not exist.'}</p>
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
            </div>
            
            {/* Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {contract.category}
                  </span>
                </div>
                
                {/* Contract Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-3">
                  {contract.title}
                </h1>
                
                {/* Reference Number */}
                <div className="flex items-center text-black">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Reference:</span>
                  <span className="text-sm ml-1 font-mono bg-gray-100 px-2 py-1 rounded">
                    {contract.reference_number || 'Not specified'}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                  <Target className="w-4 h-4 mr-2" />
                  {isTracking ? 'Tracking' : 'Track Contract'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <h2 className="ml-3 text-xl font-semibold text-gray-900">Contract Overview</h2>
              </div>
              
              {/* Short Description */}
              {contract.short_description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-black leading-relaxed">{contract.short_description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Procurement Method</label>
                  <p className="text-gray-900 font-medium">{contract.procurement_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    contract.status === 'open' ? 'bg-green-100 text-green-800' :
                    contract.status === 'closed' ? 'bg-red-100 text-red-800' :
                    contract.status === 'awarded' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Estimated Value</label>
                  <p className="text-gray-900 font-medium">
                    {formatValue(contract.estimated_value_min, contract.estimated_value_max, contract.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Competition Level</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompetitionLevelColor(contract.competition_level)}`}>
                    {getCompetitionLevelText(contract.competition_level)}
                  </span>
                </div>
              </div>
            </div>

            {/* Source Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Source Information</h3>
              </div>
              
              {contract.detail_url ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Original Source</p>
                    <p className="text-sm text-black">View the original tender notice</p>
                  </div>
                  <a
                    href={contract.detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    <span>View Original</span>
                    <Globe className="ml-2 h-4 w-4" />
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">No external source link available</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Timeline</h3>
              </div>
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
                    <p className="mt-1 text-sm text-gray-900 break-words leading-relaxed">{contract.evaluation_methodology}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Required Certificates</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        <li key={index} className="text-sm text-gray-900 break-words leading-relaxed">{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No specific documents required</p>
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
                  <p className="mt-1 text-sm text-gray-900 break-words leading-relaxed">{contract.procuring_entity}</p>
                </div>
                {contract.contact_person && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900 break-words leading-relaxed">{contract.contact_person}</p>
                  </div>
                )}
                {contract.contact_position && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Position</label>
                    <p className="mt-1 text-sm text-gray-900 break-words leading-relaxed">{contract.contact_position}</p>
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
                    <p className="mt-1 text-sm text-gray-900 break-words leading-relaxed">{contract.submission_format}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bid Attachments */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Attachments</h3>
              {(() => {
                const parsedAttachments = parseBidAttachments(contract.bid_attachments || []);
                return parsedAttachments.length > 0 ? (
                  <div className="space-y-2">
                    {parsedAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 break-words">{`File ${index + 1}`}</p>
                            {file.size > 0 && (
                              <p className="text-xs text-gray-500">
                                {Math.round(file.size / 1024)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No bid attachments available</p>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-3">
                <button 
                  onClick={handleTrackContract}
                  disabled={trackingLoading}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                    isTracking 
                      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                      : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                  } ${trackingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {trackingLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <Target className="w-4 h-4 mr-2" />
                  )}
                  {isTracking ? 'Stop Tracking' : 'Track This Contract'}
                </button>
                {isTracking && (
                  <p className="text-sm text-green-600 text-center">
                    ✓ You're tracking this contract. You'll receive alerts for important updates.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Past Similar Awards */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Similar Awards</h2>
            {similarContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Awardee</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Reference</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Award Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Procuring Entity</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Awarded Value</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {similarContracts.map((similarContract) => (
                      <React.Fragment key={similarContract.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {(similarContract as any).awarded_to ? (
                              <Link 
                                href={`/dashboard/awardees/${(similarContract as any).awarded_to?.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                              >
                                <Building className="w-4 h-4 mr-1" />
                                <div className="truncate" title={(similarContract as any).awarded_to}>
                                  {(similarContract as any).awarded_to}
                                </div>
                              </Link>
                            ) : (
                              <span className="text-gray-500">Not specified</span>
                            )}
                          </td>
                        <td className="py-3 px-4">
                          {!similarContract.id.startsWith('demo-') ? (
                            <Link 
                              href={`/dashboard/contracts/${similarContract.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              {similarContract.reference_number || `CON-${similarContract.id.slice(-6)}`}
                            </Link>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {similarContract.reference_number || `CON-${similarContract.id.slice(-6)}`}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                            {formatDate((similarContract as any).award_date || similarContract.publish_date || '')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 max-w-xs">
                            <Link 
                              href={`/dashboard/agencies/${similarContract.procuring_entity?.toLowerCase().replace(/\s+/g, '-')}`}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                            >
                              <Globe className="w-4 h-4 mr-1" />
                          <div className="truncate" title={similarContract.procuring_entity || 'Not specified'}>
                            {similarContract.procuring_entity || 'Not specified'}
                          </div>
                            </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {(similarContract as any).awarded_value ? 
                            formatCurrency((similarContract as any).awarded_value, similarContract.currency) :
                            formatValue(similarContract.estimated_value_min, similarContract.estimated_value_max, similarContract.currency)
                          }
                        </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {(similarContract as any).win_rate || 'N/A'}
                            </span>
                          </td>
                      </tr>
                        <tr>
                          <td colSpan={6} className="px-4 py-2 text-sm text-black bg-gray-50">
                            <strong>Contract:</strong> {similarContract.title}
                            {similarContract.short_description && (
                              <span className="ml-2">- {similarContract.short_description}</span>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No similar contracts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Contract Lifecycle Tracker */}
        <div className="mt-8">
          <ContractLifecycleTracker 
            contract={contract} 
            isAdmin={false}
          />
        </div>

        {/* Similar Active Opportunities */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Similar Active Opportunities</h2>
            {loadingActiveOpportunities ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Loading active opportunities...</p>
              </div>
            ) : similarActiveOpportunities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Reference</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {similarActiveOpportunities.map((opportunity) => (
                      <React.Fragment key={opportunity.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {!opportunity.id.startsWith('demo-') ? (
                              <Link 
                                href={`/dashboard/contracts/${opportunity.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                {opportunity.reference_number || `CON-${opportunity.id.slice(-6)}`}
                              </Link>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {opportunity.reference_number || `CON-${opportunity.id.slice(-6)}`}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={opportunity.title}>
                              {opportunity.title}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              opportunity.category === 'supplies' ? 'bg-blue-100 text-blue-800' :
                              opportunity.category === 'services' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {opportunity.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {formatValue(opportunity.estimated_value_min, opportunity.estimated_value_max, opportunity.currency)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {formatDate(opportunity.submission_deadline)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {opportunity.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={6} className="px-4 py-2 text-sm text-black bg-gray-50">
                            <strong>Procuring Entity:</strong> {opportunity.procuring_entity}
                            {opportunity.short_description && (
                              <span className="ml-2">- {opportunity.short_description}</span>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No active opportunities found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Setup Modal */}
      <TrackingSetupModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        onSave={handleTrackingSetup}
        contractTitle={contract?.title || ''}
        loading={trackingLoading}
      />
    </div>
  );
}
