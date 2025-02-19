import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if email is verified
        if (!session?.user?.email_confirmed_at) {
          setVerificationError('Please verify your email address before continuing.');
          return;
        }

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .rpc('get_user_profile', {
            p_user_id: session?.user?.id
          });

        if (profile?.profile?.onboarding_completed) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else if (event === 'USER_UPDATED') {
        // Handle email verification completion
        if (session?.user?.email_confirmed_at) {
          setVerificationError(null);
          const { data: profile } = await supabase
            .rpc('get_user_profile', {
              p_user_id: session?.user?.id
            });

          if (profile?.profile?.onboarding_completed) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handleResendVerification = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email,
      });
      if (!error) {
        alert('Verification email sent!');
      }
    }
  };

  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4 p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Email Verification Required</h2>
            <p className="mt-2 text-sm text-gray-600">
              {verificationError}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Please check your email for a verification link. If you haven't received the email, you can request a new one.
            </p>
          </div>
          <button
            onClick={handleResendVerification}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
} 