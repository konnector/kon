import { NextApiRequest, NextApiResponse } from 'next';
import { sendWaitlistConfirmation, sendAdminNotification } from '@/lib/email';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    const { email, name, userType, profile } = req.body;

    if (!email || !name || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get current total signups
    const { count } = await supabase
      .from('waitlist_positions')
      .select('*', { count: 'exact' });

    const position = (count || 0) + 1;

    // Create waitlist position entry
    const { error: positionError } = await supabase
      .from('waitlist_positions')
      .insert({
        user_id: profile.id,
        position,
        total_signups: position,
        user_type: userType,
        referral_count: 0
      });

    if (positionError) {
      console.error('Error creating waitlist position:', positionError);
      throw positionError;
    }

    // Send welcome email and admin notification
    await Promise.all([
      sendWaitlistConfirmation({
        to: email,
        name,
        userType: userType as 'business' | 'influencer',
        position,
        totalSignups: position
      }),
      sendAdminNotification({
        email,
        name,
        userType,
        profile,
        position
      })
    ]);

    return res.status(200).json({ success: true, position });
  } catch (error) {
    console.error('Error in waitlist registration:', error);
    return res.status(500).json({ error: 'Failed to process registration' });
  }
} 