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
  ArrowRight,
  Star,
  Lock,
  Crown
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/lib/subscriptionService";
import { useRouter } from "next/navigation";

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
  const { user } = useAuth();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedValue, setSelectedValue] = useState("Any Value");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Fetch contracts from Supabase
  useEffect(() => {
    fetchContracts();
  }, []);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          console.log('Dashboard - checking subscription for user:', user.id);
          const hasSubscription = await subscriptionService.hasActiveSubscription(user.id);
          console.log('Dashboard - hasActiveSubscription result:', hasSubscription);
          setHasActiveSubscription(hasSubscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
        } finally {
          setSubscriptionLoading(false);
        }
      } else {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      console.log('Fetching contracts...'); // Debug log
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(10); // Limit to 10 contracts for testing

      console.log('Contracts fetch result:', { data: data?.length, error }); // Debug log

      if (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
        setFilteredContracts([]);
        return;
      }

      setContracts(data || []);
      setFilteredContracts(data || []);
    } catch (error) {
      console.error('Error:', error);
      setContracts([]);
      setFilteredContracts([]);
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
    // Generate estimated range based on the contract value
    const generateEstimatedRange = (val: number) => {
      if (val >= 1000000000) { // 1B+
        const base = Math.floor(val / 1000000000);
        const range = Math.max(1, Math.floor(base * 0.3)); // 30% range
        return `Estimated ${base-range}B-${base+range}B UGX`;
      } else if (val >= 1000000) { // 1M+
        const base = Math.floor(val / 1000000);
        const range = Math.max(1, Math.floor(base * 0.4)); // 40% range
        return `Estimated ${base-range}M-${base+range}M UGX`;
      } else if (val >= 100000) { // 100K+
        const base = Math.floor(val / 100000);
        const range = Math.max(1, Math.floor(base * 0.5)); // 50% range
        return `Estimated ${base-range}00K-${base+range}00K UGX`;
      } else if (val >= 10000) { // 10K+
        const base = Math.floor(val / 10000);
        const range = Math.max(1, Math.floor(base * 0.6)); // 60% range
        return `Estimated ${base-range}0K-${base+range}0K UGX`;
      } else {
        const base = Math.floor(val / 1000);
        const range = Math.max(1, Math.floor(base * 0.7)); // 70% range
        return `Estimated ${base-range}K-${base+range}K UGX`;
      }
    };

    return generateEstimatedRange(value);
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

  const handleUpgrade = () => {
    router.push('/dashboard/subscription');
  };

  const debugSubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/debug-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const result = await response.json();
      console.log('🔍 DEBUG SUBSCRIPTION STATE:', result);
      console.log('🔍 PROFILE DATA:', result.profile);
      console.log('🔍 PROFILE ERROR:', result.profile.error);
      console.log('🔍 SUBSCRIPTIONS DATA:', result.subscriptions);
      console.log('🔍 PAYMENTS DATA:', result.payments);
      
      // Also check what our service functions return
      const hasSub = await subscriptionService.hasActiveSubscription(user.id);
      const status = await subscriptionService.getUserSubscriptionStatus(user.id);
      const activeSub = await subscriptionService.getUserActiveSubscription(user.id);
      console.log('🔍 SERVICE FUNCTIONS:', { hasSub, status, activeSub });
      
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  // Get contracts to display based on subscription status
  const getDisplayContracts = () => {
    if (hasActiveSubscription) {
      return filteredContracts; // Show all contracts for paid users
    } else {
      return filteredContracts.slice(0, 1); // Show only first contract for unpaid users
    }
  };

  // Get total contracts count for display
  const getTotalContractsCount = () => {
    if (hasActiveSubscription) {
      return filteredContracts.length;
    } else {
      return filteredContracts.length; // Show total count to create FOMO
    }
  };

  if (loading || subscriptionLoading) {
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
      {/* Simple loading indicator */}
      <div className="text-sm text-slate-600">
        Loading state: {loading ? 'Loading contracts' : 'Contracts loaded'} | 
        Subscription loading: {subscriptionLoading ? 'Loading subscription' : 'Subscription loaded'} |
        User: {user ? 'Logged in' : 'Not logged in'}
      </div>
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Discover and track government and private sector contracts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-slate-600">
              Status: {hasActiveSubscription ? '🟢 Active' : '🔴 None'} | 
              Contracts: {getDisplayContracts().length}/{getTotalContractsCount()}
            </div>
            <button 
              onClick={debugSubscription}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              🔍 Debug
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Contracts
            </button>
          </div>
        </div>

      {/* Search and Filters */}
      {/* Premium Features Banner for Unpaid Users */}
      {!hasActiveSubscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Unlock Premium Features</h3>
                <p className="text-xs text-slate-600">Access unlimited contracts, advanced analytics, and more</p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

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
          Showing {getDisplayContracts().length} of {getTotalContractsCount()} contracts
          {!hasActiveSubscription && filteredContracts.length > 1 && (
            <span className="text-blue-600 font-medium ml-2">
              • Upgrade to see all {filteredContracts.length} contracts
            </span>
          )}
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
                      {getDisplayContracts().map((contract, index) => (
              <div key={contract.id} className="bg-white rounded-lg shadow border border-slate-200 relative">
                {/* Sample Badge for Unpaid Users */}
                {!hasActiveSubscription && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Star className="w-3 h-3 mr-1" />
                      Sample
                    </span>
                  </div>
                )}
                
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
                    <Calendar className="h-4 w-4 mr-2" />
                    Deadline: {formatDate(contract.deadline)}
                </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Posted: {formatDate(contract.posted_date)}
            </div>
                  <div className="flex items-center justify-end">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatValue(contract.value)}
                    </span>
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

            {/* Blurred Contract Cards for Unpaid Users */}
            {!hasActiveSubscription && filteredContracts.length > 1 && (
              <>
                {/* First Blurred Card */}
                <div className="bg-white rounded-lg shadow border border-slate-200 relative overflow-hidden">
                  <div className="p-6 blur-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {filteredContracts[1]?.title || "Contract Title"}
                        </h3>
                        <div className="flex items-center text-sm text-slate-600 mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          {filteredContracts[1]?.client || "Client Name"}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filteredContracts[1]?.category || "Category"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4">
                      {filteredContracts[1]?.description || "Contract description..."}
                    </p>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {filteredContracts[1]?.location || "Location"}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Deadline: {filteredContracts[1]?.deadline ? formatDate(filteredContracts[1].deadline) : "Date"}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Posted: {filteredContracts[1]?.posted_date ? formatDate(filteredContracts[1].posted_date) : "Date"}
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {filteredContracts[1]?.value ? formatValue(filteredContracts[1].value) : "Value"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Upgrade Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium Contract</h3>
                      <p className="text-slate-600 mb-4">Upgrade to access this and {filteredContracts.length - 2} more contracts</p>
                      <button
                        onClick={handleUpgrade}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Second Blurred Card */}
                {filteredContracts.length > 2 && (
                  <div className="bg-white rounded-lg shadow border border-slate-200 relative overflow-hidden">
                    <div className="p-6 blur-sm">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {filteredContracts[2]?.title || "Contract Title"}
                          </h3>
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            {filteredContracts[2]?.client || "Client Name"}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {filteredContracts[2]?.category || "Category"}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4">
                        {filteredContracts[2]?.description || "Contract description..."}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {filteredContracts[2]?.location || "Location"}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Deadline: {filteredContracts[2]?.deadline ? formatDate(filteredContracts[2].deadline) : "Date"}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Posted: {filteredContracts[2]?.posted_date ? formatDate(filteredContracts[2].posted_date) : "Date"}
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {filteredContracts[2]?.value ? formatValue(filteredContracts[2].value) : "Value"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upgrade Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Crown className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium Contract</h3>
                        <p className="text-slate-600 mb-4">Unlock unlimited access to all contracts</p>
                        <button
                          onClick={handleUpgrade}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* More Contracts Message */}
                {filteredContracts.length > 3 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {filteredContracts.length - 3} More Contracts Available
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Upgrade to Professional Plan to access all {filteredContracts.length} contracts and unlock premium features
                    </p>
                    <button
                      onClick={handleUpgrade}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
      )}

      {/* Load More / Upgrade Prompt */}
      {filteredContracts.length > 0 && (
        <div className="text-center">
          {hasActiveSubscription ? (
            <button className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              Load More Contracts
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center text-blue-600">
                  <Lock className="w-5 h-5 mr-2" />
                  <span className="font-medium">Unlock All Contracts</span>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
