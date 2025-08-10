"use client";

import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building,
  Eye,
  Bookmark,
  Target, 
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedValue, setSelectedValue] = useState("Any Value");

  // Fetch contracts from Supabase
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('posted_date', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        return;
      }

      setContracts(data || []);
      setFilteredContracts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter contracts based on search and filters
  useEffect(() => {
    let filtered = contracts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(contract => contract.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(contract => 
        contract.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Value filter
    if (selectedValue !== "Any Value") {
      filtered = filtered.filter(contract => {
        const value = contract.value;
        switch (selectedValue) {
          case "Under 50M UGX":
            return value < 50000000;
          case "50M - 100M UGX":
            return value >= 50000000 && value <= 100000000;
          case "100M - 500M UGX":
            return value > 100000000 && value <= 500000000;
          case "Over 500M UGX":
            return value > 500000000;
      default:
            return true;
        }
      });
    }

    setFilteredContracts(filtered);
  }, [contracts, searchTerm, selectedCategory, selectedLocation, selectedValue]);

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
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [
    "All Categories",
    "Information Technology",
    "Construction",
    "Agriculture",
    "Healthcare",
    "Energy"
  ];

  const locations = [
    "All Locations",
    "Kampala",
    "Jinja",
    "Gulu",
    "Mbarara",
    "Entebbe",
    "Multiple Locations"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
            Discover and track government and private sector contracts
        </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Bookmark className="w-4 h-4 mr-2" />
          Saved Contracts
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
              </div>
            <input
              type="text"
              placeholder="Search contracts by title, client, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
              </div>
            </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select 
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option>Any Value</option>
            <option>Under 50M UGX</option>
            <option>50M - 100M UGX</option>
            <option>100M - 500M UGX</option>
            <option>Over 500M UGX</option>
          </select>
              </div>
            </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {filteredContracts.length} of {contracts.length} contracts
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Sort by:</span>
          <select className="text-sm border-0 bg-transparent text-blue-600 focus:outline-none focus:ring-0">
            <option>Latest Posted</option>
            <option>Deadline</option>
            <option>Value</option>
          </select>
          </div>
      </div>

      {/* Contract Cards */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No contracts found</h3>
          <p className="text-slate-600">Try adjusting your search or filters</p>
            </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg shadow border border-slate-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {contract.title}
                    </h3>
                    <div className="flex items-center text-sm text-slate-600 mb-2">
                      <Building className="h-4 w-4 mr-1" />
                      {contract.client}
                      </div>
                    </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {contract.category}
                      </span>
                    </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4">
                  {contract.description}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {contract.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {formatValue(contract.value)}
                </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Deadline: {formatDate(contract.deadline)}
            </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Posted: {formatDate(contract.posted_date)}
          </div>
        </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/contracts/${contract.id}`}
                      className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save
                    </button>
          </div>
                  <Link
                    href={`/dashboard/track-bid/${contract.id}`}
                    className="flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Track Bid
                  </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Load More */}
      {filteredContracts.length > 0 && (
        <div className="text-center">
          <button className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            Load More Contracts
            <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
      )}
    </div>
  );
} 
