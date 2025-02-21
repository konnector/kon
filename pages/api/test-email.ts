import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import sgMail from '@sendgrid/mail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const configCheck = {
    SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: !!process.env.SENDGRID_FROM_EMAIL,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
  };

  // Check if any required environment variables are missing
  const missingConfigs = Object.entries(configCheck)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingConfigs.length > 0) {
    return res.status(500).json({
      error: 'Missing configuration',
      details: `Missing required environment variables: ${missingConfigs.join(', ')}`
    });
  }

  try {
    // Try sending a test email - this will validate the API key
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'Konnect Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Email Configuration Test</h1>
          <p>This is a test email from your Konnect application.</p>
          <p>Configuration Status:</p>
          <ul>
            <li>SendGrid API Key: ✅ Present</li>
            <li>From Email: ${process.env.SENDGRID_FROM_EMAIL}</li>
            <li>To Email: ${process.env.ADMIN_EMAIL}</li>
            <li>Test Time: ${new Date().toLocaleString()}</li>
          </ul>
          <p>If you're receiving this, your email setup is working correctly!</p>
        </div>
      `
    });

    if (result.success) {
      return res.status(200).json({
        message: 'Email configuration test completed successfully',
        config: {
          ...configCheck,
          fromEmail: process.env.SENDGRID_FROM_EMAIL,
          toEmail: process.env.ADMIN_EMAIL
        }
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send test email',
        details: result.error,
        config: configCheck
      });
    }
  } catch (error: any) {
    console.error('Error during email test:', error);
    return res.status(500).json({
      error: 'Email test failed',
      details: error.message,
      config: configCheck
    });
  }
} 