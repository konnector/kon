import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Get user type and profile data
        const { data: profile } = await supabase
          .rpc('get_user_profile', {
            p_user_id: session.user.id
          });

        if (!profile) {
          return res.status(404).json({
            error: 'Profile not found'
          });
        }

        // Calculate profile completion percentage
        const requiredFields = profile.type === 'influencer' 
          ? ['name', 'username', 'bio', 'content_categories', 'platforms']
          : ['business_name', 'username', 'description', 'industry', 'product_categories'];

        const profileData = profile.profile || {};
        const completedFields = requiredFields.filter(field => {
          const value = profileData[field];
          return value && 
            (Array.isArray(value) ? value.length > 0 : value.trim().length > 0);
        });

        const completionPercentage = Math.round(
          (completedFields.length / requiredFields.length) * 100
        );

        return res.status(200).json({
          ...profile,
          completion_percentage: completionPercentage
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Error fetching profile' });
      }

    case 'PUT':
      try {
        const { type, ...profileData } = req.body;

        // Validate user type
        if (!['influencer', 'business'].includes(type)) {
          return res.status(400).json({
            error: 'Invalid user type'
          });
        }

        // Update the appropriate profile table
        const table = type === 'influencer' ? 'influencer_profiles' : 'business_profiles';
        const { data: profile, error } = await supabase
          .from(table)
          .upsert({
            id: session.user.id,
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Update user metadata with type
        await supabase.auth.updateUser({
          data: { type }
        });

        return res.status(200).json(profile);
      } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Error updating profile' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 