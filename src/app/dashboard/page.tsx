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
  Lock,
  Crown
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/lib/subscriptionService";
import { useRouter } from "next/navigation";
import { Contract } from "@/types/database";
import { TrackingPreferencesService } from "@/lib/trackingPreferences";
import TruncatedText from "@/components/TruncatedText";

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
  const [trackedContracts, setTrackedContracts] = useState<Set<string>>(new Set());
  const [trackingLoading, setTrackingLoading] = useState<{ [key: string]: boolean }>({});

  // Fetch contracts from Supabase
  useEffect(() => {
    fetchContracts();
  }, []);

  // Check subscription status and fetch tracked contracts
  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          const hasSubscription = await subscriptionService.hasActiveSubscription(user.id);
          setHasActiveSubscription(hasSubscription);
          
          // Fetch tracked contracts
          const { data: trackingData } = await supabase
            .from('bid_tracking')
            .select('contract_id')
            .eq('user_id', user.id)
            .eq('tracking_active', true);

          if (trackingData) {
            const trackedIds = new Set(trackingData.map(item => item.contract_id));
            setTrackedContracts(trackedIds);
          }
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
      
      // Get current date for filtering
      const currentDate = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('publish_status', 'published') // Only show published contracts to clients
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
        setFilteredContracts([]);
        return;
      }

      // Filter out historical/awarded contracts that shouldn't appear as active opportunities
      const activeContracts = (data || []).filter(contract => {
        // If it's historical data (has data_source), only show if it's recent and still relevant
        if (contract.data_source === 'government_csv' || contract.data_source === 'historical') {
          // For historical data, only show if submission deadline is in the future
          if (contract.submission_deadline && contract.submission_deadline < currentDate) {
            return false; // Hide past historical contracts
          }
        }
        
        // Hide contracts that are already awarded or completed
        if (contract.status === 'awarded' || contract.status === 'completed') {
          return false;
        }
        
        // Hide contracts where submission deadline has passed
        if (contract.submission_deadline && contract.submission_deadline < currentDate) {
          return false;
        }
        
        return true;
      });

      setContracts(activeContracts);
      setFilteredContracts(activeContracts);
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
        contract.procuring_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(contract => contract.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(contract => 
        contract.procuring_entity.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Value filter
    if (selectedValue !== "Any Value") {
      filtered = filtered.filter(contract => {
        const value = contract.estimated_value_min || contract.estimated_value_max || 0;
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
    if (value >= 1000000000) { // 1B+
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) { // 1M+
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 100000) { // 100K+
      return `${(value / 100000).toFixed(1)}00K UGX`;
    } else if (value >= 10000) { // 10K+
      return `${(value / 10000).toFixed(1)}0K UGX`;
    } else {
      return `${(value / 1000).toFixed(1)}K UGX`;
    }
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

  // Handle track/untrack contract
  const handleTrackContract = async (contractId: string) => {
    try {
      if (!user) {
        console.error('No user found');
        return;
      }

      setTrackingLoading(prev => ({ ...prev, [contractId]: true }));

      if (trackedContracts.has(contractId)) {
        // Stop tracking
        const { error } = await supabase
          .from('bid_tracking')
          .update({ tracking_active: false })
          .eq('user_id', user.id)
          .eq('contract_id', contractId);

        if (error) {
          console.error('Error stopping tracking:', error);
          return;
        }

        setTrackedContracts(prev => {
          const newSet = new Set(prev);
          newSet.delete(contractId);
          return newSet;
        });
      } else {
        // Start tracking using one-click logic
        const hasPreferences = await TrackingPreferencesService.hasExistingPreferences(user.id);
        
        if (hasPreferences) {
          const success = await TrackingPreferencesService.trackContractWithDefaults(user.id, contractId);
          if (success) {
            setTrackedContracts(prev => new Set([...prev, contractId]));
          } else {
            console.error('Failed to track contract');
          }
        } else {
          // First time tracking - redirect to contract detail page where modal will show
          window.location.href = `/dashboard/contracts/${contractId}`;
          return;
        }
      }
    } catch (error) {
      console.error('Error tracking contract:', error);
    } finally {
      setTrackingLoading(prev => ({ ...prev, [contractId]: false }));
    }
  };



  // Get contracts to display based on subscription status
  const getDisplayContracts = () => {
    if (hasActiveSubscription) {
      return filteredContracts; // Show all contracts for paid users
    } else {
      return filteredContracts.slice(0, 3); // Show first 3 contracts for free users
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

      
      {/* Page Header */}
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
              Discover and track government and private sector contracts
        </p>
      </div>

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

                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {contract.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        {contract.procuring_entity}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {contract.category}
                      </span>
                      {trackedContracts.has(contract.id) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Target className="h-3 w-3 mr-1" />
                          Tracked
                        </span>
                      )}
                    </div>
                  </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4">
                  {contract.short_description || contract.evaluation_methodology || 'No description available'}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {contract.procuring_entity}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Deadline: {formatDate(contract.submission_deadline)}
                </div>
                                    <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Posted: {formatDate(contract.publish_date || contract.created_at)}
                  </div>
                                    <div className="flex items-center justify-end">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {contract.estimated_value_min && contract.estimated_value_max 
                        ? `Estimated ${formatValue(contract.estimated_value_min)}-${formatValue(contract.estimated_value_max)}`
                        : contract.estimated_value_min 
                          ? `Estimated ${formatValue(contract.estimated_value_min)}`
                          : contract.estimated_value_max 
                            ? `Estimated ${formatValue(contract.estimated_value_max)}`
                            : 'Value not specified'
                      }
                    </span>
                  </div>
        </div>

                                 {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 space-y-3 sm:space-y-0">
                                       <div className="flex flex-wrap items-center gap-2">
                     <Link
                       href={`/dashboard/contracts/${contract.id}`}
                       className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                     >
                       <Eye className="h-4 w-4 mr-1" />
                       View Details
                     </Link>
                   </div>
                  <button
                    onClick={() => handleTrackContract(contract.id)}
                    disabled={trackingLoading[contract.id]}
                     className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto ${
                      trackedContracts.has(contract.id)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {trackingLoading[contract.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        {trackedContracts.has(contract.id) ? 'Untracking...' : 'Tracking...'}
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-1" />
                        {trackedContracts.has(contract.id) ? 'Untrack' : 'Track'}
                      </>
                    )}
                  </button>
              </div>
            </div>
          </div>
        ))}

            {/* Blurred Contract Cards for Unpaid Users */}
            {!hasActiveSubscription && filteredContracts.length > 3 && (
              <>
                {/* First Blurred Card */}
                <div className="bg-white rounded-lg shadow border border-slate-200 relative overflow-hidden">
                  <div className="p-6 blur-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {filteredContracts[3]?.title || "Contract Title"}
                        </h3>
                                                  <div className="flex items-center text-sm text-slate-600 mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            {filteredContracts[3]?.procuring_entity || "Procuring Entity"}
                          </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filteredContracts[3]?.category || "Category"}
                      </span>
      </div>

                                          {/* Description */}
                      <p className="text-sm text-slate-600 mb-4">
                        {filteredContracts[3]?.short_description || filteredContracts[3]?.evaluation_methodology || "Contract description..."}
                      </p>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                                              <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {filteredContracts[3]?.procuring_entity || "Location"}
            </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Deadline: {filteredContracts[3]?.submission_deadline ? formatDate(filteredContracts[3].submission_deadline) : "Date"}
                      </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Posted: {filteredContracts[3]?.publish_date || filteredContracts[3]?.created_at ? formatDate(filteredContracts[3].publish_date || filteredContracts[3].created_at) : "Date"}
                    </div>
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {filteredContracts[3]?.estimated_value_min && filteredContracts[3]?.estimated_value_max 
                              ? `Estimated ${formatValue(filteredContracts[3].estimated_value_min)}-${formatValue(filteredContracts[3].estimated_value_max)}`
                              : filteredContracts[3]?.estimated_value_min 
                                ? `Estimated ${formatValue(filteredContracts[3].estimated_value_min)}`
                                : filteredContracts[3]?.estimated_value_max 
                                  ? `Estimated ${formatValue(filteredContracts[3].estimated_value_max)}`
                                  : "Value not specified"
                            }
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
                      <p className="text-slate-600 mb-4">Upgrade to access this and {filteredContracts.length - 4} more contracts</p>
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
                {filteredContracts.length > 4 && (
                  <div className="bg-white rounded-lg shadow border border-slate-200 relative overflow-hidden">
                    <div className="p-6 blur-sm">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {filteredContracts[4]?.title || "Contract Title"}
                          </h3>
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            {filteredContracts[4]?.procuring_entity || "Procuring Entity"}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {filteredContracts[4]?.category || "Category"}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4">
                        {filteredContracts[4]?.short_description || filteredContracts[4]?.evaluation_methodology || "Contract description..."}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {filteredContracts[4]?.procuring_entity || "Location"}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Deadline: {filteredContracts[4]?.submission_deadline ? formatDate(filteredContracts[4].submission_deadline) : "Date"}
          </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Posted: {filteredContracts[4]?.publish_date || filteredContracts[4]?.created_at ? formatDate(filteredContracts[4].publish_date || filteredContracts[4].created_at) : "Date"}
                  </div>
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {filteredContracts[4]?.estimated_value_min && filteredContracts[4]?.estimated_value_max 
                              ? `Estimated ${formatValue(filteredContracts[4].estimated_value_min)}-${formatValue(filteredContracts[4].estimated_value_max)}`
                              : filteredContracts[4]?.estimated_value_min 
                                ? `Estimated ${formatValue(filteredContracts[4].estimated_value_min)}`
                                : filteredContracts[4]?.estimated_value_max 
                                  ? `Estimated ${formatValue(filteredContracts[4].estimated_value_max)}`
                                  : "Value not specified"
                            }
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
                {filteredContracts.length > 5 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-blue-600" />
        </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {filteredContracts.length - 5} More Contracts Available
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
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
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
