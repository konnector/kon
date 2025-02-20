import { Resend } from 'resend';

// Server-side only initialization
let resend: Resend | null = null;

if (typeof window === 'undefined') {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  resend = new Resend(process.env.RESEND_API_KEY);
}

interface SendWaitlistEmailProps {
  to: string;
  name: string;
  userType: 'business' | 'influencer';
}

export async function sendWaitlistConfirmation({ to, name, userType }: SendWaitlistEmailProps) {
  if (!resend) {
    throw new Error('Email client not initialized - this method must be called from the server');
  }

  try {
    const response = await resend.emails.send({
      from: 'Konnect <waitlist@konnect.app>',
      to: [to],
      subject: 'Welcome to the Konnect Waitlist! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">Welcome to Konnect! 🚀</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hi ${name},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for joining the Konnect waitlist! We're thrilled to have you as one of our early members.
            As ${userType === 'business' ? 'a business looking to connect with influencers' : 'an influencer looking to connect with brands'},
            you'll be among the first to experience our platform when we launch.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">What's Next?</h2>
            <ul style="color: #666; font-size: 16px; line-height: 1.5;">
              <li>We'll notify you as soon as we launch</li>
              <li>You'll get early access to premium features</li>
              <li>Priority onboarding support</li>
              <li>Exclusive launch benefits</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            While you wait, follow us on social media to stay updated:
          </p>
          
          <div style="margin: 24px 0;">
            <a href="https://twitter.com/konnectapp" style="color: #fff; background-color: #1DA1F2; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-right: 10px;">Twitter</a>
            <a href="https://instagram.com/konnectapp" style="color: #fff; background-color: #E1306C; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Instagram</a>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            If you have any questions, feel free to reply to this email or reach out to us at support@konnect.app
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 14px;">
            Konnect - Connecting Businesses with Influencers
          </p>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send waitlist confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(newUser: {
  email: string;
  name: string;
  userType: string;
  profile: any;
}) {
  try {
    const response = await resend.emails.send({
      from: 'Konnect <notifications@konnect.app>',
      to: ['admin@konnect.app'], // Replace with your admin email
      subject: '🎯 New Waitlist Signup!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px;">New Waitlist Signup</h1>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">User Details</h2>
            <ul style="color: #666; font-size: 16px; line-height: 1.5;">
              <li><strong>Name:</strong> ${newUser.name}</li>
              <li><strong>Email:</strong> ${newUser.email}</li>
              <li><strong>Type:</strong> ${newUser.userType}</li>
              <li><strong>Signup Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0;">Profile Details</h2>
            <pre style="color: #666; font-size: 14px; overflow-x: auto;">
${JSON.stringify(newUser.profile, null, 2)}
            </pre>
          </div>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
} 