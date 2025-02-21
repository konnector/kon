import { NextApiRequest, NextApiResponse } from 'next';
import { sendWelcomeEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type = 'influencer' } = req.query;
  
  try {
    // Generate test data based on type
    const testData = {
      influencer: {
        email: 'test@example.com',
        name: 'Sarah Johnson',
        type: 'influencer'
      },
      business: {
        email: 'test@example.com',
        name: 'Acme Corporation',
        type: 'business'
      }
    };

    // Get the appropriate test data
    const data = type === 'influencer' ? testData.influencer : testData.business;

    // Generate the email without sending it
    const result = await sendWelcomeEmail(data.email, data.name, data.type as 'influencer' | 'business');

    // Return the HTML content
    res.setHeader('Content-Type', 'text/html');
    return res.send(result.html || 'Preview not available');

  } catch (error) {
    console.error('Error generating preview:', error);
    return res.status(500).json({ error: 'Failed to generate email preview' });
  }
} 