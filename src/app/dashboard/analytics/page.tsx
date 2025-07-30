import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Award,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function AnalyticsPage() {
  // Mock analytics data
  const overviewStats = [
    {
      name: "Total Bids",
      value: "156",
      change: "+12%",
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
      change: "+18%",
      changeType: "positive",
      icon: DollarSign,
    },
    {
      name: "Active Bids",
      value: "12",
      change: "-2",
      changeType: "negative",
      icon: Calendar,
    },
  ];

  const categoryPerformance = [
    { category: "Construction", bids: 45, wins: 32, value: "1.2M UGX" },
    { category: "Technology", bids: 28, wins: 18, value: "450K UGX" },
    { category: "Healthcare", bids: 22, wins: 15, value: "380K UGX" },
    { category: "Agriculture", bids: 35, wins: 24, value: "220K UGX" },
    { category: "Energy", bids: 18, wins: 12, value: "150K UGX" },
  ];

  const monthlyTrends = [
    { month: "Jan", bids: 12, wins: 8, value: "180K UGX" },
    { month: "Feb", bids: 15, wins: 10, value: "220K UGX" },
    { month: "Mar", bids: 18, wins: 12, value: "280K UGX" },
    { month: "Apr", bids: 14, wins: 9, value: "200K UGX" },
    { month: "May", bids: 20, wins: 14, value: "320K UGX" },
    { month: "Jun", bids: 16, wins: 11, value: "250K UGX" },
  ];

  const topClients = [
    { name: "Uganda National Roads Authority", contracts: 8, value: "850K UGX" },
    { name: "Ministry of ICT", contracts: 6, value: "420K UGX" },
    { name: "Mulago National Hospital", contracts: 5, value: "380K UGX" },
    { name: "Ministry of Agriculture", contracts: 4, value: "220K UGX" },
    { name: "National Water Corporation", contracts: 3, value: "180K UGX" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track your bidding performance and market insights
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Top Clients</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {topClients.map((client, index) => (
            <div key={client.name} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{client.name}</h4>
                    <p className="text-xs text-slate-500">{client.contracts} contracts</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{client.value}</div>
                  <div className="text-xs text-slate-500">Total value</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-xs text-slate-500">71% success rate in road and building projects</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Technology bids increasing</p>
                  <p className="text-xs text-slate-500">15% more IT contracts this quarter</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Healthcare sector opportunity</p>
                  <p className="text-xs text-slate-500">High demand for medical equipment suppliers</p>
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
                  <p className="text-xs text-slate-500">Your expertise in this area yields best results</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Expand healthcare portfolio</p>
                  <p className="text-xs text-slate-500">Growing market with less competition</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Improve bid preparation time</p>
                  <p className="text-xs text-slate-500">Earlier submissions show higher success rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Analytics Tools</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <BarChart3 className="h-5 w-5 mr-2" />
              Export Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <PieChart className="h-5 w-5 mr-2" />
              Detailed Analysis
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Activity className="h-5 w-5 mr-2" />
              Performance Tracking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 