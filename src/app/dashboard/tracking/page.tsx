import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  DollarSign,
  Building,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function TrackingPage() {
  // Sample bid data
  const bids = [
    {
      id: 1,
      title: "Solar Energy Installation",
      client: "Ministry of Education",
      value: "35,000,000 UGX",
      deadline: "2024-02-25",
      status: "active",
      progress: 75,
      priority: "high",
    },
    {
      id: 2,
      title: "Water Supply System",
      client: "National Water Corporation",
      value: "95,000,000 UGX",
      deadline: "2024-03-10",
      status: "submitted",
      progress: 100,
      priority: "medium",
    },
    {
      id: 3,
      title: "Agricultural Equipment",
      client: "Ministry of Agriculture",
      value: "45,000,000 UGX",
      status: "won",
      progress: 100,
      priority: "low",
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Track Bids</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor your bid progress and deadlines
          </p>
        </div>
        <Link
          href="/dashboard/contracts"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Track New Bid
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active Bids</p>
              <p className="text-2xl font-semibold text-slate-900">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Upcoming Deadlines</p>
              <p className="text-2xl font-semibold text-slate-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Won This Month</p>
              <p className="text-2xl font-semibold text-slate-900">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <p className="text-2xl font-semibold text-slate-900">175M UGX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bid List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Your Bids</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {bids.map((bid) => (
            <div key={bid.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{bid.title}</h4>
                  <div className="flex items-center text-sm text-slate-600 mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    {bid.client}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {bid.value}
                    </span>
                    {bid.deadline && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Deadline: {bid.deadline}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                    {bid.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(bid.priority)}`}>
                    {bid.priority} priority
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    <ArrowRight className="h-4 w-4 mr-1" />
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
                      <Clock className="h-4 w-4 mr-1" />
                      Action Required
                    </div>
                  )}
                  {bid.status === "won" && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Success!
                    </div>
                  )}
                  {bid.status === "lost" && (
                    <div className="flex items-center text-sm text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      Review Needed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {bids.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bids tracked yet</h3>
          <p className="text-slate-600 mb-6">
            Start tracking your bids to monitor progress and deadlines
          </p>
          <Link
            href="/dashboard/contracts"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Find Contracts to Track
          </Link>
        </div>
      )}
    </div>
  );
}
