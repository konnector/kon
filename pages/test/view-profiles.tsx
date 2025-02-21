import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ViewProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data, error } = await supabase
          .from('influencer_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
      } catch (err: any) {
        console.error('Error fetching profiles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  if (loading) return <div>Loading profiles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Influencer Profiles</h1>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{profile.name}</h2>
            <p className="text-gray-600">{profile.description}</p>
            <div className="mt-2">
              <strong>Categories:</strong> {profile.content_categories?.join(', ')}
            </div>
            <div className="mt-2">
              <strong>Platforms:</strong> {profile.platforms?.join(', ')}
            </div>
            <div className="mt-2">
              <strong>Follower Counts:</strong>{' '}
              <pre className="inline">{JSON.stringify(profile.follower_counts, null, 2)}</pre>
            </div>
            <div className="mt-2">
              <strong>Social Links:</strong>{' '}
              <pre className="inline">{JSON.stringify(profile.social_links, null, 2)}</pre>
            </div>
            <div className="mt-2">
              <strong>Location:</strong> {profile.location}
            </div>
            <div className="mt-2">
              <strong>Website:</strong> {profile.website}
            </div>
            <div className="mt-2">
              <strong>Status:</strong> {profile.status}
            </div>
            <div className="mt-2">
              <strong>Created At:</strong> {new Date(profile.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 