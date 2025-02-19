import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function DiscoverIndex() {
  const router = useRouter();

  useEffect(() => {
    const redirectUser = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If no user is logged in, redirect to home page
          router.push('/');
          return;
        }

        // Get user type from metadata
        const userType = user.user_metadata?.type;

        // Redirect based on user type
        if (userType === 'influencer') {
          router.push('/discover/businesses');
        } else if (userType === 'business') {
          router.push('/discover/influencers');
        } else {
          // Fallback to dashboard if user type is not set
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        // On error, redirect to home page
        router.push('/');
      }
    };

    redirectUser();
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </div>
  );
} 