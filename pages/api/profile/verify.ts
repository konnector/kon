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
    case 'POST':
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
        
        // Check if profile is complete
        const requiredFields = profile.type === 'influencer' 
          ? ['name', 'username', 'bio', 'content_categories', 'platforms', 'social_links']
          : ['business_name', 'username', 'description', 'industry', 'product_categories', 'website'];

        const profileData = profile.profile || {};
        const missingFields = requiredFields.filter(field => {
          const value = profileData[field];
          return !value || 
            (Array.isArray(value) ? value.length === 0 : value.trim().length === 0);
        });

        if (missingFields.length > 0) {
          return res.status(400).json({
            error: 'Profile incomplete',
            missing_fields: missingFields
          });
        }

        // For influencers, check if they have enough followers
        if (profile.type === 'influencer') {
          const totalFollowers = Object.values(profileData.follower_counts || {})
            .reduce((sum: number, count: any) => sum + (parseInt(count) || 0), 0);

          if (totalFollowers < 1000) { // Minimum follower requirement
            return res.status(400).json({
              error: 'Insufficient followers for verification',
              required: 1000,
              current: totalFollowers
            });
          }
        }

        // Create verification request
        const { data: verificationRequest, error } = await supabase
          .from('verification_requests')
          .insert({
            user_id: session.user.id,
            user_type: profile.type,
            status: 'pending',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Update profile verification status
        const { error: updateError } = await supabase
          .from(table)
          .update({
            verification_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) throw updateError;

        return res.status(200).json(verificationRequest);
      } catch (error) {
        console.error('Error submitting verification request:', error);
        return res.status(500).json({ error: 'Error submitting verification request' });
      }

    case 'GET':
      try {
        // Get latest verification request status
        const { data: verificationRequest, error } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', session.user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows returned
            return res.status(404).json({
              error: 'No verification request found'
            });
          }
          throw error;
        }

        return res.status(200).json(verificationRequest);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        return res.status(500).json({ error: 'Error fetching verification status' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 