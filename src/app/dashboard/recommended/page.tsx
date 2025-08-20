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
  TrendingUp,
  User,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Contract } from "@/types/database";

interface UserProfile {
  id: string;
  company_name: string;
  business_type: string;
  experience_years: number;
  preferred_categories: string[];

  max_contract_value: number;
  min_contract_value: number;
  certifications: string[];
  team_size: number;
}

export default function RecommendedPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedValue, setSelectedValue] = useState("Any Value");

  // Fetch user profile and contracts
  useEffect(() => {
    fetchUserProfileAndContracts();
  }, []);

  const fetchUserProfileAndContracts = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('No profile found, using demo profile');
        // Use default profile for demo
        setUserProfile({
          id: user.id,
          company_name: "Demo Company",
          business_type: "Technology",
          experience_years: 5,
          preferred_categories: ["Information Technology", "Construction"],

          max_contract_value: 1000000000,
          min_contract_value: 50000000,
          certifications: ["ISO 9001", "CMMI Level 3"],
          team_size: 25
        });
      } else {
        setUserProfile(profileData);
      }

      // Fetch all contracts
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error('Error fetching contracts:', contractsError);
        return;
      }

      setContracts(contractsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and score contracts based on user profile
  useEffect(() => {
    if (!userProfile || !contracts.length) {
      setFilteredContracts(contracts);
      return;
    }

    let filtered = contracts.map(contract => {
      let score = 0;
             const reasons: string[] = [];

      // Category match (40% weight)
      if (userProfile.preferred_categories && userProfile.preferred_categories.includes(contract.category)) {
        score += 40;
        reasons.push(`Matches your preferred category: ${contract.category}`);
      }

      // Value range match (45% weight - increased since we removed location)
      const contractValue = contract.estimated_value_min || contract.estimated_value_max || 0;
      if (contractValue >= userProfile.min_contract_value && 
          contractValue <= userProfile.max_contract_value) {
        score += 20;
        reasons.push(`Contract value fits your range: ${formatValue(contractValue)}`);
      }

      // Experience level match (15% weight) - using required_documents and required_forms
      const allRequirements = [
        ...(contract.required_documents || []),
        ...(contract.required_forms || []),
        contract.evaluation_methodology || ''
      ].join(' ').toLowerCase();
      
      const experienceMatch = allRequirements.includes(`${userProfile.experience_years} years`) ||
                             allRequirements.includes('experience');
      if (experienceMatch) {
        score += 15;
        reasons.push(`Experience requirements match your profile`);
      }

      return {
        ...contract,
        recommendationScore: score,
        recommendationReasons: reasons
      };
    });

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.procuring_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.short_description || contract.evaluation_methodology || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(contract => contract.category === selectedCategory);
    }

    // Filter by location (using procuring_entity)
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(contract => 
        contract.procuring_entity.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by value
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

         // Sort by recommendation score (highest first)
     filtered.sort((a, b) => (b as { recommendationScore: number }).recommendationScore - (a as { recommendationScore: number }).recommendationScore);

    setFilteredContracts(filtered);
  }, [contracts, userProfile, searchTerm, selectedCategory, selectedLocation, selectedValue]);

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

  const getRecommendationColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getRecommendationText = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
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
          <p className="mt-4 text-slate-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recommended Bids</h1>
          <p className="mt-1 text-sm text-slate-600">
            Personalized recommendations based on your profile and preferences
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <button className="flex items-center justify-center px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm">
            <Settings className="w-4 h-4 mr-2" />
            Update Preferences
          </button>
          <button className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Bookmark className="w-4 h-4 mr-2" />
            Saved Contracts
          </button>
        </div>
      </div>

      {/* Profile Summary */}
      {userProfile && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Recommendations for {userProfile.company_name}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-slate-600">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {userProfile.business_type}
                </span>

                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {formatValue(userProfile.min_contract_value)} - {formatValue(userProfile.max_contract_value)}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right">
                             <div className="text-2xl font-bold text-blue-600">
                 {filteredContracts.filter(c => (c as { recommendationScore: number }).recommendationScore >= 60).length}
               </div>
              <div className="text-sm text-slate-600">Good Matches</div>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search recommended contracts..."
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <p className="text-sm text-slate-600">
          Showing {filteredContracts.length} recommended contracts
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Sort by:</span>
          <select className="text-sm border-0 bg-transparent text-blue-600 focus:outline-none focus:ring-0">
            <option>Recommendation Score</option>
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
            <Star className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No recommendations found</h3>
          <p className="text-slate-600">Try adjusting your search or update your preferences</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {filteredContracts.map((contract) => {
             const score = (contract as { recommendationScore: number }).recommendationScore || 0;
             const reasons = (contract as { recommendationReasons: string[] }).recommendationReasons || [];
            
            return (
                             <div key={contract.id} className="bg-white rounded-lg shadow border border-slate-200">

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {contract.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        {contract.procuring_entity}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {contract.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4">
                    {contract.short_description || contract.evaluation_methodology || 'No description available'}
                  </p>

                  

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                    <div className="flex items-center sm:justify-end">
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
                       <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-500 transition-colors">
                         <Bookmark className="h-4 w-4 mr-1" />
                         Save
                       </button>
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(score)}`}>
                         <Star className="w-3 h-3 mr-1" />
                         {getRecommendationText(score)} ({score}%)
                       </span>
                     </div>
                                       <Link
                    href={`/dashboard/contracts/${contract.id}`}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {filteredContracts.length > 0 && (
        <div className="text-center">
          <button className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            Load More Recommendations
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}
