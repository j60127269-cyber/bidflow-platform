'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const industries = [
  "Construction & Infrastructure",
  "Information Technology",
  "Healthcare & Medical",
  "Education & Training",
  "Agriculture & Farming",
  "Manufacturing",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Financial Services",
  "Real Estate",
  "Food & Beverage",
  "Textiles & Clothing",
  "Mining & Minerals",
  "Tourism & Hospitality",
  "Media & Communications"
];

const contractValueRanges = [
  { label: "Under 1M UGX", value: "under_1m" },
  { label: "1M - 5M UGX", value: "1m_5m" },
  { label: "5M - 10M UGX", value: "5m_10m" },
  { label: "10M - 50M UGX", value: "10m_50m" },
  { label: "50M - 100M UGX", value: "50m_100m" },
  { label: "Over 100M UGX", value: "over_100m" }
];

export default function OnboardingPreferences() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["Construction & Infrastructure"]);
  const [customProducts, setCustomProducts] = useState<string[]>(["Construction Materials"]);
  const [newProduct, setNewProduct] = useState("");
  const [contractValueRange, setContractValueRange] = useState("5m_10m");
  const [loading, setLoading] = useState(false);

  const handleIndustryToggle = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleAddProduct = () => {
    if (newProduct.trim() && !customProducts.includes(newProduct.trim())) {
      setCustomProducts(prev => [...prev, newProduct.trim()]);
      setNewProduct("");
    }
  };

  const handleRemoveProduct = (product: string) => {
    setCustomProducts(prev => prev.filter(p => p !== product));
  };

  const handleContinue = async () => {
    if (selectedIndustries.length === 0) {
      alert("Please select at least one industry");
      return;
    }

    setLoading(true);
    
    // Save preferences to Supabase (we'll implement this later)
    // For now, just navigate to next step
    router.push('/onboarding/notifications');
  };

  const handleBack = () => {
    router.push('/onboarding/welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm text-gray-500">Welcome</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-900">Preferences</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="text-sm text-gray-500">Notifications</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-sm text-gray-500">Subscription</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tell Us About Your Business
            </h1>
            <p className="text-lg text-gray-600">
              Help us personalize your experience by sharing your industry and preferences
            </p>
          </div>

          <div className="card p-8 mb-8">
            {/* Industries */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Which industries are you interested in?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => handleIndustryToggle(industry)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedIndustries.includes(industry)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{industry}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Products/Services */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                What products or services do you offer?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                    placeholder="Add a product or service"
                    className="input-modern flex-1"
                  />
                  <button
                    onClick={handleAddProduct}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {customProducts.map((product) => (
                    <div
                      key={product}
                      className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm">{product}</span>
                      <button
                        onClick={() => handleRemoveProduct(product)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contract Value Range */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                What contract value range are you targeting?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contractValueRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setContractValueRange(range.value)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      contractValueRange === range.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{range.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Saving..." : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 