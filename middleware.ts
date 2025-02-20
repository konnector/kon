import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed paths during waitlist period
const ALLOWED_PATHS = [
  '/',
  '/auth/callback',
  '/auth/login',
  '/auth/signup',
  '/onboarding',
  '/waitlist-confirmation'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check auth state
  const { data: { session }, error } = await supabase.auth.getSession();

  // Get the pathname
  const pathname = req.nextUrl.pathname;

  // Allow all API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static')
  ) {
    return res;
  }

  // Check if the path is allowed during waitlist
  const isAllowedPath = ALLOWED_PATHS.includes(pathname);
  
  // If path is not allowed, redirect to home
  if (!isAllowedPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!session && pathname !== '/' && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is logged in
  if (session) {
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

    // If onboarding is not completed, only allow onboarding page
    if (!onboardingCompleted && !isOnboardingPage && pathname !== '/waitlist-confirmation') {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // If onboarding is completed, redirect to waitlist confirmation
    if (onboardingCompleted && isOnboardingPage) {
      return NextResponse.redirect(new URL('/waitlist-confirmation', req.url));
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