"use client";

import { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("overview");

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
        
        // First try to fetch from procuring_entities table
        const { data: procuringEntityData, error: procuringEntityError } = await supabase
          .from("procuring_entities")
          .select("*")
          .ilike("entity_name", `%${entityName}%`)
          .single();

        if (procuringEntityData && !procuringEntityError) {
          agencyData = procuringEntityData;
          console.log("🏢 Found agency in procuring_entities:", agencyData);
        } else {
          // If not found in procuring_entities, create a proper agency from contracts data
          console.log("🔍 Not found in procuring_entities, creating proper agency from contracts data");
          
          // Get contracts for this entity to create agency info
          const { data: contractsForEntity, error: contractsError } = await supabase
            .from("contracts")
            .select("*")
            .ilike("procuring_entity", `%${entityName}%`)
            .limit(1);

          if (contractsForEntity && contractsForEntity.length > 0) {
            const firstContract = contractsForEntity[0];
            
            // Create a proper agency in the procuring_entities table
            const { data: newAgency, error: createError } = await supabase
              .from("procuring_entities")
              .insert({
                entity_name: firstContract.procuring_entity,
                entity_type: "Government Agency",
                contact_person: firstContract.contact_person || null,
                contact_email: firstContract.contact_person ? `${firstContract.contact_person.toLowerCase().replace(/\s+/g, '.')}@gov.ug` : null,
                website: null,
                address: null,
                description: `Procuring entity responsible for ${firstContract.procuring_entity}`
              })
              .select()
              .single();

            if (createError) {
              console.error("❌ Error creating agency:", createError);
              // Fallback to mock data if creation fails
              agencyData = {
                id: `mock-${entity}`,
                entity_name: firstContract.procuring_entity,
                entity_type: "Government Agency",
                contact_person: firstContract.contact_person || null,
                contact_email: firstContract.contact_person ? `${firstContract.contact_person.toLowerCase().replace(/\s+/g, '.')}@gov.ug` : null,
                website: null,
                address: null,
                description: `Procuring entity responsible for ${firstContract.procuring_entity}`,
                created_at: firstContract.created_at,
                updated_at: firstContract.updated_at
              };
            } else {
              agencyData = newAgency;
              console.log("🏢 Created new agency in database:", agencyData);
            }
          }
        }

        if (!agencyData) {
          console.error("❌ Could not find or create agency data");
          setLoading(false);
          return;
        }

        setAgency(agencyData);

        // Fetch contracts for this agency using proper foreign key relationship
        console.log("📋 Fetching contracts for agency ID:", agencyData.id);
        
        const { data: contractsData, error: contractsError } = await supabase
          .from("contracts")
          .select("*")
          .eq("procuring_entity_id", agencyData.id)
          .order("created_at", { ascending: false });

        if (contractsError) {
          console.error("❌ Contracts error:", contractsError);
        }
        
        setContracts(contractsData || []);
        console.log("✅ Final contracts count:", contractsData?.length || 0);

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
            <p className="text-gray-600">Fetching data for {entity.replace(/-/g, ' ')}...</p>
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
            <p className="text-gray-600 mb-6">
              The agency "{entity.replace(/-/g, ' ')}" could not be found in our database.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate quick stats
  const totalContracts = contracts.length;
  const totalValue = contracts.reduce((sum, contract) => sum + (contract.awarded_value || 0), 0);
  const activeOpportunities = contracts.filter(c => c.status === "active").length;
  const topAwardees = awardees.length;

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
    if (!value) return "N/A";
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K UGX`;
    }
    return `${value.toLocaleString()} UGX`;
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
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
                  <p className="text-gray-600 text-lg">
                    {agency.parent_entity_id ? `[${agency.parent_entity_id}]` : "[Government of Uganda]"} • Procurement Intelligence Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm group">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                  <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
                </button>
              </div>
              
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm group">
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
                </button>
              </div>
              
              <button className="btn btn-outline-primary btn-sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </button>
              
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm group">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify
                  <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Contracts</p>
                  <p className="text-lg font-semibold text-gray-900">{totalContracts.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Opportunities</p>
                  <p className="text-lg font-semibold text-gray-900">{activeOpportunities.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Awardees</p>
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
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection("analysis")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "analysis"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => scrollToSection("contracts")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "contracts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contracts
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {contracts.length}
              </span>
            </button>
            <button
              onClick={() => scrollToSection("awardees")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "awardees"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Awardees
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {awardees.length}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Section */}
        <section id="overview" className="card">
          <div className="card-header">
            <h2 className="card-title">Overview</h2>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agency Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{agency.entity_type}</span>
                  </div>
                  {agency.parent_entity_id && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Parent Agency</span>
                      <span className="font-medium">{agency.parent_entity_id}</span>
                    </div>
                  )}
                  {agency.website && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Website</span>
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
                      <span className="text-gray-600">Contact Email</span>
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
                      <span className="text-gray-600">Contact Phone</span>
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
                <p className="text-gray-700 leading-relaxed">
                  {agency.description || "No description available for this procuring entity."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Section */}
        <section id="analysis" className="card">
          <div className="card-header">
            <h2 className="card-title">Contract Award Analysis</h2>
            <p className="text-gray-600">Contract and grant spending analysis</p>
          </div>
          <div className="card-body">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ChartBarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Coming Soon</h3>
              <p className="text-gray-600">Interactive charts and visualizations will be available here.</p>
            </div>
          </div>
        </section>

        {/* Contract Opportunities Section */}
        <section id="opportunities" className="card">
          <div className="card-header">
            <h2 className="card-title">Contract Opportunities</h2>
            <p className="text-gray-600">Active and upcoming procurement opportunities</p>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Estimated Value</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.filter(c => c.status === 'active' || c.status === 'open').slice(0, 5).map((contract) => (
                    <tr key={contract.id}>
                      <td>
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {contract.reference_number}
                        </Link>
                      </td>
                      <td className="max-w-xs truncate">{contract.title}</td>
                      <td>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {contract.category || 'General'}
                        </span>
                      </td>
                      <td className="font-medium">
                        {contract.estimated_value_min && contract.estimated_value_max 
                          ? `${formatCurrency(contract.estimated_value_min)} - ${formatCurrency(contract.estimated_value_max)}`
                          : 'Not specified'
                        }
                      </td>
                      <td className="text-gray-600">
                        {contract.submission_deadline 
                          ? new Date(contract.submission_deadline).toLocaleDateString()
                          : 'Not specified'
                        }
                      </td>
                      <td>
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
                      <td>
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="btn btn-sm btn-outline-primary"
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
                  <p className="text-gray-600">There are currently no active procurement opportunities from this agency.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Awardee Rankings Section */}
        <section id="awardees" className="card">
          <div className="card-header">
            <h2 className="card-title">Awardee Rankings</h2>
            <p className="text-gray-600">Top awardees by contract value</p>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table w-full">
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
                              <p className="text-sm text-gray-500">{awardee.company_type}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-600">
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
        <section id="contracts" className="card">
          <div className="card-header">
            <h2 className="card-title">Contract Awards</h2>
            <p className="text-gray-600">Recent contract awards by this agency</p>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Awardee</th>
                    <th>Contract Reference</th>
                    <th>Award Date</th>
                    <th>Procuring Entity</th>
                    <th>Awarded Value</th>
                    <th>Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.slice(0, 10).map((contract) => (
                    <>
                      <tr key={contract.id}>
                        <td>
                          {contract.awarded_company_id ? (
                            <Link
                              href={`/dashboard/awardees/${contract.awarded_company_id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {contract.awardees?.company_name || "View Awardee"}
                            </Link>
                          ) : (
                            <span className="text-gray-500">Not specified</span>
                          )}
                        </td>
                        <td>
                          <Link
                            href={`/dashboard/contracts/${contract.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {contract.reference_number}
                          </Link>
                        </td>
                        <td className="text-gray-900">
                          {formatDateLong(contract.awarded_date || contract.created_at)}
                        </td>
                        <td className="max-w-xs">
                          <Link
                            href={`/dashboard/agencies/${contract.procuring_entity?.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <span className="truncate inline-block" title={contract.procuring_entity}>
                              {contract.procuring_entity}
                            </span>
                          </Link>
                        </td>
                        <td className="font-medium">
                          {formatCurrencyCompact(contract.awarded_value)}
                        </td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">N/A</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          <strong>Contract:</strong> {contract.title}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
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
