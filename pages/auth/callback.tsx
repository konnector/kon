import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const handleVerification = async () => {
      try {
        // Extract token from URL
        const token = router.query.token as string;
        
        if (!token) {
          // If no token, redirect to home
          router.push('/');
          return;
        }

        // Exchange the token for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(token);
        
        if (error) {
          throw error;
        }

        // Set the session
        if (data?.session) {
          await supabase.auth.setSession(data.session);
          toast.success('Email verified successfully!');
          
          // Redirect based on onboarding status
          if (data.session.user.user_metadata?.onboarding_completed) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      } catch (error) {
        // On any error, redirect to home page
        router.push('/');
      }
    };

    handleVerification();
  }, [router.isReady, router.query]);

  // Show minimal loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
} 