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

const testInfluencers = [
  {
    email: "emma.johnson@test.com",
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
  // ... add the rest of your test influencers here
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];
    
    for (const influencer of testInfluencers) {
      // Create auth user with admin rights
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: influencer.email,
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

      // Wait a short time between creating users to avoid rate limiting
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

      results.push({
        email: influencer.email,
        name: influencer.name,
        success: true
      });
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    console.error('Error creating test data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while creating test data'
    });
  }
} 