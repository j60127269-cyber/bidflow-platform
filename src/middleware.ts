import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/auth/callback', '/payment/callback'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Define onboarding routes
  const onboardingRoutes = ['/onboarding'];
  const isOnboardingRoute = onboardingRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user exists, check their onboarding status
  if (user) {
    // Skip onboarding check for public routes and onboarding routes
    if (!isPublicRoute && !isOnboardingRoute) {
      try {
        // Check if user has completed onboarding
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, preferred_categories, business_type, min_contract_value')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No profile exists - redirect to onboarding
          return NextResponse.redirect(new URL('/onboarding/welcome', req.url));
        }

        if (profile) {
          // Check if onboarding is completed
          const hasCompletedOnboarding = profile.onboarding_completed === true || 
            (profile.preferred_categories && profile.business_type && profile.min_contract_value);

          if (!hasCompletedOnboarding) {
            // User hasn't completed onboarding - redirect to onboarding
            return NextResponse.redirect(new URL('/onboarding/welcome', req.url));
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status in middleware:', error);
        // On error, redirect to onboarding to be safe
        return NextResponse.redirect(new URL('/onboarding/welcome', req.url));
      }
    }

    // If user is on onboarding route but has completed onboarding, redirect to dashboard
    if (isOnboardingRoute) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, preferred_categories, business_type, min_contract_value')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          const hasCompletedOnboarding = profile.onboarding_completed === true || 
            (profile.preferred_categories && profile.business_type && profile.min_contract_value);

          if (hasCompletedOnboarding) {
            // User has completed onboarding - redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
        }
      } catch (error) {
        console.error('Error checking onboarding completion in middleware:', error);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
