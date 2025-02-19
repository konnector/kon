import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client
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

// Function to generate a random email based on business name
function generateRandomEmail(businessName: string): string {
  const sanitizedName = businessName.toLowerCase().replace(/\s+/g, '.');
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${sanitizedName}.${randomString}@example.com`;
}

// Test businesses data
const testBusinesses = [
  {
    name: "Fitness Gear Pro",
    description: "Premium fitness equipment and sportswear manufacturer.",
    website: "www.fitnessgear.test",
    location: "Chicago, IL",
    industry_categories: ["Sports", "Fitness", "Apparel"],
    product_categories: ["Equipment", "Apparel", "Accessories"],
    social_media_links: {
      instagram: "@fitnessgear",
      facebook: "fitnessgear.pro"
    }
  },
  {
    name: "Beauty Co",
    description: "Natural and organic beauty products for conscious consumers.",
    website: "www.beautyco.test",
    location: "Miami, FL",
    industry_categories: ["Beauty", "Cosmetics", "Wellness"],
    product_categories: ["Skincare", "Makeup", "Hair Care"],
    social_media_links: {
      instagram: "@beautyco",
      facebook: "beautyco.official"
    }
  },
  {
    name: "Digital Learning Hub",
    description: "Online education platform providing courses in technology and business.",
    website: "www.digitallearning.test",
    location: "San Francisco, CA",
    industry_categories: ["Education", "Technology", "E-learning"],
    product_categories: ["Online Courses", "Certifications", "Training"],
    social_media_links: {
      linkedin: "digital-learning-hub",
      twitter: "@digitallearn"
    }
  },
  {
    name: "Green Earth Foods",
    description: "Sustainable and organic food products manufacturer.",
    website: "www.greenearth.test",
    location: "Portland, OR",
    industry_categories: ["Food & Beverage", "Organic", "Sustainable"],
    product_categories: ["Organic Foods", "Snacks", "Beverages"],
    social_media_links: {
      instagram: "@greenearth",
      facebook: "greenearth.foods"
    }
  },
  {
    name: "Tech Solutions Inc",
    description: "Enterprise software solutions and IT consulting services.",
    website: "www.techsolutions.test",
    location: "Boston, MA",
    industry_categories: ["Technology", "Software", "IT Services"],
    product_categories: ["Software", "Consulting", "Support Services"],
    social_media_links: {
      linkedin: "tech-solutions-inc",
      twitter: "@techsolutions"
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];
    
    for (const business of testBusinesses) {
      try {
        const email = generateRandomEmail(business.name);
        console.log(`Creating business with email: ${email}`);

        // Create auth user with admin rights
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: 'testpass123',
          email_confirm: true,
          user_metadata: {
            name: business.name,
            type: 'business',
            email: email
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

        // Create business profile
        const { error: profileError } = await supabaseAdmin
          .from('business_profiles')
          .insert([
            {
              id: userData.user.id,
              business_name: business.name,
              description: business.description,
              website: business.website,
              location: business.location,
              industry_categories: business.industry_categories,
              product_categories: business.product_categories,
              social_media_links: business.social_media_links,
              onboarding_completed: true,
              status: 'active',
              verified: true
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
            type: 'business',
            profile: {
              id: userData.user.id,
              email: email,
              business_name: business.name,
              description: business.description,
              industry_categories: business.industry_categories,
              website: business.website,
              location: business.location,
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
          name: business.name,
          success: true,
          status: 'created'
        });

      } catch (error: any) {
        console.error(`Error processing business ${business.name}:`, error);
        results.push({
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