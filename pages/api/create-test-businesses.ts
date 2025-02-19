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

const testBusinesses = [
  {
    email: "tech.innovations@test.com",
    name: "Tech Innovations",
    description: "Leading technology company specializing in consumer electronics and smart home devices.",
    website: "www.techinnovations.test",
    location: "Silicon Valley, CA",
    product_categories: ["Electronics", "Smart Home", "Gadgets"],
    size: "50-200 employees",
    media_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    media_type: "image"
  },
  {
    email: "eco.fashion@test.com",
    name: "Eco Fashion",
    description: "Sustainable fashion brand creating eco-friendly clothing and accessories.",
    website: "www.ecofashion.test",
    location: "New York, NY",
    product_categories: ["Fashion", "Accessories", "Sustainable"],
    size: "20-50 employees",
    media_url: "https://images.unsplash.com/photo-1581375074612-d1fd0e661aeb",
    media_type: "image"
  },
  {
    email: "healthy.eats@test.com",
    name: "Healthy Eats",
    description: "Organic food delivery service providing fresh, healthy meals.",
    website: "www.healthyeats.test",
    location: "Los Angeles, CA",
    product_categories: ["Food & Beverage", "Health", "Delivery"],
    size: "100-500 employees",
    media_url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
    media_type: "image"
  },
  {
    email: "fitness.gear@test.com",
    name: "Fitness Gear Pro",
    description: "Premium fitness equipment and sportswear manufacturer.",
    website: "www.fitnessgear.test",
    location: "Chicago, IL",
    product_categories: ["Sports", "Fitness", "Apparel"],
    size: "200-500 employees",
    media_url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f",
    media_type: "image"
  },
  {
    email: "beauty.co@test.com",
    name: "Beauty Co",
    description: "Natural and organic beauty products for conscious consumers.",
    website: "www.beautyco.test",
    location: "Miami, FL",
    product_categories: ["Beauty", "Skincare", "Organic"],
    size: "50-200 employees",
    media_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    media_type: "image"
  },
  {
    email: "travel.adventures@test.com",
    name: "Travel Adventures",
    description: "Adventure travel company organizing unique experiences worldwide.",
    website: "www.traveladventures.test",
    location: "Denver, CO",
    product_categories: ["Travel", "Adventure", "Tourism"],
    size: "20-50 employees",
    media_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
    media_type: "image"
  },
  {
    email: "pet.supplies@test.com",
    name: "Pet Paradise",
    description: "Premium pet supplies and accessories retailer.",
    website: "www.petparadise.test",
    location: "Seattle, WA",
    product_categories: ["Pets", "Accessories", "Food"],
    size: "100-200 employees",
    media_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7",
    media_type: "image"
  },
  {
    email: "home.decor@test.com",
    name: "Modern Living",
    description: "Contemporary home decor and furniture company.",
    website: "www.modernliving.test",
    location: "Austin, TX",
    product_categories: ["Home Decor", "Furniture", "Design"],
    size: "50-100 employees",
    media_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
    media_type: "image"
  },
  {
    email: "gaming.world@test.com",
    name: "Gaming World",
    description: "Gaming peripherals and accessories manufacturer.",
    website: "www.gamingworld.test",
    location: "San Francisco, CA",
    product_categories: ["Gaming", "Electronics", "Accessories"],
    size: "100-200 employees",
    media_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    media_type: "image"
  },
  {
    email: "kids.toys@test.com",
    name: "Kids Wonder",
    description: "Educational toys and games for children.",
    website: "www.kidswonder.test",
    location: "Boston, MA",
    product_categories: ["Toys", "Education", "Games"],
    size: "20-50 employees",
    media_url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088",
    media_type: "image"
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];
    
    for (const business of testBusinesses) {
      let userId;

      try {
        // Try to create the user
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: business.email,
          password: 'testpass123',
          email_confirm: true,
          user_metadata: {
            name: business.name,
            type: 'business'
          }
        });

        if (userError) {
          // If user already exists, try to get their ID from the business_profiles table
          const { data: existingProfile } = await supabaseAdmin
            .from('business_profiles')
            .select('id')
            .eq('business_name', business.name)
            .single();

          if (existingProfile) {
            userId = existingProfile.id;
            console.log(`Using existing profile for ${business.email}`);
            results.push({
              email: business.email,
              name: business.name,
              success: true,
              status: 'existing'
            });
            continue;
          } else {
            // If we can't find the profile, throw the original error
            throw userError;
          }
        } else {
          userId = userData.user.id;
          console.log(`Created new user for ${business.email}`);
        }

        // Wait a short time between operations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create business profile
        const { error: profileError } = await supabaseAdmin
          .from('business_profiles')
          .insert([
            {
              id: userId,
              business_name: business.name,
              description: business.description,
              website_url: business.website,
              location: business.location,
              product_categories: business.product_categories,
              company_size: business.size,
              media_url: business.media_url,
              media_type: business.media_type,
              onboarding_completed: true
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        results.push({
          email: business.email,
          name: business.name,
          success: true,
          status: 'created'
        });

      } catch (error: any) {
        console.error(`Error processing business ${business.email}:`, error);
        results.push({
          email: business.email,
          name: business.name,
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