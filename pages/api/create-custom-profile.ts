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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    type,  // 'influencer' or 'business'
    email,
    name,
    description,
    content_categories,
    platforms,
    follower_counts,
    social_links,
    location,
    website,
    avatar_url
  } = req.body;

  try {
    // Create auth user with admin rights
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'testpass123',
      email_confirm: true,
    });

    if (userError) throw userError;

    if (type === 'influencer') {
      // Create influencer profile
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('influencer_profiles')
        .insert({
          id: userData.user.id,
          name,
          description,
          content_categories,
          platforms,
          follower_counts,
          social_links,
          location,
          website,
          avatar_url,
          verified: true,
          status: 'active'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      return res.status(200).json({
        message: 'Influencer profile created successfully',
        profile: profileData
      });
    } else if (type === 'business') {
      // Create business profile
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('business_profiles')
        .insert({
          id: userData.user.id,
          business_name: name,
          description,
          industry_categories: content_categories,
          location,
          website,
          avatar_url,
          verified: true,
          status: 'active'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      return res.status(200).json({
        message: 'Business profile created successfully',
        profile: profileData
      });
    }

  } catch (error: any) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: error.message });
  }
} 