import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import InfluencerProfile from '@/components/InfluencerProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!username) return;

      try {
        // First, try to find the profile by the exact name
        const { data, error: profileError } = await supabase
          .from('influencer_profiles')
          .select('*')
          .ilike('name', username.toString().replace(/-/g, ' '))
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Profile not found');
        }

        if (!data) {
          throw new Error('Profile not found');
        }

        setProfileData(data);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <InfluencerProfile profile={profileData} />;
} 