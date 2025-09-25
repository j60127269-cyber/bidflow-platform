'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Building2, 
  FileText, 
  Users, 
  TrendingUp,
  Award,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Award {
  id: string;
  title: string;
  reference_number: string;
  status: string;
  estimated_value: number;
  award_date: string;
  awarded_company_id: string;
  awarded_company_name?: string;
  description: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

interface Bidder {
  id: string;
  company_name: string;
  bid_amount: number;
  is_winner: boolean;
  notes?: string;
  created_at: string;
}

interface Awardee {
  id: string;
  company_name: string;
  business_type: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
}

export default function AwardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [award, setAward] = useState<Award | null>(null);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [awardee, setAwardee] = useState<Awardee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAwardDetails();
    }
  }, [params.id]);

  const fetchAwardDetails = async () => {
    try {
      // Fetch contract details
      const contractResponse = await fetch(`/api/contracts/${params.id}`);
      if (contractResponse.ok) {
        const contractData = await contractResponse.json();
        setAward(contractData.contract);
      }

      // Fetch bidders
      const biddersResponse = await fetch(`/api/contracts/${params.id}/bidders`);
      if (biddersResponse.ok) {
        const biddersData = await biddersResponse.json();
        setBidders(biddersData.bidders || []);
      }

      // Fetch awardee details if available
      if (award?.awarded_company_id) {
        const awardeeResponse = await fetch(`/api/awardees/${award.awarded_company_id}`);
        if (awardeeResponse.ok) {
          const awardeeData = await awardeeResponse.json();
          setAwardee(awardeeData.awardee);
        }
      }

    } catch (error) {
      console.error('Error fetching award details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading award details...</p>
        </div>
      </div>
    );
  }

  if (!award) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Award not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The award you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/awards"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Awards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const winnerBidder = bidders.find(bidder => bidder.is_winner);
  const otherBidders = bidders.filter(bidder => !bidder.is_winner);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/awards"
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Awards
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Award className="h-4 w-4 mr-1" />
                {award.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Award Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {award.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    Reference: {award.reference_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(award.estimated_value || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Award Value</p>
                </div>
              </div>

              {award.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {award.description}
                  </p>
                </div>
              )}

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Award Date</p>
                      <p className="text-sm text-gray-600">{formatDate(award.award_date)}</p>
                    </div>
                  </div>
                  
                  {award.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{award.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">{formatDateTime(award.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">{formatDateTime(award.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Information */}
            {winnerBidder && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Winner</h2>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">
                        {winnerBidder.company_name}
                      </h3>
                      <p className="text-sm text-green-700">
                        Winning Bid: {formatCurrency(winnerBidder.bid_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Winner
                      </span>
                    </div>
                  </div>
                  
                  {winnerBidder.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Notes:</span> {winnerBidder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Bidders */}
            {otherBidders.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Other Bidders ({otherBidders.length})
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {otherBidders.map((bidder) => (
                    <div key={bidder.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {bidder.company_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Bid: {formatCurrency(bidder.bid_amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Runner-up
                          </span>
                        </div>
                      </div>
                      
                      {bidder.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {bidder.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Awardee Profile */}
            {awardee && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Awardee Profile</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Company Name</p>
                    <p className="text-sm text-gray-600">{awardee.company_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Business Type</p>
                    <p className="text-sm text-gray-600 capitalize">{awardee.business_type}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{awardee.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contact Email</p>
                    <p className="text-sm text-gray-600">{awardee.contact_email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contact Phone</p>
                    <p className="text-sm text-gray-600">{awardee.contact_phone}</p>
                  </div>
                  
                  {awardee.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notes</p>
                      <p className="text-sm text-gray-600">{awardee.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Bidders</span>
                  <span className="text-sm font-semibold text-gray-900">{bidders.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Competition Level</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {bidders.length > 5 ? 'High' : bidders.length > 2 ? 'Medium' : 'Low'}
                  </span>
                </div>
                
                {bidders.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price Range</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Math.min(...bidders.map(b => b.bid_amount)))} - {formatCurrency(Math.max(...bidders.map(b => b.bid_amount)))}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Award Value</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(award.estimated_value || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
