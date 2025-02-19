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
        // Get user profile to determine type
        const { data: profile } = await supabase
          .rpc('get_user_profile', {
            p_user_id: session.user.id
          });

        if (!profile) {
          return res.status(404).json({
            error: 'Profile not found'
          });
        }

        const table = profile.type === 'influencer' ? 'influencer_profiles' : 'business_profiles';
        const { data: socialData, error } = await supabase
          .from(table)
          .select('social_links, platforms, follower_counts')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        return res.status(200).json(socialData);
      } catch (error) {
        console.error('Error fetching social links:', error);
        return res.status(500).json({ error: 'Error fetching social links' });
      }

    case 'PUT':
      try {
        const { platform, username, metrics } = req.body;

        if (!platform || !username) {
          return res.status(400).json({
            error: 'Platform and username are required'
          });
        }

        // Get user profile to determine type
        const { data: profile } = await supabase
          .rpc('get_user_profile', {
            p_user_id: session.user.id
          });

        if (!profile) {
          return res.status(404).json({
            error: 'Profile not found'
          });
        }

        const table = profile.type === 'influencer' ? 'influencer_profiles' : 'business_profiles';
        
        // Get current social data
        const { data: currentData, error: fetchError } = await supabase
          .from(table)
          .select('social_links, platforms, follower_counts')
          .eq('id', session.user.id)
          .single();

        if (fetchError) throw fetchError;

        // Update social links
        const socialLinks = {
          ...(currentData?.social_links || {}),
          [platform]: username
        };

        // Update platforms array if not already included
        const platforms = Array.from(new Set([
          ...(currentData?.platforms || []),
          platform
        ]));

        // Update follower counts if metrics provided
        const followerCounts = {
          ...(currentData?.follower_counts || {}),
          ...(metrics ? { [platform]: metrics } : {})
        };

        // Update profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from(table)
          .update({
            social_links: socialLinks,
            platforms,
            follower_counts: followerCounts,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id)
          .select('social_links, platforms, follower_counts')
          .single();

        if (updateError) throw updateError;

        return res.status(200).json(updatedProfile);
      } catch (error) {
        console.error('Error updating social links:', error);
        return res.status(500).json({ error: 'Error updating social links' });
      }

    case 'DELETE':
      try {
        const { platform } = req.body;

        if (!platform) {
          return res.status(400).json({
            error: 'Platform is required'
          });
        }

        // Get user profile to determine type
        const { data: profile } = await supabase
          .rpc('get_user_profile', {
            p_user_id: session.user.id
          });

        if (!profile) {
          return res.status(404).json({
            error: 'Profile not found'
          });
        }

        const table = profile.type === 'influencer' ? 'influencer_profiles' : 'business_profiles';
        
        // Get current social data
        const { data: currentData, error: fetchError } = await supabase
          .from(table)
          .select('social_links, platforms, follower_counts')
          .eq('id', session.user.id)
          .single();

        if (fetchError) throw fetchError;

        // Remove platform from social links
        const socialLinks = { ...currentData?.social_links };
        delete socialLinks[platform];

        // Remove platform from platforms array
        const platforms = (currentData?.platforms || []).filter((p: string) => p !== platform);

        // Remove platform from follower counts
        const followerCounts = { ...currentData?.follower_counts };
        delete followerCounts[platform];

        // Update profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from(table)
          .update({
            social_links: socialLinks,
            platforms,
            follower_counts: followerCounts,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id)
          .select('social_links, platforms, follower_counts')
          .single();

        if (updateError) throw updateError;

        return res.status(200).json(updatedProfile);
      } catch (error) {
        console.error('Error removing social link:', error);
        return res.status(500).json({ error: 'Error removing social link' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 