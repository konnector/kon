import '../src/styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      // Only handle successful email verification events
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // If verified but hasn't completed onboarding, go to onboarding
        if (!session.user.user_metadata?.onboarding_completed) {
          router.push('/onboarding');
        } 
        // If verified and completed onboarding, go to dashboard
        else {
          router.push('/dashboard');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </SessionContextProvider>
  )
}

export default MyApp 