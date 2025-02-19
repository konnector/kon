import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { MatchingService } from '@/services/matching';
import { BusinessProfile, InfluencerProfile } from '@/types/onboarding';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get the user's profile
    const { data: userProfile, error: userError } = await supabase
      .from(userType === 'business' ? 'business_profiles' : 'influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get potential matches
    const { data: potentialMatches, error: matchError } = await supabase
      .from(userType === 'business' ? 'influencer_profiles' : 'business_profiles')
      .select('*');

    if (matchError) {
      return res.status(500).json({ error: 'Failed to fetch potential matches' });
    }

    // Calculate match scores
    const matches = potentialMatches.map((match) => {
      const score = userType === 'business'
        ? MatchingService.calculateMatchScore(userProfile as BusinessProfile, match as InfluencerProfile)
        : MatchingService.calculateMatchScore(match as BusinessProfile, userProfile as InfluencerProfile);

      return {
        profile: match,
        ...score
      };
    });

    // Sort matches by score in descending order
    const sortedMatches = matches.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      matches: sortedMatches
    });
  } catch (error) {
    console.error('Error in match discovery:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 