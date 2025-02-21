import { NextApiRequest, NextApiResponse } from 'next';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, type, profile } = req.body;

    if (!name || !email || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send welcome email to user
    const welcomeResult = await sendWelcomeEmail(email, name, type);
    if (!welcomeResult.success) {
      console.error('Failed to send welcome email:', welcomeResult.error);
    }

    // Send notification to admin
    const adminResult = await sendAdminNotification({
      email,
      name,
      userType: type,
      profile: profile || {},
      position: 0 // This would need to be calculated if you want to show position
    });
    
    if (!adminResult.success) {
      console.error('Failed to send admin notification:', adminResult.error);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending emails:', error);
    return res.status(500).json({ error: 'Failed to send emails' });
  }
} 