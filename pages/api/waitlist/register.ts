import { NextApiRequest, NextApiResponse } from 'next';
import { sendWaitlistConfirmation, sendAdminNotification } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, userType, profile } = req.body;

    if (!email || !name || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send welcome email and admin notification
    await Promise.all([
      sendWaitlistConfirmation({
        to: email,
        name,
        userType: userType as 'business' | 'influencer'
      }),
      sendAdminNotification({
        email,
        name,
        userType,
        profile
      })
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in waitlist registration:', error);
    return res.status(500).json({ error: 'Failed to process registration' });
  }
} 