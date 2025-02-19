import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type EmailOtpType } from '@supabase/supabase-js';

// Debug logs
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZmt3cGxybnJtbG9lbGJ3eWxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg4NzM5OSwiZXhwIjoyMDU1NDYzMzk5fQ.EkFkQP8xuBgJJFuFNsvIzdR8D6ol9knTKdbLQHsourQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anonymous key');
}

// Create a single instance of the Supabase client
const supabase = createPagesBrowserClient();

export type AuthError = {
  message: string;
  status?: number;
};

export type AuthResponse = {
  error: AuthError | null;
  data: any | null;
  message?: string;
};

export const handleSignUp = async (email: string, password: string, userType: 'influencer' | 'business'): Promise<AuthResponse> => {
  try {
    console.log('Initiating sign up:', { email, userType });
    
    // Configure the email template URL
    const redirectTo = new URL('/auth/callback', window.location.origin);
    console.log('Redirect URL:', redirectTo.toString());

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo.toString(),
        data: {
          type: userType,
        },
      },
    });

    console.log('Sign up response:', { data, error });

    if (error) throw error;

    return { 
      data, 
      error: null,
      message: 'Please check your email for the verification link.'
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to sign up',
        status: error.status
      }
    };
  }
};

export const handleSignIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Initiating sign in:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Sign in response:', { data, error });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to sign in',
        status: error.status
      }
    };
  }
};

export const handleSignOut = async (): Promise<AuthResponse> => {
  try {
    console.log('Initiating sign out');
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to sign out',
        status: error.status
      }
    };
  }
};

export const handleAuthStateChange = (callback: (event: any, session: any) => void) => {
  console.log('Setting up auth state change listener');
  return supabase.auth.onAuthStateChange(callback);
};

export const getCurrentSession = async () => {
  console.log('Getting current session');
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Current session:', { session, error });
  return { session, error };
};

export const handleEmailVerification = async (token: string): Promise<AuthResponse> => {
  try {
    console.log('Processing email verification:', { token });
    
    // First try to exchange the PKCE token
    const { data, error } = await supabase.auth.exchangeCodeForSession(token);
    
    console.log('Verification response:', { data, error });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Verification error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to verify email',
        status: error.status
      }
    };
  }
};

export { supabase };

export const createTestProfile = async () => {
  const testEmail = 'test.influencer@tempmail.dev'; // Using a valid email format
  const testPassword = 'testpassword123';

  try {
    // First check if the test user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    let userId;

    if (existingUser.user) {
      userId = existingUser.user.id;
      console.log('Using existing test user');
    } else {
      // Create new test user
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test Influencer',
            type: 'influencer'
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        throw new Error(signUpError.message);
      }
      if (!newUser.user) throw new Error('Failed to create test user');
      
      userId = newUser.user.id;
      console.log('Created new test user');
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Create the profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('influencer_profiles')
        .insert([
          {
            id: userId,
            name: 'Test Influencer',
            platforms: ['Instagram', 'YouTube', 'TikTok'],
            follower_counts: {
              Instagram: '100000+',
              YouTube: '10000-100000',
              TikTok: '100000+'
            },
            content_categories: ['Fashion', 'Lifestyle', 'Travel'],
            social_links: {
              Instagram: 'testinfluencer',
              YouTube: '@testinfluencer',
              TikTok: '@testinfluencer'
            },
            description: 'A passionate content creator sharing lifestyle, fashion, and travel experiences.',
            onboarding_completed: true
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }
    }

    return { data: { id: userId }, error: null };
  } catch (error: any) {
    console.error('Error creating test profile:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'An error occurred while creating test profile',
        status: error.status
      }
    };
  }
};

