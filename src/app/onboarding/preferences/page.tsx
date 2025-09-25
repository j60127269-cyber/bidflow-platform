'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { onboardingService } from "@/lib/onboardingService";
import { CANONICAL_CATEGORIES } from "@/lib/categories";

const industries = CANONICAL_CATEGORIES;

const contractRanges = [
  { label: "Small (Under 1M UGX)", value: "small" },
  { label: "Medium (1M - 10M UGX)", value: "medium" },
  { label: "Large (10M - 100M UGX)", value: "large" },
  { label: "Enterprise (Over 100M UGX)", value: "enterprise" }
];



export default function OnboardingPreferences() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customProduct, setCustomProduct] = useState("");
  const [showCustomProduct, setShowCustomProduct] = useState(false);
  const [selectedContractRanges, setSelectedContractRanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleIndustryToggle = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleProductToggle = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) 
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  const addCustomProduct = () => {
    if (customProduct.trim() && !selectedProducts.includes(customProduct.trim())) {
      setSelectedProducts(prev => [...prev, customProduct.trim()]);
      setCustomProduct("");
      setShowCustomProduct(false);
    }
  };

  const removeProduct = (product: string) => {
    setSelectedProducts(prev => prev.filter(p => p !== product));
  };

  const handleContractRangeToggle = (range: string) => {
    setSelectedContractRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleContinue = async () => {
    if (selectedIndustries.length === 0) {
      alert("Please select at least one industry");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Please select at least one product/service");
      return;
    }
    if (selectedContractRanges.length === 0) {
      alert("Please select at least one contract value range");
      return;
    }

    setLoading(true);
    
    try {
      // Save preferences to Supabase
      console.log('Saving preferences for user:', user?.id);
      console.log('Selected industries:', selectedIndustries);
      console.log('Selected products:', selectedProducts);
      console.log('Selected contract ranges:', selectedContractRanges);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          email: user?.email,
          preferred_categories: selectedIndustries,
          business_type: selectedProducts.join(', '),
          min_contract_value: getContractValueRanges(selectedContractRanges).min,
          max_contract_value: getContractValueRanges(selectedContractRanges).max,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Preferences saved successfully!');
      // Navigate to next step
      router.push('/onboarding/notifications');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getContractValueRanges = (ranges: string[]) => {
    if (ranges.length === 0) {
      return { min: 0, max: 1000000 };
    }

    const rangeValues = ranges.map(range => {
    switch (range) {
      case 'small':
        return { min: 0, max: 1000000 };
      case 'medium':
        return { min: 1000000, max: 10000000 };
      case 'large':
        return { min: 10000000, max: 100000000 };
      case 'enterprise':
        return { min: 100000000, max: 999999999999 };
      default:
        return { min: 0, max: 1000000 };
    }
    });

    // Calculate overall min and max from all selected ranges
    const minValue = Math.min(...rangeValues.map(r => r.min));
    const maxValue = Math.max(...rangeValues.map(r => r.max));

    return { min: minValue, max: maxValue };
  };

  const handleBack = () => {
    router.push('/onboarding/welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm text-slate-700">Welcome</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm font-medium text-slate-900">Preferences</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="text-sm text-slate-700">Notifications</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-sm text-slate-700">Subscription</span>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Tell Us About Your Business
            </h1>
            <p className="text-lg text-slate-800">
              This helps us find the most relevant contracts for you
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {/* Industry Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                What industries are you interested in?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => handleIndustryToggle(industry)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedIndustries.includes(industry)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Products/Services Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                What products or services do you offer?
              </h2>
              
              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product}
                        className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {product}
                        <button
                          onClick={() => removeProduct(product)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Product */}
              {showCustomProduct ? (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={customProduct}
                    onChange={(e) => setCustomProduct(e.target.value)}
                    placeholder="Enter your product/service"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomProduct()}
                  />
                  <button
                    onClick={addCustomProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomProduct(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomProduct(true)}
                  className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Click here to Add your own product/service
                </button>
              )}

              {/* Suggested Products based on selected industries */}
              {selectedIndustries.length > 0 && (
                <div>
                  <p className="text-sm text-slate-800 mb-3">
                    Suggested products for your industries:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedIndustries.includes("Construction & Engineering") && (
                      <>
                        <button
                          onClick={() => handleProductToggle("Building Construction")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Building Construction")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Building Construction
                        </button>
                        <button
                          onClick={() => handleProductToggle("Road Construction")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Road Construction")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Road Construction
                        </button>
                        <button
                          onClick={() => handleProductToggle("Electrical Installation")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Electrical Installation")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Electrical Installation
                        </button>
                      </>
                    )}
                    {selectedIndustries.includes("Information Technology") && (
                      <>
                        <button
                          onClick={() => handleProductToggle("Software Development")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Software Development")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Software Development
                        </button>
                        <button
                          onClick={() => handleProductToggle("IT Consulting")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("IT Consulting")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          IT Consulting
                        </button>
                        <button
                          onClick={() => handleProductToggle("Network Infrastructure")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Network Infrastructure")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Network Infrastructure
                        </button>
                      </>
                    )}
                    {selectedIndustries.includes("Logistics & Transportation") && (
                      <>
                        <button
                          onClick={() => handleProductToggle("Freight Transport")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Freight Transport")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Freight Transport
                        </button>
                        <button
                          onClick={() => handleProductToggle("Warehousing")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Warehousing")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Warehousing
                        </button>
                        <button
                          onClick={() => handleProductToggle("Supply Chain Management")}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedProducts.includes("Supply Chain Management")
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Supply Chain Management
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contract Value Range */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                What contract value ranges are you targeting?
              </h2>
              
              {/* Selected Ranges */}
              {selectedContractRanges.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedContractRanges.map((range) => {
                      const rangeInfo = contractRanges.find(r => r.value === range);
                      return (
                        <div
                          key={range}
                          className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {rangeInfo?.label}
                          <button
                            onClick={() => handleContractRangeToggle(range)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contractRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleContractRangeToggle(range.value)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedContractRanges.includes(range.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
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
              className="flex items-center px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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