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
  title: string;
  client: string;
  location: string;
  value: number;
  deadline: string;
  category: string;
  description: string;
  status: string;
  posted_date: string;
  requirements: string[];
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

      setContract(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K UGX`;
    }
    return `${value.toLocaleString()} UGX`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Contract Not Found</h3>
          <p className="text-slate-600 mb-4">{error || 'The requested contract could not be found.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Sample data for sections that aren't in the database yet
  const sampleData = {
    procurementRef: "POU/SUPLS/2025-2026/00013",
    bidType: "Open Bidding (Domestic/International per PPDA Act 2003)",
    contractDuration: "12 months",
    preQualification: "Required",
    bidFee: "100,000 UGX",
    bidBond: "17,000,000 UGX",
    performanceBond: "10% of contract value",
    currency: "Uganda Shillings (UGX)",
    advancePayment: "Possible (subject to BDS/SCC)",
    submissionMethod: "Electronic via e-GP portal",
    evaluationMethod: "Preliminary (eligibility/admin); Technical (conformity to specs); Financial (lowest evaluated price + margin of preference for Ugandan goods >30% local content)",
    documents: [
      { name: "Tender Document", type: "PDF", size: "2.5 MB" },
      { name: "Technical Specifications", type: "PDF", size: "1.8 MB" },
      { name: "Bill of Quantities", type: "Excel", size: "850 KB" },
      { name: "Drawings and Plans", type: "ZIP", size: "15.2 MB" },
      { name: "Environmental Impact Assessment", type: "PDF", size: "3.1 MB" }
    ],
    timeline: [
      { date: "2024-08-08", event: "Publish Bid Notice", status: "completed" },
      { date: "N/A", event: "Pre-Bid Meeting/Site Visit", status: "not-applicable" },
      { date: contract.deadline, event: "Bid Closing/Submission", status: "upcoming" },
      { date: "2024-08-29 11:05 AM to Dec 15 5:00 PM", event: "Bid Validity Period", status: "upcoming" },
      { date: "Within 20 working days", event: "Evaluation Process", status: "upcoming" },
      { date: "Within 5 working days", event: "Display Best Evaluated Bidder", status: "upcoming" },
      { date: "After 10 working days + AG approval", event: "Contract Signature", status: "upcoming" }
    ],
    contactInfo: {
      name: "Eng. Sarah Nalukenge",
      position: "Procurement Officer",
      email: "procurement@unra.go.ug",
      phone: "+256 414 287 000",
      address: "Plot 3-5 New Port Bell Road, Nakawa, Kampala"
    },
    historicalBids: [
      {
        id: "BID-001",
        title: "Road Construction - Jinja Highway",
        client: "Uganda National Roads Authority",
        location: "Jinja, Uganda",
        estimatedValue: "650,000,000 UGX",
        winningBid: "580,000,000 UGX",
        winningCompany: "Kampala Construction Ltd",
        bidDate: "2023-11-15",
        duration: "12 months",
        biddersCount: 8,
        priceRange: {
          lowest: "520,000,000 UGX",
          highest: "720,000,000 UGX",
          average: "620,000,000 UGX"
        }
      },
      {
        id: "BID-002",
        title: "IT Infrastructure Upgrade",
        client: "Ministry of ICT",
        location: "Kampala, Uganda",
        estimatedValue: "120,000,000 UGX",
        winningBid: "105,000,000 UGX",
        winningCompany: "Tech Solutions Uganda",
        bidDate: "2023-09-20",
        duration: "6 months",
        biddersCount: 12,
        priceRange: {
          lowest: "95,000,000 UGX",
          highest: "140,000,000 UGX",
          average: "115,000,000 UGX"
        }
      },
      {
        id: "BID-003",
        title: "Agricultural Equipment Supply",
        client: "Ministry of Agriculture",
        location: "Jinja, Uganda",
        estimatedValue: "45,000,000 UGX",
        winningBid: "42,500,000 UGX",
        winningCompany: "AgriTech Solutions",
        bidDate: "2023-07-15",
        duration: "3 months",
        biddersCount: 6,
        priceRange: {
          lowest: "40,000,000 UGX",
          highest: "48,000,000 UGX",
          average: "44,000,000 UGX"
        }
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "upcoming":
        return "text-blue-600 bg-blue-100";
      case "not-applicable":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "upcoming":
        return <Clock className="h-4 w-4" />;
      case "not-applicable":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // AI Prediction Data (sample)
  const aiPrediction = {
    winProbability: 75,
    profileMatch: 85,
    riskLevel: "Low",
    recommendations: [
      "Strong technical expertise in cybersecurity",
      "Good financial capacity for project size",
      "Need to strengthen local content component (>30%)",
      "Consider partnering with local IT firms"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
            <Bookmark className="h-4 w-4 mr-1" />
            Save
          </button>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      {/* Contract Header */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {contract.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {contract.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {contract.title}
            </h1>
            <p className="text-slate-600 mb-4">
              Procurement Reference: {sampleData.procurementRef}
            </p>
          </div>
          <Link
            href={`/dashboard/track-bid/${contract.id}`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Target className="w-4 h-4 mr-2" />
            Track This Bid
          </Link>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center text-sm text-slate-600">
            <Building className="h-4 w-4 mr-2" />
            <span className="font-medium">Client:</span>
            <span className="ml-1">{contract.client}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="font-medium">Location:</span>
            <span className="ml-1">{contract.location}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="font-medium">Value:</span>
            <span className="ml-1">{formatValue(contract.value)}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">Deadline:</span>
            <span className="ml-1">{formatDateTime(contract.deadline)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
            <p className="text-slate-600 leading-relaxed">
              {contract.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements</h2>
            <ul className="space-y-2">
              {contract.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bid Details */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Bid Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Bid Type:</span>
                <p className="text-slate-900">{sampleData.bidType}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Contract Duration:</span>
                <p className="text-slate-900">{sampleData.contractDuration}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Pre-Qualification:</span>
                <p className="text-slate-900">{sampleData.preQualification}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Bid Fee:</span>
                <p className="text-slate-900">{sampleData.bidFee}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Bid Bond:</span>
                <p className="text-slate-900">{sampleData.bidBond}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Performance Bond:</span>
                <p className="text-slate-900">{sampleData.performanceBond}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Currency:</span>
                <p className="text-slate-900">{sampleData.currency}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Advance Payment:</span>
                <p className="text-slate-900">{sampleData.advancePayment}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Submission Method:</span>
                <p className="text-slate-900">{sampleData.submissionMethod}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Evaluation Method:</span>
                <p className="text-slate-900">{sampleData.evaluationMethod}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {sampleData.timeline.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.event}</p>
                    <p className="text-sm text-slate-600">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Bid Prices */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Historical Bid Prices</h2>
            <div className="space-y-4">
              {sampleData.historicalBids.map((bid) => (
                <div key={bid.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{bid.title}</h3>
                    <span className="text-sm text-slate-600">{bid.bidDate}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Estimated:</span>
                      <p className="font-medium">{bid.estimatedValue}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Winning Bid:</span>
                      <p className="font-medium text-green-600">{bid.winningBid}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Winner:</span>
                      <p className="font-medium">{bid.winningCompany}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Bidders:</span>
                      <p className="font-medium">{bid.biddersCount}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-600">Lowest:</span>
                        <p className="font-medium">{bid.priceRange.lowest}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Average:</span>
                        <p className="font-medium">{bid.priceRange.average}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Highest:</span>
                        <p className="font-medium">{bid.priceRange.highest}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Prediction */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Prediction</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{aiPrediction.winProbability}%</div>
                <div className="text-sm text-slate-600">Win Probability</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profile Match</span>
                    <span>{aiPrediction.profileMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${aiPrediction.profileMatch}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Risk Level</span>
                    <span className={`font-medium ${
                      aiPrediction.riskLevel === 'Low' ? 'text-green-600' : 
                      aiPrediction.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{aiPrediction.riskLevel}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {aiPrediction.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Documents</h2>
            <div className="space-y-2">
              {sampleData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-slate-200 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-slate-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-600">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-500">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-slate-900">{sampleData.contactInfo.name}</p>
                <p className="text-sm text-slate-600">{sampleData.contactInfo.position}</p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center text-slate-600">
                  <span className="font-medium mr-2">Email:</span>
                  <a href={`mailto:${sampleData.contactInfo.email}`} className="text-blue-600 hover:underline">
                    {sampleData.contactInfo.email}
                  </a>
                </p>
                <p className="flex items-center text-slate-600">
                  <span className="font-medium mr-2">Phone:</span>
                  <a href={`tel:${sampleData.contactInfo.phone}`} className="text-blue-600 hover:underline">
                    {sampleData.contactInfo.phone}
                  </a>
                </p>
                <p className="flex items-start text-slate-600">
                  <span className="font-medium mr-2">Address:</span>
                  <span>{sampleData.contactInfo.address}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
