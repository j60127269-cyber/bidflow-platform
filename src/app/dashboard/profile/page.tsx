"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { subscriptionService } from '@/lib/subscriptionService';
import { Profile } from '@/types/database';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Settings, 
  CreditCard,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    experience_years: '',
    preferred_categories: [] as string[],
    preferred_locations: [] as string[],
    min_contract_value: '',
    max_contract_value: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSubscriptionStatus();
    }
  }, [user]);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        // Check if user has a profile with onboarding data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('preferred_categories, business_type, min_contract_value')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No profile exists - redirect to onboarding
          console.log('No profile found, redirecting to onboarding');
          window.location.href = '/onboarding/welcome';
          return;
        }

        if (profile && (!profile.preferred_categories || !profile.business_type || !profile.min_contract_value)) {
          // Profile exists but onboarding is incomplete - redirect to onboarding
          console.log('Onboarding incomplete, redirecting to onboarding');
          window.location.href = '/onboarding/welcome';
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // First, let's check if the profiles table exists and has data
      console.log('Fetching profile for user:', user?.id);
      
      // Check if user's email is verified
      if (!user?.email_confirmed_at) {
        console.log('User email not verified, redirecting to login');
        setMessage({ type: 'error', text: 'Please verify your email before accessing your profile.' });
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one with basic user data
        if (error.code === 'PGRST116') { // No rows returned
          console.log('Profile not found, creating new profile...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user?.id,
              email: user?.email,
              company_name: user?.user_metadata?.company || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Show a more user-friendly error
            setMessage({ type: 'error', text: 'Unable to create profile. Please try refreshing the page.' });
            return;
          }

          console.log('New profile created:', newProfile);
          setProfile(newProfile);
          setFormData({
            company_name: newProfile.company_name || '',
            business_type: newProfile.business_type || '',
            experience_years: newProfile.experience_years?.toString() || '',
            preferred_categories: newProfile.preferred_categories || [],
            preferred_locations: newProfile.preferred_locations || [],
            min_contract_value: newProfile.min_contract_value?.toString() || '',
            max_contract_value: newProfile.max_contract_value?.toString() || ''
          });
        } else {
          console.error('Error fetching profile:', error);
          setMessage({ type: 'error', text: 'Unable to load profile. Please try refreshing the page.' });
          return;
        }
      } else {
        // Profile exists, set the data
        console.log('Profile found:', data);
        setProfile(data);
        setFormData({
          company_name: data.company_name || '',
          business_type: data.business_type || '',
          experience_years: data.experience_years?.toString() || '',
          preferred_categories: data.preferred_categories || [],
          preferred_locations: data.preferred_locations || [],
          min_contract_value: data.min_contract_value?.toString() || '',
          max_contract_value: data.max_contract_value?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try refreshing the page.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await subscriptionService.getUserSubscriptionStatus(user?.id || '');
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name,
          business_type: formData.business_type,
          experience_years: parseInt(formData.experience_years) || 0,
          preferred_categories: formData.preferred_categories,
          preferred_locations: formData.preferred_locations,
          min_contract_value: parseInt(formData.min_contract_value) || 0,
          max_contract_value: parseInt(formData.max_contract_value) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? {
        ...prev,
        company_name: formData.company_name,
        business_type: formData.business_type,
        experience_years: parseInt(formData.experience_years) || 0,
        preferred_categories: formData.preferred_categories,
        preferred_locations: formData.preferred_locations,
        min_contract_value: parseInt(formData.min_contract_value) || 0,
        max_contract_value: parseInt(formData.max_contract_value) || 0,

        updated_at: new Date().toISOString()
      } : null);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        business_type: profile.business_type || '',
        experience_years: profile.experience_years?.toString() || '',
        preferred_categories: profile.preferred_categories || [],
        preferred_locations: profile.preferred_locations || [],
        min_contract_value: profile.min_contract_value?.toString() || '',
        max_contract_value: profile.max_contract_value?.toString() || ''
      });
    }
    setEditing(false);
    setMessage(null);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(category)
        ? prev.preferred_categories.filter(c => c !== category)
        : [...prev.preferred_categories, category]
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location]
    }));
  };

  const categories = [
    'Construction', 'IT & Technology', 'Healthcare', 'Education', 
    'Transportation', 'Energy', 'Agriculture', 'Manufacturing',
    'Consulting', 'Legal Services', 'Marketing', 'Security'
  ];

  const locations = [
    'Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Mbale',
    'Arua', 'Soroti', 'Lira', 'Kabale', 'Fort Portal', 'Masaka'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Basic Information
                  </h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter company name"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{profile?.company_name || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.business_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter business type"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{profile?.business_type || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter years of experience"
                      min="0"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {profile?.experience_years ? `${profile.experience_years} years` : 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contract Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Value Range
                  </label>
                  {editing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={formData.min_contract_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_contract_value: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Min (UGX)"
                        min="0"
                      />
                      <input
                        type="number"
                        value={formData.max_contract_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_contract_value: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Max (UGX)"
                        min="0"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {profile?.min_contract_value && profile?.max_contract_value ? 
                          `${profile.min_contract_value} - ${profile.max_contract_value} UGX` : 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>



                {/* Edit Actions */}
                {editing && (
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Preferences
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Preferred Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Contract Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferred_categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          disabled={!editing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Locations
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {locations.map((location) => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferred_locations.includes(location)}
                          onChange={() => handleLocationToggle(location)}
                          disabled={!editing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Subscription
                </h3>
              </div>
              <div className="p-6">
                {subscriptionStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        subscriptionStatus.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscriptionStatus.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriptionStatus.status === 'active' ? 'Active' :
                         subscriptionStatus.status === 'trial' ? 'Trial' :
                         'No Subscription'}
                      </span>
                    </div>
                    
                    {subscriptionStatus.status === 'trial' && subscriptionStatus.trialEndsAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Trial ends:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(subscriptionStatus.trialEndsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {subscriptionStatus.status === 'active' && subscriptionStatus.subscriptionEndsAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Next billing:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-200">
                      <a
                        href="/dashboard/subscription"
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Manage Subscription
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Account Info
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member since:</span>
                  <span className="text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last updated:</span>
                  <span className="text-sm text-gray-900">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
