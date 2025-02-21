import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Get user profile based on user type
        const { data: profile } = await supabaseClient
          .from(session.user.user_metadata?.type === 'business' ? 'business_profiles' : 'influencer_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({ ...session.user, profile });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();

    // Set up auth state change listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { data: profile } = await supabaseClient
            .from(session.user.user_metadata?.type === 'business' ? 'business_profiles' : 'influencer_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser({ ...session.user, profile });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Handle clicks outside of menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [supabaseClient]);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 relative">
          {user.profile?.avatar_url ? (
            <Image
              src={user.profile.avatar_url}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-sm font-medium">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <div className="font-medium">{user.user_metadata.full_name}</div>
            <div className="text-gray-500">{user.email}</div>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/dashboard');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/settings');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </button>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 