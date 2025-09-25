"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Building, Globe, ChevronDown, Share2, Heart, Bell, FileText, DollarSign, Target, Users, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface ProcuringEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  parent_entity_id?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Contract {
  id: string;
  reference_number: string;
  title: string;
  description?: string;
  category?: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  submission_deadline?: string;
  awarded_value?: number;
  awarded_date?: string;
  procuring_entity: string; // This is the text field
  procuring_entity_id?: string; // This is the foreign key
  awarded_company_id?: string;
  awarded_to?: string; // Company name that was awarded the contract
  status: string;
  created_at: string;
  awardees?: {
    company_name: string;
  };
  procuring_entities?: {
    entity_name: string;
  };
}

interface Awardee {
  id: string;
  company_name: string;
  registration_number?: string;
  company_type?: string;
  industries?: string[];
  locations?: string[];
  employee_count?: number;
  annual_revenue?: string;
  certifications?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  is_active: boolean;
}

export default function AgencyDetailPage({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = use(params);
  const [agency, setAgency] = useState<ProcuringEntity | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate quick stats with memoization for performance
  const stats = useMemo(() => {
    const totalContracts = contracts.length;
    const totalValue = contracts.reduce((sum, contract) => {
      const value = contract.awarded_value || contract.estimated_value_max || 0;
      return sum + value;
    }, 0);
    const activeOpportunities = contracts.filter(c => c.status === "active").length;
    const topAwardees = awardees.length;
    
    return { totalContracts, totalValue, activeOpportunities, topAwardees };
  }, [contracts, awardees]);

  const { totalContracts, totalValue, activeOpportunities, topAwardees } = stats;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log("🔍 Fetching data for entity:", entity);
        
        // PROPER DATA FLOW:
        // 1. First: Find/create agency in procuring_entities table
        // 2. Then: Fetch contracts linked via procuring_entity_id foreign key
        // 3. This ensures proper relational data structure
        
        // Convert slug back to readable entity name
        const entityName = entity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        console.log("🔍 Looking for entity name:", entityName);
        
        let agencyData = null;
        
        // First try to fetch from procuring_entities table with flexible search
        // Try multiple variations of the entity name
        const searchVariations = [
          entityName, // Original conversion
          entityName.replace(/\bAnd\b/g, '&'), // Try with & instead of And
          entityName.replace(/\bEnvironment\b/g, 'Environments'), // Try plural
          entity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\bAnd\b/g, '&'), // Direct with &
        ];
        
        let procuringEntityData = null;
        let procuringEntityError = null;
        
        // Try each variation until we find a match
        for (const variation of searchVariations) {
          console.log("🔍 Trying variation:", variation);
          const { data, error } = await supabase
            .from("procuring_entities")
            .select("*")
            .ilike("entity_name", `%${variation}%`)
            .single();
            
          if (data && !error) {
            procuringEntityData = data;
            procuringEntityError = null;
            console.log("✅ Found agency with variation:", variation);
            break;
          }
          procuringEntityError = error;
        }

        if (procuringEntityData && !procuringEntityError) {
          agencyData = procuringEntityData;
          console.log("🏢 Found agency in procuring_entities:", agencyData);
        } else {
          // If not found in procuring_entities, create a proper agency from contracts data
          console.log("🔍 Not found in procuring_entities, creating proper agency from contracts data");
          
          // Get contracts for this entity to create agency info
          // Try multiple variations for contract search too
          let contractsForEntity = null;
          let contractsError = null;
          
          for (const variation of searchVariations) {
            console.log("🔍 Searching contracts with variation:", variation);
            const { data, error } = await supabase
              .from("contracts")
              .select("*")
              .ilike("procuring_entity", `%${variation}%`)
              .limit(1);
              
            if (data && data.length > 0 && !error) {
              contractsForEntity = data;
              contractsError = null;
              console.log("✅ Found contracts with variation:", variation);
              break;
            }
            contractsError = error;
          }

          if (contractsForEntity && contractsForEntity.length > 0) {
            const firstContract = contractsForEntity[0];
            
            // Create a proper agency using the API
            try {
              const response = await fetch('/api/agencies/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                entity_name: firstContract.procuring_entity,
                contact_person: firstContract.contact_person || null,
                contact_email: firstContract.contact_person ? `${firstContract.contact_person.toLowerCase().replace(/\s+/g, '.')}@gov.ug` : null,
                website: null,
                address: null,
                description: `Procuring entity responsible for ${firstContract.procuring_entity}`
              })
              });

              if (response.ok) {
                const result = await response.json();
                agencyData = result.agency;
                console.log("🏢 Created new agency via API:", agencyData);
            } else {
                const errorData = await response.json();
                console.error("❌ API Error creating agency:", errorData);
                throw new Error(errorData.error || 'Failed to create agency');
              }
            } catch (apiError) {
              console.error("❌ Error creating agency via API:", apiError);
              console.error("❌ API Error details:", JSON.stringify(apiError, null, 2));
              // If API fails, we can't create a real agency, so we need to handle this gracefully
              console.log("⚠️ Cannot create agency, will use contract data only");
              agencyData = null; // Don't create mock data that will cause UUID errors
            }
          }
        }

        if (!agencyData) {
          console.error("❌ Could not find or create agency data");
          setLoading(false);
          return;
        }

        setAgency(agencyData);

        // Fetch contracts for this agency using both foreign key and text matching
        setContractsLoading(true);
        let contractsData = null;
        let contractsError = null;
        
        if (agencyData) {
          console.log("📋 Fetching contracts for agency ID:", agencyData.id, "and name:", agencyData.entity_name);
          
          // First, let's check what contracts exist for this entity (without status filter)
          const { data: allContracts, error: allContractsError } = await supabase
            .from("contracts")
            .select("id, status, procuring_entity, procuring_entity_id, awarded_value")
            .or(`procuring_entity_id.eq.${agencyData.id},procuring_entity.ilike.%${agencyData.entity_name}%`)
            .order("created_at", { ascending: false });
            
          console.log("🔍 All contracts for entity:", allContracts?.length || 0);
          console.log("🔍 Contract statuses:", allContracts?.map(c => c.status) || []);
          console.log("🔍 Contract details:", allContracts?.map(c => ({ id: c.id, status: c.status, procuring_entity: c.procuring_entity, awarded_value: c.awarded_value })) || []);
          
          // Now fetch only awarded contracts
          const { data, error } = await supabase
          .from("contracts")
          .select("*")
            .eq("status", "awarded")
            .or(`procuring_entity_id.eq.${agencyData.id},procuring_entity.ilike.%${agencyData.entity_name}%`)
          .order("created_at", { ascending: false });
            
          contractsData = data;
          contractsError = error;
          
          // If no awarded contracts found, try to get any contracts for this entity
          if (!contractsData || contractsData.length === 0) {
            console.log("🔄 No awarded contracts found, trying to get any contracts for this entity...");
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("contracts")
              .select("*")
              .or(`procuring_entity_id.eq.${agencyData.id},procuring_entity.ilike.%${agencyData.entity_name}%`)
              .order("created_at", { ascending: false });
              
            if (fallbackData && fallbackData.length > 0) {
              console.log("✅ Found fallback contracts:", fallbackData.length);
              contractsData = fallbackData;
              contractsError = fallbackError;
            }
          }
        } else {
          // If no agency data, try to fetch contracts by entity name only
          const entityName = entity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          console.log("📋 Fetching contracts by entity name only:", entityName);
          
          // First, let's check what contracts exist for this entity name (without status filter)
          const { data: allContractsByName, error: allContractsByNameError } = await supabase
            .from("contracts")
            .select("id, status, procuring_entity, awarded_value")
            .ilike("procuring_entity", `%${entityName}%`)
            .order("created_at", { ascending: false });
            
          console.log("🔍 All contracts by name:", allContractsByName?.length || 0);
          console.log("🔍 Contract statuses by name:", allContractsByName?.map(c => c.status) || []);
          
          const { data, error } = await supabase
            .from("contracts")
            .select("*")
            .eq("status", "awarded")
            .ilike("procuring_entity", `%${entityName}%`)
            .order("created_at", { ascending: false });
            
          contractsData = data;
          contractsError = error;
          
          // If no awarded contracts found, try to get any contracts for this entity name
          if (!contractsData || contractsData.length === 0) {
            console.log("🔄 No awarded contracts found by name, trying to get any contracts...");
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("contracts")
              .select("*")
              .ilike("procuring_entity", `%${entityName}%`)
              .order("created_at", { ascending: false });
              
            if (fallbackData && fallbackData.length > 0) {
              console.log("✅ Found fallback contracts by name:", fallbackData.length);
              contractsData = fallbackData;
              contractsError = fallbackError;
            }
          }
        }

        if (contractsError) {
          console.error("❌ Contracts error:", contractsError);
          console.error("❌ Contracts error details:", JSON.stringify(contractsError, null, 2));
        }
        
        setContracts(contractsData || []);
        setContractsLoading(false);
        console.log("✅ Final contracts count:", contractsData?.length || 0);
        console.log("✅ Final contracts data:", contractsData);

        // Fetch top awardees (limit to avoid performance issues)
        const { data: awardeesData, error: awardeesError } = await supabase
          .from("awardees")
          .select("*")
          .eq("is_active", true)
          .limit(10);

        if (awardeesError) {
          console.error("❌ Awardees error:", awardeesError);
        }
        setAwardees(awardeesData || []);

      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (entity) {
      fetchData();
    }
  }, [entity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Agency Information</h2>
            <p className="text-gray-800">Fetching data for {entity.replace(/-/g, ' ')}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Building className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Agency Not Found</h1>
            <p className="text-gray-800 mb-6">
              The procuring entity "{entity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}" could not be found or created.
            </p>
            <div className="text-sm text-gray-700 mb-6">
              <p>This could be because:</p>
              <ul className="text-left max-w-md mx-auto mt-2">
                <li>• The entity name doesn't match any existing records</li>
                <li>• There are no contracts associated with this entity</li>
                <li>• The entity name format is incorrect</li>
              </ul>
            </div>
            <Link
              href="/dashboard/agencies"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Procuring Entities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Compact currency formatter for table display (e.g., 35.0M UGX)
  const formatCurrencyCompact = (value?: number) => {
    if (!value || value === 0) return "UGX 0";
    if (value >= 1000000000) {
      return `UGX ${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `UGX ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `UGX ${(value / 1000).toFixed(1)}K`;
    }
    return `UGX ${value.toLocaleString()}`;
  };

  const formatDateLong = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link 
            href="/dashboard/agencies" 
            className="inline-flex items-center text-sm text-gray-800 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Agencies
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Agency Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{agency.entity_name}</h1>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {agency.entity_type}
                    </span>
                  </div>
                  <p className="text-gray-800 text-lg">
                    {agency.parent_entity_id ? `[${agency.parent_entity_id}]` : "[Government of Uganda]"} • Procurement Intelligence Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify
                <ChevronDown className="w-4 h-4 ml-1" />
                </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">Total Contracts</p>
                  <p className="text-lg font-semibold text-gray-900">{totalContracts.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">Active Opportunities</p>
                  <p className="text-lg font-semibold text-gray-900">{activeOpportunities.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">Top Awardees</p>
                  <p className="text-lg font-semibold text-gray-900">{topAwardees.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => scrollToSection("overview")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection("analysis")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "analysis"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => scrollToSection("contracts")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "contracts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Contracts
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                {contracts.length}
              </span>
            </button>
            <button
              onClick={() => scrollToSection("awardees")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "awardees"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Awardees
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                {awardees.length}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Section */}
        <section id="overview" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agency Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-800">Type</span>
                    <span className="font-medium">{agency.entity_type}</span>
                  </div>
                  {agency.parent_entity_id && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-800">Parent Agency</span>
                      <span className="font-medium">{agency.parent_entity_id}</span>
                    </div>
                  )}
                  {agency.website && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-800">Website</span>
                      <a 
                        href={agency.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {agency.website}
                      </a>
                    </div>
                  )}
                  {agency.contact_email && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-800">Contact Email</span>
                      <a 
                        href={`mailto:${agency.contact_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {agency.contact_email}
                      </a>
                    </div>
                  )}
                  {agency.contact_phone && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-800">Contact Phone</span>
                      <a 
                        href={`tel:${agency.contact_phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {agency.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-900 leading-relaxed">
                  {agency.description || "No description available for this procuring entity."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Section */}
        <section id="analysis" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contract Award Analysis</h2>
            <p className="text-gray-800 mt-1">Contract and grant spending analysis</p>
          </div>
          <div className="px-6 py-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ChartBarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Coming Soon</h3>
              <p className="text-gray-800">Interactive charts and visualizations will be available here.</p>
            </div>
          </div>
        </section>

        {/* Contract Opportunities Section */}
        <section id="opportunities" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contract Opportunities</h2>
            <p className="text-gray-800 mt-1">Active and upcoming procurement opportunities</p>
          </div>
          <div className="px-6 py-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.filter(c => c.status === 'active' || c.status === 'open').slice(0, 5).map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {contract.reference_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-900">{contract.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {contract.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {contract.estimated_value_min && contract.estimated_value_max 
                          ? `${formatCurrency(contract.estimated_value_min)} - ${formatCurrency(contract.estimated_value_max)}`
                          : 'Not specified'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {contract.submission_deadline 
                          ? new Date(contract.submission_deadline).toLocaleDateString()
                          : 'Not specified'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contract.status === "active" 
                            ? "bg-green-100 text-green-800"
                            : contract.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contracts.filter(c => c.status === 'active' || c.status === 'open').length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Target className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Opportunities</h3>
                  <p className="text-gray-800">There are currently no active procurement opportunities from this agency.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Awardee Rankings Section */}
        <section id="awardees" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Awardee Rankings</h2>
            <p className="text-gray-800 mt-1">Top awardees by contract value</p>
          </div>
          <div className="px-6 py-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Awardee</th>
                    <th>Contracts</th>
                    <th>Total Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {awardees.slice(0, 10).map((awardee, index) => (
                    <tr key={awardee.id}>
                      <td className="font-medium">#{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{awardee.company_name}</p>
                            {awardee.company_type && (
                              <p className="text-sm text-gray-700">{awardee.company_type}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {contracts.filter(c => c.awarded_company_id === awardee.id).length}
                      </td>
                      <td className="font-medium">
                        {formatCurrency(
                          contracts
                            .filter(c => c.awarded_company_id === awardee.id)
                            .reduce((sum, c) => sum + (c.awarded_value || 0), 0)
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/dashboard/awardees/${awardee.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contract Awards Section */}
        <section id="contracts" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contracts</h2>
            <p className="text-gray-800 mt-1">Recent contracts by this procuring entity</p>
          </div>
          <div className="px-6 py-6">
            {contractsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-800">Loading contracts...</span>
              </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awardee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Award Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procuring Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awarded Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-700">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts</h3>
                          <p className="text-gray-800">This procuring entity has no contracts yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contracts.slice(0, 10).map((contract) => (
                    <React.Fragment key={contract.id}>
                      <tr>
                        <td>
                          {contract.awarded_company_id ? (
                            <Link
                              href={`/dashboard/awardees/${contract.awarded_company_id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {contract.awarded_to || "View Awardee"}
                            </Link>
                          ) : contract.awarded_to ? (
                            <span className="text-gray-900 font-medium">{contract.awarded_to}</span>
                          ) : (
                            <span className="text-gray-700">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/dashboard/contracts/${contract.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {contract.reference_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatDateLong(contract.awarded_date || contract.created_at)}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <Link
                            href={`/dashboard/agencies/${contract.procuring_entity?.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <span className="truncate inline-block" title={contract.procuring_entity}>
                              {contract.procuring_entity}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {contract.awarded_value ? formatCurrencyCompact(contract.awarded_value) : 
                           contract.estimated_value_max ? formatCurrencyCompact(contract.estimated_value_max) : 
                           'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            contract.status === 'awarded' ? 'bg-green-100 text-green-800' :
                            contract.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            contract.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            contract.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contract.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-6 py-2 text-sm text-gray-800 bg-gray-50">
                          <strong>Contract:</strong> {contract.title}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Placeholder component for ChartBarIcon
function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
