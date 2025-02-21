import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { referrerId } = req.body;

    if (!referrerId) {
      return res.status(400).json({ error: 'Missing referrer ID' });
    }

    // Check if referrer exists and get their position
    const { data: referrer, error: referrerError } = await supabase
      .from('waitlist_positions')
      .select('*')
      .eq('user_id', referrerId)
      .single();

    if (referrerError || !referrer) {
      return res.status(404).json({ error: 'Referrer not found' });
    }

    // Update referrer's stats
    const { error: updateError } = await supabase
      .from('waitlist_positions')
      .update({
        referral_count: referrer.referral_count + 1
      })
      .eq('user_id', referrerId);

    if (updateError) {
      throw updateError;
    }

    // Get updated position
    const { data: updatedPosition } = await supabase
      .from('waitlist_positions')
      .select('position, referral_count')
      .eq('user_id', referrerId)
      .single();

    return res.status(200).json({
      success: true,
      data: updatedPosition
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    return res.status(500).json({ error: 'Failed to process referral' });
  }
} 