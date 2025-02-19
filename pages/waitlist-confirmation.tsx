import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter } from 'lucide-react';

export default function WaitlistConfirmation() {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/');
      }
    }

    checkAuth();
  }, [supabase.auth, router]);

  const shareText = "I just joined the waitlist for Konnect - a platform that's revolutionizing how businesses and influencers connect! 🚀";
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://konnect.app')}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">You're on the List! 🎉</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Thank you for joining Konnect's waitlist. We're excited to have you as one of our early members!
          </p>
          <div className="bg-primary/10 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2">What's Next?</h2>
            <ul className="text-left space-y-2">
              <li>✅ We'll notify you as soon as we launch</li>
              <li>✅ Early access to premium features</li>
              <li>✅ Priority onboarding support</li>
              <li>✅ Exclusive launch benefits</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4">Spread the Word!</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open(twitterShareUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <Twitter className="w-4 h-4" />
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText('https://konnect.app');
                // You might want to add a toast notification here
              }}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Copy Invite Link
            </Button>
          </div>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            Have questions? Email us at{' '}
            <a href="mailto:support@konnect.app" className="text-primary hover:underline">
              support@konnect.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 