export const createTestInfluencers = async () => {
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
    {
      email: "alex.tech@test.com",
      name: "Alex Tech",
      description: "Tech reviewer and gadget enthusiast. Bringing you the latest in technology and honest reviews.",
      content_categories: ["Technology", "Gaming", "Reviews"],
      platforms: ["youtube", "twitter"],
      follower_counts: {
        youtube: "750K+",
        twitter: "100K+"
      },
      social_links: {
        youtube: "@alextech",
        twitter: "@alextechreviews"
      }
    },
    {
      email: "sarah.fitness@test.com",
      name: "Sarah Fitness",
      description: "Certified personal trainer sharing workout tips, healthy recipes, and wellness advice.",
      content_categories: ["Fitness", "Health", "Nutrition"],
      platforms: ["instagram", "tiktok"],
      follower_counts: {
        instagram: "180K+",
        tiktok: "300K+"
      },
      social_links: {
        instagram: "@sarahfitness",
        tiktok: "@sarahfit"
      },
      onboarding_completed: true
    },
    {
      email: "mike.travel@test.com",
      name: "Mike Travel",
      description: "Adventure seeker and travel photographer. Exploring the world one country at a time.",
      content_categories: ["Travel", "Photography", "Adventure"],
      platforms: ["instagram", "youtube"],
      follower_counts: {
        instagram: "400K+",
        youtube: "200K+"
      },
      social_links: {
        instagram: "@miketravel",
        youtube: "@mikesworldtour"
      },
      onboarding_completed: true
    },
    {
      email: "chef.lisa@test.com",
      name: "Chef Lisa",
      description: "Professional chef sharing easy-to-follow recipes and cooking tips for home cooks.",
      content_categories: ["Cooking", "Food", "Recipes"],
      platforms: ["instagram", "tiktok", "youtube"],
      follower_counts: {
        instagram: "300K+",
        tiktok: "800K+",
        youtube: "150K+"
      },
      social_links: {
        instagram: "@cheflisa",
        tiktok: "@lisacooks",
        youtube: "@cheflisakitchen"
      },
      onboarding_completed: true
    },
    {
      email: "david.gaming@test.com",
      name: "David Gaming",
      description: "Professional gamer and streamer. Daily gaming content and entertainment.",
      content_categories: ["Gaming", "Entertainment", "Streaming"],
      platforms: ["youtube", "twitter"],
      follower_counts: {
        youtube: "1M+",
        twitter: "250K+"
      },
      social_links: {
        youtube: "@davidgaming",
        twitter: "@davidplays"
      },
      onboarding_completed: true
    },
    {
      email: "nina.art@test.com",
      name: "Nina Art",
      description: "Digital artist and illustrator sharing creative process and art tutorials.",
      content_categories: ["Art", "Design", "Education"],
      platforms: ["instagram", "youtube"],
      follower_counts: {
        instagram: "150K+",
        youtube: "200K+"
      },
      social_links: {
        instagram: "@ninaartist",
        youtube: "@ninaartchannel"
      },
      onboarding_completed: true
    },
    {
      email: "tom.comedy@test.com",
      name: "Tom Comedy",
      description: "Stand-up comedian and content creator bringing daily laughs and entertainment.",
      content_categories: ["Comedy", "Entertainment", "Skits"],
      platforms: ["tiktok", "instagram"],
      follower_counts: {
        tiktok: "2M+",
        instagram: "500K+"
      },
      social_links: {
        tiktok: "@tomcomedy",
        instagram: "@tomcomedian"
      },
      onboarding_completed: true
    },
    {
      email: "maya.beauty@test.com",
      name: "Maya Beauty",
      description: "Professional makeup artist sharing beauty tutorials and skincare tips.",
      content_categories: ["Beauty", "Makeup", "Skincare"],
      platforms: ["youtube", "instagram", "tiktok"],
      follower_counts: {
        youtube: "300K+",
        instagram: "450K+",
        tiktok: "600K+"
      },
      social_links: {
        youtube: "@mayabeauty",
        instagram: "@mayamakeup",
        tiktok: "@mayabeautytips"
      },
      onboarding_completed: true
    },
    {
      email: "jack.finance@test.com",
      name: "Jack Finance",
      description: "Financial advisor sharing investment tips and personal finance education.",
      content_categories: ["Finance", "Education", "Business"],
      platforms: ["youtube", "twitter"],
      follower_counts: {
        youtube: "400K+",
        twitter: "150K+"
      },
      social_links: {
        youtube: "@jackfinance",
        twitter: "@jackmoney"
      },
      onboarding_completed: true
    }
  ];

  try {
    for (const influencer of testInfluencers) {
      // Create auth user with admin rights
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
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
      if (!userData.user) throw new Error('No user data returned');

      // Wait a short time between creating users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create influencer profile
      const { error: profileError } = await supabase.auth.admin.updateUserById(userData.user.id, {
        user_metadata: {
          ...userData.user.user_metadata,
          description: influencer.description,
          content_categories: influencer.content_categories,
          platforms: influencer.platforms,
          follower_counts: influencer.follower_counts,
          social_links: influencer.social_links,
          onboarding_completed: true
        }
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
    }

    return { data: testInfluencers, error: null };
  } catch (error: any) {
    console.error('Error creating test influencers:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'An error occurred while creating test influencers',
        status: error.status
      }
    };
  }
};

