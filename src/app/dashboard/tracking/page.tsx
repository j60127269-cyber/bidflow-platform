import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Calendar,
  DollarSign,
  Building,
  Target,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function TrackingPage() {
  // Mock tracking data
  const trackedBids = [
    {
      id: 1,
      title: "Road Construction - Kampala Expressway Phase 2",
      client: "Uganda National Roads Authority",
      value: "850,000,000 UGX",
      deadline: "2024-03-15",
      status: "active",
      progress: 75,
      submittedDate: "2024-01-20",
      category: "Construction",
      priority: "high",
      notes: "Technical evaluation in progress. Waiting for site visit confirmation.",
    },
    {
      id: 2,
      title: "IT Infrastructure Upgrade for Government Offices",
      client: "Ministry of ICT and National Guidance",
      value: "120,000,000 UGX",
      deadline: "2024-02-28",
      status: "submitted",
      progress: 100,
      submittedDate: "2024-01-25",
      category: "Technology",
      priority: "medium",
      notes: "Bid submitted successfully. Awaiting evaluation results.",
    },
    {
      id: 3,
      title: "Agricultural Equipment Supply and Training",
      client: "Ministry of Agriculture, Animal Industry and Fisheries",
      value: "45,000,000 UGX",
      deadline: "2024-02-20",
      status: "won",
      progress: 100,
      submittedDate: "2024-01-15",
      category: "Agriculture",
      priority: "low",
      notes: "Contract awarded! Starting project planning phase.",
    },
    {
      id: 4,
      title: "Medical Supplies and Equipment Procurement",
      client: "Mulago National Referral Hospital",
      value: "75,000,000 UGX",
      deadline: "2024-03-01",
      status: "lost",
      progress: 100,
      submittedDate: "2024-01-18",
      category: "Healthcare",
      priority: "medium",
      notes: "Bid was competitive but lost to lower bidder. Review pricing strategy.",
    },
    {
      id: 5,
      title: "Solar Energy Installation for Rural Schools",
      client: "Ministry of Education and Sports",
      value: "35,000,000 UGX",
      deadline: "2024-02-25",
      status: "active",
      progress: 60,
      submittedDate: "2024-01-30",
      category: "Energy",
      priority: "high",
      notes: "Technical documents under review. Preparing for presentation.",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />;
      case "submitted":
        return <Eye className="h-4 w-4" />;
      case "won":
        return <CheckCircle className="h-4 w-4" />;
      case "lost":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Track Bids</h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor your bid progress and stay updated on deadlines
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active Bids</p>
              <p className="text-2xl font-semibold text-slate-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Upcoming Deadlines</p>
              <p className="text-2xl font-semibold text-slate-900">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Won This Month</p>
              <p className="text-2xl font-semibold text-slate-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <p className="text-2xl font-semibold text-slate-900">1.1M UGX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bid tracking list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Tracked Bids</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {trackedBids.map((bid) => (
            <div key={bid.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-slate-900">{bid.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {getStatusIcon(bid.status)}
                        <span className="ml-1 capitalize">{bid.status}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(bid.priority)}`}>
                        {bid.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600 mb-3">
                    <Building className="h-4 w-4 mr-1" />
                    {bid.client}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {bid.value}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Deadline: {bid.deadline}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Submitted: {bid.submittedDate}
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {bid.category}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm text-slate-600">{bid.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(bid.progress)}`}
                        style={{ width: `${bid.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700">{bid.notes}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
                    <Calendar className="h-4 w-4 mr-1" />
                    Update Status
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {bid.status === "active" && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Action Required
                    </div>
                  )}
                  {bid.status === "won" && (
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Success!
                    </div>
                  )}
                  {bid.status === "lost" && (
                    <div className="flex items-center text-sm text-red-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Review Needed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Target className="h-5 w-5 mr-2" />
              Track New Bid
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Calendar className="h-5 w-5 mr-2" />
              Set Reminders
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <TrendingUp className="h-5 w-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 