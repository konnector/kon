import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Function to generate a random email
const generateRandomEmail = (name: string) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${name.toLowerCase().replace(/\s+/g, '.')}.${randomStr}.${timestamp}@example.com`;
};

const testInfluencers = [
  {
    name: "Emma Johnson",
    description: "Fashion and lifestyle content creator sharing daily outfit inspiration and beauty tips.",
    content_categories: ["Fashion", "Beauty", "Lifestyle"],
    platforms: ["instagram", "youtube", "tiktok"],
    follower_counts: {
      instagram: "250K+",
      youtube: "100K+",
      tiktok: "500K+"
    },
    social_links: {
      instagram: "@emmastyle",
      youtube: "@emmajohnson",
      tiktok: "@emmalifestyle"
    }
  },
  {
    name: "Alex Tech",
    description: "Tech reviewer and gadget enthusiast covering the latest in technology.",
    content_categories: ["Technology", "Gaming", "Reviews"],
    platforms: ["youtube", "twitter"],
    follower_counts: {
      youtube: "750K+",
      twitter: "200K+"
    },
    social_links: {
      youtube: "@alextech",
      twitter: "@alextechreviews"
    }
  },
  {
    name: "Sarah Fitness",
    description: "Certified personal trainer sharing workout tips and healthy lifestyle advice.",
    content_categories: ["Fitness", "Health", "Wellness"],
    platforms: ["instagram", "youtube"],
    follower_counts: {
      instagram: "300K+",
      youtube: "200K+"
    },
    social_links: {
      instagram: "@sarahfitness",
      youtube: "@sarahfitnessofficial"
    }
  },
  {
    name: "Mike Foodie",
    description: "Food blogger and chef sharing recipes and restaurant reviews.",
    content_categories: ["Food", "Cooking", "Travel"],
    platforms: ["instagram", "tiktok", "youtube"],
    follower_counts: {
      instagram: "150K+",
      tiktok: "400K+",
      youtube: "80K+"
    },
    social_links: {
      instagram: "@mikefoodie",
      tiktok: "@mikefoodie",
      youtube: "@mikefoodieofficial"
    }
  },
  {
    name: "Lisa Art",
    description: "Digital artist and creative content creator sharing art tutorials.",
    content_categories: ["Art", "Design", "Education"],
    platforms: ["instagram", "youtube", "tiktok"],
    follower_counts: {
      instagram: "180K+",
      youtube: "250K+",
      tiktok: "300K+"
    },
    social_links: {
      instagram: "@lisaartcreates",
      youtube: "@lisaart",
      tiktok: "@lisaartofficial"
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];
    
    for (const influencer of testInfluencers) {
      try {
        const email = generateRandomEmail(influencer.name);
        console.log(`Creating user with email: ${email}`);

        // Create auth user with admin rights
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: 'testpass123',
          email_confirm: true,
          user_metadata: {
            name: influencer.name,
            type: 'influencer'
          }
        });

        if (userError) {
          console.error('Error creating user:', userError);
          throw userError;
        }

        if (!userData.user) {
          throw new Error('No user data returned');
        }

        // Wait a short time between operations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create influencer profile
        const { error: profileError } = await supabaseAdmin
          .from('influencer_profiles')
          .insert([
            {
              id: userData.user.id,
              name: influencer.name,
              description: influencer.description,
              content_categories: influencer.content_categories,
              platforms: influencer.platforms,
              follower_counts: influencer.follower_counts,
              social_links: influencer.social_links,
              onboarding_completed: true
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        // Update spreadsheet
        const spreadsheetResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/update-spreadsheet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-is-test-data': 'true'
          },
          body: JSON.stringify({
            type: 'influencer',
            profile: {
              id: userData.user.id,
              email: email,
              name: influencer.name,
              description: influencer.description,
              content_categories: influencer.content_categories,
              platforms: influencer.platforms,
              follower_counts: influencer.follower_counts,
              social_links: influencer.social_links,
              status: 'active',
              verified: true
            }
          }),
        });

        if (!spreadsheetResponse.ok) {
          const spreadsheetError = await spreadsheetResponse.json();
          throw new Error(`Failed to update spreadsheet: ${spreadsheetError.error}`);
        }

        results.push({
          email,
          name: influencer.name,
          success: true,
          status: 'created'
        });

      } catch (error: any) {
        console.error(`Error processing influencer ${influencer.name}:`, error);
        results.push({
          name: influencer.name,
          success: false,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return res.status(200).json({ 
      success: true, 
      data: results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error: any) {
    console.error('Error creating test data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while creating test data'
    });
  }
} 