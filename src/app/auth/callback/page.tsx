'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/lib/subscriptionService';
import { onboardingService } from '@/lib/onboardingService';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);

  const checkUserStatus = async (userId: string) => {
    try {
      // First check if user's email is verified
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email_confirmed_at) {
        // User's email is not verified
        return 'email_not_verified';
      }

      // Check if user has completed onboarding
      const hasCompletedOnboarding = await onboardingService.hasCompletedOnboarding(userId);
      
      if (!hasCompletedOnboarding) {
        // User hasn't completed onboarding
        return 'onboarding';
      }

      // If user has completed onboarding, always go to dashboard
      // Subscription status is handled within the dashboard
      return 'dashboard';
    } catch (error) {
      console.error('Error checking user status:', error);
      // Default to onboarding if there's an error
      return 'onboarding';
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!loading && user) {
        try {
          const userStatus = await checkUserStatus(user.id);
          
          switch (userStatus) {
            case 'email_not_verified':
              router.push('/login?message=verify_email');
              break;
            case 'dashboard':
              router.push('/dashboard');
              break;
            case 'onboarding':
            default:
              router.push('/onboarding/welcome');
              break;
          }
        } catch (error) {
          console.error('Error in auth callback:', error);
          // Fallback to onboarding
          router.push('/onboarding/welcome');
        }
      } else if (!loading && !user) {
        // No user found, redirect to login
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Setting up your account...</p>
      </div>
    </div>
  );
}
