import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal
} from "lucide-react";

export default function ContractsPage() {
  // Mock contract data
  const contracts = [
    {
      id: 1,
      title: "Road Construction - Kampala Expressway Phase 2",
      client: "Uganda National Roads Authority",
      location: "Kampala, Uganda",
      value: "850,000,000 UGX",
      deadline: "2024-03-15",
      category: "Construction",
      description: "Construction of 15km expressway connecting Kampala to Entebbe International Airport",
      status: "open",
      postedDate: "2024-01-15",
      requirements: ["Valid construction license", "5+ years experience", "Financial capacity"],
    },
    {
      id: 2,
      title: "IT Infrastructure Upgrade for Government Offices",
      client: "Ministry of ICT and National Guidance",
      location: "Kampala, Uganda",
      value: "120,000,000 UGX",
      deadline: "2024-02-28",
      category: "Technology",
      description: "Upgrade of IT infrastructure across 50 government offices including hardware and software",
      status: "open",
      postedDate: "2024-01-10",
      requirements: ["Microsoft certified partner", "3+ years experience", "Local support team"],
    },
    {
      id: 3,
      title: "Agricultural Equipment Supply and Training",
      client: "Ministry of Agriculture, Animal Industry and Fisheries",
      location: "Jinja, Uganda",
      value: "45,000,000 UGX",
      deadline: "2024-02-20",
      category: "Agriculture",
      description: "Supply of modern farming equipment and training for 200 farmers",
      status: "open",
      postedDate: "2024-01-12",
      requirements: ["Agricultural equipment supplier", "Training capabilities", "After-sales support"],
    },
    {
      id: 4,
      title: "Medical Supplies and Equipment Procurement",
      client: "Mulago National Referral Hospital",
      location: "Kampala, Uganda",
      value: "75,000,000 UGX",
      deadline: "2024-03-01",
      category: "Healthcare",
      description: "Procurement of medical supplies and equipment for emergency department",
      status: "open",
      postedDate: "2024-01-08",
      requirements: ["WHO certified supplier", "Medical equipment license", "24/7 support"],
    },
    {
      id: 5,
      title: "Solar Energy Installation for Rural Schools",
      client: "Ministry of Education and Sports",
      location: "Gulu, Uganda",
      value: "35,000,000 UGX",
      deadline: "2024-02-25",
      category: "Energy",
      description: "Installation of solar power systems in 25 rural schools",
      status: "open",
      postedDate: "2024-01-14",
      requirements: ["Solar installation license", "Rural experience", "Maintenance plan"],
    },
    {
      id: 6,
      title: "Water Supply System Rehabilitation",
      client: "National Water and Sewerage Corporation",
      location: "Mbarara, Uganda",
      value: "95,000,000 UGX",
      deadline: "2024-03-10",
      category: "Infrastructure",
      description: "Rehabilitation of water supply system serving 50,000 people",
      status: "open",
      postedDate: "2024-01-16",
      requirements: ["Water engineering license", "10+ years experience", "Environmental compliance"],
    },
  ];

  const categories = [
    "All Categories",
    "Construction",
    "Technology",
    "Agriculture",
    "Healthcare",
    "Energy",
    "Infrastructure",
    "Education",
    "Transportation",
  ];

  const locations = [
    "All Locations",
    "Kampala",
    "Jinja",
    "Gulu",
    "Mbarara",
    "Entebbe",
    "Mbale",
    "Arua",
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Discover and track government and private sector contracts
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search contracts by title, client, or description..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Category filter */}
          <div>
            <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div>
            <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced filters */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Value Range
              </label>
              <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any Value</option>
                <option>Under 50M UGX</option>
                <option>50M - 100M UGX</option>
                <option>100M - 500M UGX</option>
                <option>Over 500M UGX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deadline
              </label>
              <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any Deadline</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Next Month</option>
                <option>Over 3 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Posted Date
              </label>
              <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any Date</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {contracts.length} contracts
        </p>
        <div className="flex items-center space-x-2">
          <button className="text-sm text-slate-600 hover:text-slate-900">
            <Filter className="h-4 w-4 mr-1" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Contract cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {contract.title}
                  </h3>
                  <div className="flex items-center text-sm text-slate-600 mb-3">
                    <Building className="h-4 w-4 mr-1" />
                    {contract.client}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {contract.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {contract.location}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {contract.value}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Deadline: {contract.deadline}
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {contract.category}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Key Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {contract.requirements.slice(0, 3).map((req, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-700"
                        >
                          {req}
                        </span>
                      ))}
                      {contract.requirements.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                          +{contract.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="text-center">
        <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
          Load More Contracts
        </button>
      </div>
    </div>
  );
} 