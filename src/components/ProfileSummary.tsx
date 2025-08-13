"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { User, Building, MapPin, Briefcase } from 'lucide-react';

interface ProfileSummaryProps {
  showDetails?: boolean;
  className?: string;
}

export default function ProfileSummary({ showDetails = true, className = '' }: ProfileSummaryProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">User</div>
          <div className="text-xs text-gray-500">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <User className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {profile.company_name || user?.email}
        </div>
        {showDetails && (
          <div className="mt-1 space-y-1">
            {profile.experience_years && (
              <div className="flex items-center text-xs text-gray-500">
                <Briefcase className="h-3 w-3 mr-1" />
                {profile.experience_years} years experience
              </div>
            )}
            {profile.team_size && (
              <div className="flex items-center text-xs text-gray-500">
                <Building className="h-3 w-3 mr-1" />
                {profile.team_size} team members
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
