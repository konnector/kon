import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check auth state
  const { data: { session }, error } = await supabase.auth.getSession();

  // Get the pathname
  const pathname = req.nextUrl.pathname;

  // Allow all public routes and API routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/' ||
    pathname === '/auth/callback' ||
    pathname === '/auth/login' ||
    pathname === '/auth/signup'
  ) {
    return res;
  }

  // If user is not logged in and trying to access protected routes
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is logged in
  const user = session.user;
  const userType = user.user_metadata.type as 'influencer' | 'business';

  // Get profile data to check onboarding status
  const { data: profile } = await supabase
    .from(userType === 'influencer' ? 'influencer_profiles' : 'business_profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  const onboardingCompleted = profile?.onboarding_completed;
  const isOnboardingPage = pathname === '/onboarding';
  const isDashboardPage = pathname.startsWith('/dashboard');

  // If onboarding is not completed and user is trying to access dashboard
  if (!onboardingCompleted && isDashboardPage) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // If onboarding is completed and user is trying to access onboarding page
  if (onboardingCompleted && isOnboardingPage) {
    return NextResponse.redirect(new URL(`/dashboard/${userType}`, req.url));
  }

  // Protect dashboard routes based on user type
  if (isDashboardPage) {
    const accessingInfluencerDashboard = pathname.startsWith('/dashboard/influencer');
    const accessingBusinessDashboard = pathname.startsWith('/dashboard/business');

    if (userType === 'influencer' && accessingBusinessDashboard) {
      return NextResponse.redirect(new URL('/dashboard/influencer', req.url));
    }

    if (userType === 'business' && accessingInfluencerDashboard) {
      return NextResponse.redirect(new URL('/dashboard/business', req.url));
    }
  }

  return res;
}

// Specify which routes should be protected by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 