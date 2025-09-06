'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";


const notificationFrequencies = [
  { label: "Real-time", value: "real-time", description: "Get notified immediately" },
  { label: "Daily Digest", value: "daily", description: "Once per day summary" }
];

export default function OnboardingNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [frequency, setFrequency] = useState("real-time");
  const [loading, setLoading] = useState(false);


  const handleContinue = async () => {
    if (whatsappNotifications && !whatsappNumber.trim()) {
      alert("Please enter your WhatsApp number");
      return;
    }

    setLoading(true);
    
    try {
      // Log the notification preferences being saved
      console.log('Saving notification preferences:', {
        email_notifications: emailNotifications,
        whatsapp_notifications: whatsappNotifications,
        whatsapp_number: whatsappNumber,
        notification_frequency: frequency
      });

      // Save notification preferences to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: emailNotifications,
          whatsapp_notifications: whatsappNotifications,
          whatsapp_number: whatsappNotifications ? whatsappNumber : null,
          notification_frequency: frequency,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error saving notification preferences:', error);
        alert('Failed to save notification preferences. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Notification preferences saved successfully!');
      // Navigate to next step
      router.push('/onboarding/subscription');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to save notification preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/preferences');
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Uganda number (+256)
    if (digits.startsWith('256')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+256${digits.slice(1)}`;
    } else if (digits.length > 0) {
      return `+256${digits}`;
    }
    
    return digits;
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
                  <span className="text-sm text-slate-500">Welcome</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm text-slate-500">Preferences</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="text-sm font-medium text-slate-900">Notifications</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <span className="text-sm text-slate-500">Subscription</span>
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
              Stay Informed About Opportunities
            </h1>
            <p className="text-lg text-slate-600">
              Choose how you'd like to receive notifications about new contracts and updates
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {/* Notification Channels */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                How would you like to receive notifications?
              </h2>
              
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Email Notifications</h3>
                      <p className="text-sm text-slate-600">Receive updates at {user?.email}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* WhatsApp Notifications */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">WhatsApp Notifications</h3>
                      <p className="text-sm text-slate-600">Get instant messages on WhatsApp</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappNotifications}
                      onChange={(e) => setWhatsappNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* WhatsApp Number Input */}
              {whatsappNotifications && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    WhatsApp Number
                  </label>
                  <div className="flex items-center">
                    <span className="text-slate-500 mr-2">+256</span>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(formatWhatsAppNumber(e.target.value))}
                      placeholder="Enter your phone number"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Notification Frequency */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                How often would you like to receive notifications?
              </h2>
              
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notificationFrequencies.map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => setFrequency(freq.value)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      frequency === freq.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium">{freq.label}</div>
                    <div className="text-sm opacity-75">{freq.description}</div>
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