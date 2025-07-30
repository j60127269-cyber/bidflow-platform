import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target, 
  Award,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  BarChart3
} from "lucide-react";

export default function DashboardPage() {
  // Mock data for demonstration
  const stats = [
    {
      name: "Active Bids",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: Target,
    },
    {
      name: "Win Rate",
      value: "68%",
      change: "+5%",
      changeType: "positive",
      icon: Award,
    },
    {
      name: "Total Value",
      value: "2.4M UGX",
      change: "+12%",
      changeType: "positive",
      icon: DollarSign,
    },
    {
      name: "Deadlines",
      value: "5",
      change: "-2",
      changeType: "negative",
      icon: Calendar,
    },
  ];

  const recentContracts = [
    {
      id: 1,
      title: "Road Construction - Kampala Expressway",
      client: "Uganda National Roads Authority",
      value: "850,000,000 UGX",
      deadline: "2024-02-15",
      status: "active",
      category: "Construction",
    },
    {
      id: 2,
      title: "IT Infrastructure Upgrade",
      client: "Ministry of ICT",
      value: "120,000,000 UGX",
      deadline: "2024-02-20",
      status: "submitted",
      category: "Technology",
    },
    {
      id: 3,
      title: "Agricultural Equipment Supply",
      client: "Ministry of Agriculture",
      value: "45,000,000 UGX",
      deadline: "2024-02-10",
      status: "won",
      category: "Agriculture",
    },
    {
      id: 4,
      title: "Medical Supplies Procurement",
      client: "Mulago National Hospital",
      value: "75,000,000 UGX",
      deadline: "2024-02-25",
      status: "lost",
      category: "Healthcare",
    },
  ];

  const notifications = [
    {
      id: 1,
      title: "New contract available",
      message: "Road construction project in Jinja district",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: 2,
      title: "Bid deadline approaching",
      message: "IT infrastructure project closes in 3 days",
      time: "4 hours ago",
      type: "warning",
    },
    {
      id: 3,
      title: "Bid won!",
      message: "Congratulations! You won the agricultural equipment contract",
      time: "1 day ago",
      type: "success",
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back! Here's what's happening with your bids today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`flex items-center text-sm ${
                stat.changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Recent Contracts</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {recentContracts.map((contract) => (
                <div key={contract.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">{contract.title}</h4>
                      <p className="text-sm text-slate-500">{contract.client}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm text-slate-600">{contract.value}</span>
                        <span className="text-sm text-slate-600">Deadline: {contract.deadline}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        <span className="ml-1 capitalize">{contract.status}</span>
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {contract.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-200">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all contracts →
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Recent Notifications</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === "success" ? "bg-green-400" :
                      notification.type === "warning" ? "bg-yellow-400" : "bg-blue-400"
                    }`}></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-slate-200">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all notifications →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Quick Actions</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Search className="h-5 w-5 mr-2" />
              Search Contracts
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Target className="h-5 w-5 mr-2" />
              Track New Bid
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 