export const createTestBusinesses = async () => {
  const testBusinesses = [
    {
      email: "tech.innovations@test.com",
      name: "Tech Innovations",
      description: "Leading technology company specializing in consumer electronics and smart home devices.",
      website: "www.techinnovations.test",
      location: "Silicon Valley, CA",
      product_categories: ["Electronics", "Smart Home", "Gadgets"],
      size: "50-200 employees",
      budget_range: "$10,000-$50,000"
    },
    {
      email: "eco.fashion@test.com",
      name: "Eco Fashion",
      description: "Sustainable fashion brand creating eco-friendly clothing and accessories.",
      website: "www.ecofashion.test",
      location: "New York, NY",
      product_categories: ["Fashion", "Accessories", "Sustainable"],
      size: "20-50 employees",
      budget_range: "$5,000-$20,000"
    },
    {
      email: "healthy.eats@test.com",
      name: "Healthy Eats",
      description: "Organic food delivery service providing fresh, healthy meals.",
      website: "www.healthyeats.test",
      location: "Los Angeles, CA",
      product_categories: ["Food & Beverage", "Health", "Delivery"],
      size: "100-500 employees",
      budget_range: "$15,000-$75,000"
    },
    {
      email: "fitness.gear@test.com",
      name: "Fitness Gear Pro",
      description: "Premium fitness equipment and sportswear manufacturer.",
      website: "www.fitnessgear.test",
      location: "Chicago, IL",
      product_categories: ["Sports", "Fitness", "Apparel"],
      size: "200-500 employees",
      budget_range: "$20,000-$100,000"
    },
    {
      email: "beauty.co@test.com",
      name: "Beauty Co",
      description: "Natural and organic beauty products for conscious consumers.",
      website: "www.beautyco.test",
      location: "Miami, FL",
      product_categories: ["Beauty", "Skincare", "Organic"],
      size: "50-200 employees",
      budget_range: "$10,000-$50,000"
    },
    {
      email: "travel.adventures@test.com",
      name: "Travel Adventures",
      description: "Adventure travel company organizing unique experiences worldwide.",
      website: "www.traveladventures.test",
      location: "Denver, CO",
      product_categories: ["Travel", "Adventure", "Tourism"],
      size: "20-50 employees",
      budget_range: "$5,000-$25,000"
    },
    {
      email: "pet.supplies@test.com",
      name: "Pet Paradise",
      description: "Premium pet supplies and accessories retailer.",
      website: "www.petparadise.test",
      location: "Seattle, WA",
      product_categories: ["Pets", "Accessories", "Food"],
      size: "100-200 employees",
      budget_range: "$8,000-$40,000"
    },
    {
      email: "home.decor@test.com",
      name: "Modern Living",
      description: "Contemporary home decor and furniture company.",
      website: "www.modernliving.test",
      location: "Austin, TX",
      product_categories: ["Home Decor", "Furniture", "Design"],
      size: "50-100 employees",
      budget_range: "$10,000-$50,000"
    },
    {
      email: "gaming.world@test.com",
      name: "Gaming World",
      description: "Gaming peripherals and accessories manufacturer.",
      website: "www.gamingworld.test",
      location: "San Francisco, CA",
      product_categories: ["Gaming", "Electronics", "Accessories"],
      size: "100-200 employees",
      budget_range: "$15,000-$75,000"
    },
    {
      email: "kids.toys@test.com",
      name: "Kids Wonder",
      description: "Educational toys and games for children.",
      website: "www.kidswonder.test",
      location: "Boston, MA",
      product_categories: ["Toys", "Education", "Games"],
      size: "20-50 employees",
      budget_range: "$5,000-$25,000"
    }
  ];

  try {
    for (const business of testBusinesses) {
      // Create auth user with admin rights
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: business.email,
        password: 'testpass123',
        email_confirm: true,
        user_metadata: {
          name: business.name,
          type: 'business'
        }
      });

      if (userError) {
        console.error('Error creating user:', userError);
        throw userError;
      }
      if (!userData.user) throw new Error('No user data returned');

      // Wait a short time between creating users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create business profile
      const { error: profileError } = await supabase.auth.admin.updateUserById(userData.user.id, {
        user_metadata: {
          ...userData.user.user_metadata,
          description: business.description,
          website_url: business.website,
          location: business.location,
          product_categories: business.product_categories,
          company_size: business.size,
          budget_range: business.budget_range,
          onboarding_completed: true
        }
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
    }

    return { data: testBusinesses, error: null };
  } catch (error: any) {
    console.error('Error creating test businesses:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'An error occurred while creating test businesses',
        status: error.status
      }
    };
  }
}; 