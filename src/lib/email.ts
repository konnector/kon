import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key is not configured');
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

interface SendWaitlistEmailProps {
  to: string;
  name: string;
  userType: 'business' | 'influencer';
  position: number;
  totalSignups: number;
}

export async function sendWaitlistConfirmation({ to, name, userType, position, totalSignups }: SendWaitlistEmailProps) {
  const subject = '🎉 Welcome to Konnect - You\'re In!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Konnect</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Konnect! 🚀</h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                      Hi ${name},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                      Thank you for joining Konnect! We're thrilled to have you as one of our early members.
                      As ${userType === 'business' ? 'a business looking to connect with influencers' : 'an influencer looking to connect with brands'},
                      you'll be among the first to experience our platform when we launch.
                    </p>

                    <!-- Waitlist Position Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background-color: #f3f4f6; border-radius: 8px;">
                      <tr>
                        <td style="padding: 30px; text-align: center;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your position in line</p>
                          <h2 style="margin: 0 0 10px 0; font-size: 36px; color: #4f46e5; font-weight: bold;">#${position}</h2>
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">out of ${totalSignups} members</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Move Up in Line Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">🚀 Want to move up in line?</h3>
                          <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 21px; color: #4b5563;">
                            Share your unique referral link and move up 50 spots for each friend who joins!
                          </p>
                          <div style="background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
                            <p style="margin: 0; font-family: monospace; font-size: 14px; color: #4f46e5;">
                              https://konnect.app?ref=${to}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- What's Next Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background-color: #f3f4f6; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">✨ What's Next?</h3>
                          <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 14px; line-height: 21px;">
                            <li style="margin-bottom: 10px;">Early access to premium features</li>
                            <li style="margin-bottom: 10px;">Priority onboarding support</li>
                            <li style="margin-bottom: 10px;">Exclusive launch benefits</li>
                            <li>We'll notify you as soon as we launch</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- Social Links -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Follow us for updates</p>
                          <a href="https://twitter.com/konnectapp" style="display: inline-block; margin: 0 5px; padding: 8px 20px; background-color: #1DA1F2; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Twitter</a>
                          <a href="https://instagram.com/konnectapp" style="display: inline-block; margin: 0 5px; padding: 8px 20px; background-color: #E1306C; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Instagram</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 21px; color: #6b7280; text-align: center;">
                      Questions? Email us at <a href="mailto:support@konnector.me" style="color: #4f46e5; text-decoration: none;">support@konnector.me</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      © 2024 Konnect. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

interface AdminNotificationProps {
  email: string;
  name: string;
  userType: string;
  profile: any;
  position: number;
}

export async function sendAdminNotification({ email, name, userType, profile, position }: AdminNotificationProps) {
  const subject = '🎯 New Waitlist Signup!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Waitlist Signup</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #1f2937;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">New Waitlist Signup</h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <!-- User Details -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background-color: #f3f4f6; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">User Details</h2>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Name:</strong> ${name}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Email:</strong> ${email}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Type:</strong> ${userType}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Position:</strong> #${position}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Signup Date:</strong> ${new Date().toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Profile Details -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Profile Details</h2>
                          <pre style="margin: 0; font-family: monospace; font-size: 12px; color: #4b5563; white-space: pre-wrap;">
${JSON.stringify(profile, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      © 2024 Konnect. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ 
    to: process.env.ADMIN_EMAIL || 'admin@konnector.me',
    subject,
    html
  });
}

export const sendWelcomeEmail = async (userEmail: string, name: string, userType: 'influencer' | 'business') => {
  const subject = `🚀 Welcome To Konnector.. Launching in 7 Days!`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Konnect</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #000000 0%, #333333 100%);">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Launching in 7 Days! 🚀</h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                      Hi ${name},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                      ${userType === 'influencer' 
                        ? "You're officially on the Konnector waitlist—welcome aboard! 🎉"
                        : "Thanks for signing up for the Konnector waitlist! We're just 7 days away from launching, and we can't wait to help you discover the right influencers for your brand."}
                    </p>

                    <!-- Main Message Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background-color: #f3f4f6; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            ${userType === 'influencer'
                              ? "In just 7 days, we're launching a platform designed to help influencers like you connect with top brands, land paid collaborations, and grow your reach effortlessly."
                              : "With seamless onboarding and real-time insights, Konnector makes finding and managing influencer partnerships effortless. Whether you're looking to grow brand awareness or drive sales, our platform helps you connect with the right creators in just a few clicks."}
                          </p>
                          ${userType === 'influencer'
                            ? "<p style=\"margin: 0; font-size: 16px; line-height: 24px; color: #374151;\">You'll have access to exclusive brand deals, secure contracts, and reliable payment options—all in one place. Getting paid for collaborations has never been easier!</p>"
                            : ''}
                        </td>
                      </tr>
                    </table>

                    <!-- Stay Tuned Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 16px; line-height: 24px; color: #374151;">
                            ${userType === 'influencer'
                              ? "Please email us at hani@konnector.me or reply to this email if you have any questions or ideas for the platform."
                              : "Please email us at hani@konnector.me or reply to this email if you have any questions or ideas for the platform"}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Social Links -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Connect with us</p>
                          <a href="https://twitter.com/konnectapp" style="display: inline-block; margin: 0 5px; padding: 8px 20px; background-color: #1DA1F2; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Twitter</a>
                          <a href="https://instagram.com/konnectapp" style="display: inline-block; margin: 0 5px; padding: 8px 20px; background-color: #E1306C; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Instagram</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 24px; color: #374151;">
                      ${userType === 'influencer' ? 'See you soon,' : 'Excited to help your brand grow,'}
                    </p>
                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: #374151;">
                      The Konnector Team
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      © 2024 Konnect. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (process.env.NODE_ENV === 'development' && !process.env.SEND_REAL_EMAILS) {
    return html;
  }

  return sendEmail({ to: userEmail, subject, html });
}; 