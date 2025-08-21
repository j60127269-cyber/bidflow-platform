import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Award,
  Calendar,
  Users
} from "lucide-react";

export default function AnalyticsPage() {
  // Sample analytics data
  const stats = [
    {
      name: "Total Bids",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Win Rate",
      value: "68%",
      change: "+5%",
      changeType: "positive",
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Total Value",
      value: "2.4M UGX",
      change: "+18%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Active Bids",
      value: "3",
      change: "-1",
      changeType: "negative",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const categoryPerformance = [
    { category: "Construction", bids: 5, wins: 3, value: "1.2M UGX" },
    { category: "Technology", bids: 3, wins: 2, value: "450K UGX" },
    { category: "Healthcare", bids: 2, wins: 1, value: "380K UGX" },
    { category: "Agriculture", bids: 2, wins: 1, value: "220K UGX" },
  ];

  const monthlyTrends = [
    { month: "Jan", bids: 2, wins: 1, value: "180K UGX" },
    { month: "Feb", bids: 3, wins: 2, value: "220K UGX" },
    { month: "Mar", bids: 4, wins: 3, value: "280K UGX" },
    { month: "Apr", bids: 3, wins: 2, value: "200K UGX" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track your bidding performance and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Performance by Category</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {categoryPerformance.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900">{category.category}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-500">{category.bids} bids</span>
                      <span className="text-xs text-slate-500">{category.wins} wins</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{category.value}</div>
                    <div className="text-xs text-slate-500">
                      {Math.round((category.wins / category.bids) * 100)}% win rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Monthly Trends</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900">{month.month}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-500">{month.bids} bids</span>
                      <span className="text-xs text-slate-500">{month.wins} wins</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{month.value}</div>
                    <div className="text-xs text-slate-500">
                      {Math.round((month.wins / month.bids) * 100)}% win rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Key Insights</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Construction sector shows highest win rate</p>
                  <p className="text-xs text-slate-500">60% success rate in construction projects</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Technology bids increasing</p>
                  <p className="text-xs text-slate-500">67% success rate in IT projects</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Healthcare sector opportunity</p>
                  <p className="text-xs text-slate-500">50% success rate, room for improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Focus on construction projects</p>
                  <p className="text-xs text-slate-500">Your expertise yields best results</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Improve healthcare bidding</p>
                  <p className="text-xs text-slate-500">Research requirements more thoroughly</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Submit bids earlier</p>
                  <p className="text-xs text-slate-500">Earlier submissions show higher success</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Start tracking your performance</h3>
        <p className="text-slate-600 mb-6">
          Track your first bid to see analytics and insights
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Target className="w-4 h-4 mr-2" />
            Track New Bid
          </Link>
          <button className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Users className="w-4 h-4 mr-2" />
            View Examples
          </button>
        </div>
      </div>
    </div>
  );
}
