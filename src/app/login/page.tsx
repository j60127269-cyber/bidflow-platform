'use client'

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { subscriptionService } from "@/lib/subscriptionService";
import { onboardingService } from "@/lib/onboardingService";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for email verification message
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam === 'verify_email') {
      setMessage("Please verify your email address before signing in. Check your email for a verification link.");
    }
  }, [searchParams]);

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

      // Check subscription status
      const subscriptionStatus = await subscriptionService.getUserSubscriptionStatus(userId);
      const status = subscriptionStatus?.status as string | undefined;
      
      if (status === 'active' || status === 'trial') {
        return 'dashboard';
      } else {
        // User has profile but no active subscription
        return 'subscription';
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // Default to onboarding if there's an error
      return 'onboarding';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Get the current user to check their status
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userStatus = await checkUserStatus(user.id);
        
        switch (userStatus) {
          case 'email_not_verified':
            setError("Please verify your email address before signing in. Check your email for a verification link.");
            setLoading(false);
            break;
          case 'dashboard':
            router.push('/dashboard');
            break;
          case 'subscription':
            router.push('/onboarding/subscription');
            break;
          case 'onboarding':
          default:
            router.push('/onboarding/welcome');
            break;
        }
      } else {
        // Fallback to onboarding
        router.push('/onboarding/welcome');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    const { error } = await signInWithGoogle();
    
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Google OAuth will redirect automatically, so we don't need to handle success here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">BidCloud</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-slate-50 to-blue-50 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? "Signing in with Google..." : "Sign in with Google"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 