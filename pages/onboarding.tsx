"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Instagram, Facebook, Twitter, LinkedinIcon, Youtube } from 'lucide-react';
import type { UserType, InfluencerProfile, BusinessProfile, Platform, FollowerRange, ContentCategory } from '@/types/onboarding';
import { ProgressBar } from '@/components/ui/progress-bar';

const revenueRanges = [
  { value: "0-10000", label: "0 - $10,000" },
  { value: "10000-100000", label: "$10,000 - $100,000" },
  { value: "100000-500000", label: "$100,000 - $500,000" },
  { value: "500000+", label: "$500,000+" },
];

const productTypes = [
  {
    value: "physical",
    label: "Physical Products",
    description: "Tangible goods that can be shipped to customers",
  },
  {
    value: "digital",
    label: "Digital Products",
    description: "Software, e-books, courses, or downloadable content",
  },
  {
    value: "services",
    label: "Services",
    description: "Consulting, professional services, or subscriptions",
  },
  {
    value: "marketplace",
    label: "Marketplace",
    description: "Platform connecting buyers and sellers",
  },
];

const followerRanges = [
  { value: "0-10000", label: "0 - 10,000" },
  { value: "10000-100000", label: "10,000 - 100,000" },
  { value: "100000-500000", label: "100,000 - 500,000" },
  { value: "500000+", label: "500,000+" },
];

interface CategoryType {
  value: string;
  label: string;
  description: string;
}

const contentCategories: CategoryType[] = [
  {
    value: "beauty",
    label: "Beauty & Makeup",
    description: "Cosmetics, skincare, and beauty tutorials"
  },
  {
    value: "fashion",
    label: "Fashion",
    description: "Style tips, fashion trends, and outfit inspiration"
  },
  {
    value: "fitness",
    label: "Fitness & Health",
    description: "Workouts, nutrition, and wellness content"
  },
  {
    value: "tech",
    label: "Technology",
    description: "Tech reviews, gadgets, and digital content"
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    description: "Daily vlogs, life tips, and personal content"
  },
  {
    value: "education",
    label: "Education",
    description: "Tutorials, how-tos, and educational content"
  },
  {
    value: "gaming",
    label: "Gaming",
    description: "Gaming streams, reviews, and playthroughs"
  },
  {
    value: "food",
    label: "Food & Cooking",
    description: "Recipes, cooking tutorials, and food reviews"
  },
  {
    value: "other",
    label: "Other",
    description: "Add your own category"
  }
];

const socialPlatforms = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Youtube },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", icon: LinkedinIcon },
];

interface BusinessFormData {
  businessName: string;
  description: string;
  website: string;
  location: string;
  categories: string[];
  revenueRange: string;
  productTypes: string[];
  socialPlatforms: string[];
  socialLinks: Record<string, string>;
}

interface InfluencerFormData {
  name: string;
  bio: string;
  website: string;
  location: string;
  categories: string[];
  socialPlatforms: string[];
  socialLinks: Record<string, string>;
  followerCounts: Record<string, string>;
}

const BusinessOnboarding = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    description: '',
    website: '',
    location: '',
    categories: [],
    revenueRange: '',
    productTypes: [],
    socialPlatforms: [],
    socialLinks: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateProgress = () => {
    const fields = [
      formData.businessName,
      formData.website,
      formData.productTypes.length > 0,
      formData.description,
    ];
    const filledFields = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      return field && field.trim().length > 0;
    }).length;
    return (filledFields / fields.length) * 100;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialPlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      socialPlatforms: prev.socialPlatforms.includes(platform)
        ? prev.socialPlatforms.filter((p) => p !== platform)
        : [...prev.socialPlatforms, platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Debug: Log Supabase configuration
      console.log('Supabase Client Config:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isServer: typeof window === 'undefined'
      });

      // Create business profile
      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .upsert({
          id: user.id,
          business_name: formData.businessName,
          description: formData.description,
          product_categories: formData.categories,
          website: formData.website,
          location: formData.location,
          social_media_links: formData.socialLinks,
          email: user.email,
          onboarding_completed: true
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Update spreadsheet
      const spreadsheetResponse = await fetch('/api/update-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business',
          profile
        }),
      });

      const spreadsheetData = await spreadsheetResponse.json();
      if (!spreadsheetResponse.ok) {
        throw new Error(spreadsheetData.error || 'Failed to update spreadsheet');
      }

      // Send emails through the API endpoint
      const emailResponse = await fetch('/api/waitlist/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: formData.businessName,
          userType: 'business',
          profile
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send welcome email');
      }

      router.push('/waitlist-confirmation');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Complete Your Business Profile</h1>
            <p className="text-muted-foreground">Tell us more about your business to get started</p>
            <ProgressBar progress={calculateProgress()} className="mt-4" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Details Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="Enter your business name"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Social Media Presence</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <div
                            key={platform.value}
                            className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.socialPlatforms.includes(platform.value)
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleSocialPlatformToggle(platform.value)}
                          >
                            <Icon className="h-5 w-5 mr-2" />
                            <span className="text-sm">{platform.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Type & Revenue Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Estimated Annual Revenue (Optional)</Label>
                    <Select onValueChange={(value) => handleInputChange("revenueRange", value)} value={formData.revenueRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        {revenueRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>What type of products or services do you offer?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productTypes.map((type) => (
                        <div
                          key={type.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.productTypes.includes(type.value)
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleInputChange("productTypes", [type.value])}
                        >
                          <div className="font-medium">{type.label}</div>
                          <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Brief Description</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Tell us more about your business..."
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const InfluencerOnboarding = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<InfluencerFormData>({
    name: '',
    bio: '',
    website: '',
    location: '',
    categories: [],
    socialPlatforms: [],
    socialLinks: {},
    followerCounts: {},
  });
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateProgress = () => {
    const fields = [
      formData.name,
      formData.bio,
      formData.categories.length > 0,
      Object.keys(formData.followerCounts).length > 0,
      formData.socialPlatforms.length > 0
    ];
    const filledFields = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      return field && field.trim().length > 0;
    }).length;
    return (filledFields / fields.length) * 100;
  };

  const handleInputChange = (field: keyof InfluencerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialPlatformToggle = (platform: string) => {
    setFormData((prev) => {
      const newPlatforms = prev.socialPlatforms.includes(platform)
        ? prev.socialPlatforms.filter((p) => p !== platform)
        : [...prev.socialPlatforms, platform];

      // If platform is removed, clean up its associated data
      if (!newPlatforms.includes(platform)) {
        const { [platform]: _, ...restLinks } = prev.socialLinks;
        const { [platform]: __, ...restCounts } = prev.followerCounts;
        return {
          ...prev,
          socialPlatforms: newPlatforms,
          socialLinks: restLinks,
          followerCounts: restCounts,
        };
      }

      return {
        ...prev,
        socialPlatforms: newPlatforms,
      };
    });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value !== 'other') {
      setFormData(prev => ({
        ...prev,
        categories: [value]
      }));
      setCustomCategory('');
    }
  };

  const handleCustomCategoryAdd = () => {
    if (customCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        categories: [customCategory.trim()]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Test 1: Schema Access Test
      console.log('=== Schema Access Test ===');
      const { data: schemaTest, error: schemaError } = await supabase
        .from('influencer_profiles')
        .select('*')
        .limit(1);
      console.log('Schema Test:', {
        success: !!schemaTest,
        columnCount: schemaTest ? Object.keys(schemaTest[0] || {}).length : 0,
        error: schemaError
      });

      // Test 2: Specific Column Access Test
      console.log('=== Column Access Test ===');
      const { data: columnTest, error: columnError } = await supabase
        .from('influencer_profiles')
        .select('email')
        .limit(1);
      console.log('Column Test:', {
        success: !!columnTest,
        hasEmailColumn: columnTest ? 'email' in (columnTest[0] || {}) : false,
        error: columnError
      });

      // Test 3: RLS Policy Test
      console.log('=== RLS Policy Test ===');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('influencer_profiles')
        .select('id, email')
        .eq('id', user.id)
        .single();
      console.log('RLS Test:', {
        success: !!rlsTest,
        error: rlsError,
        userId: user.id
      });

      // Test 4: Minimal Profile Creation
      console.log('=== Minimal Profile Test ===');
      const minimalProfile = {
        id: user.id,
        name: formData.name
      };
      const { data: minTest, error: minError } = await supabase
        .from('influencer_profiles')
        .insert(minimalProfile)
        .select()
        .single();
      console.log('Minimal Profile Test:', {
        success: !!minTest,
        error: minError,
        profile: minTest
      });

      // If minimal profile succeeds, proceed with full profile
      if (minTest) {
        console.log('=== Full Profile Update ===');
        const updateData = {
          bio: formData.bio || null,
          content_categories: formData.categories,
          website: formData.website || null,
          location: formData.location || null,
          social_links: formData.socialLinks || {},
          follower_counts: formData.followerCounts || {},
          platforms: formData.socialPlatforms || [],
          onboarding_completed: true,
          email: user.email // Add email separately
        };

        const { data: updatedProfile, error: updateError } = await supabase
          .from('influencer_profiles')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update Error:', updateError);
          throw updateError;
        }

        // Update spreadsheet
        const spreadsheetResponse = await fetch('/api/update-spreadsheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'influencer',
            profile: updatedProfile
          }),
        });

        const spreadsheetData = await spreadsheetResponse.json();
        if (!spreadsheetResponse.ok) {
          throw new Error(spreadsheetData.error || 'Failed to update spreadsheet');
        }

        // Send emails through the API endpoint
        const emailResponse = await fetch('/api/waitlist/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: formData.name,
            userType: 'influencer',
            profile: updatedProfile
          }),
        });

        if (!emailResponse.ok) {
          throw new Error('Failed to send welcome email');
        }

        router.push('/waitlist-confirmation');
      } else {
        throw minError || new Error('Failed to create minimal profile');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Complete Your Influencer Profile</h1>
            <p className="text-muted-foreground">Tell us more about yourself to get started</p>
            <ProgressBar progress={calculateProgress()} className="mt-4" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Social Media Presence</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = formData.socialPlatforms.includes(platform.value);
                        return (
                          <div key={platform.value}>
                            <div
                              className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleSocialPlatformToggle(platform.value)}
                            >
                              <Icon className="h-5 w-5 mr-2" />
                              <span className="text-sm">{platform.label}</span>
                            </div>
                            {isSelected && (
                              <div className="mt-2 space-y-2">
                                <Input
                                  placeholder={`${platform.label} profile URL`}
                                  value={formData.socialLinks[platform.value] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socialLinks: {
                                      ...prev.socialLinks,
                                      [platform.value]: e.target.value
                                    }
                                  }))}
                                  className="text-sm"
                                />
                                <Select
                                  value={formData.followerCounts[platform.value]}
                                  onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    followerCounts: {
                                      ...prev.followerCounts,
                                      [platform.value]: value
                                    }
                                  }))}
                                >
                                  <SelectTrigger className="w-full text-xs">
                                    <SelectValue placeholder="Select follower range" className="text-xs" />
                                  </SelectTrigger>
                                  <SelectContent className="w-[180px]">
                                    {followerRanges.map((range) => (
                                      <SelectItem key={range.value} value={range.value} className="text-xs">
                                        {range.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Categories Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Content Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your main content category" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedCategory === 'other' && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter your category"
                          value={customCategory}
                          onChange={(e) => {
                            setCustomCategory(e.target.value);
                            if (e.target.value.trim()) {
                              handleCustomCategoryAdd();
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Show selected or custom category */}
                    {formData.categories.length > 0 && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-md">
                        <p className="text-sm text-muted-foreground">Selected Category:</p>
                        <p className="font-medium">
                          {formData.categories[0] === selectedCategory 
                            ? contentCategories.find(c => c.value === selectedCategory)?.label 
                            : formData.categories[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Brief Description (Optional)</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us more about your content and style..."
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !formData.name || formData.socialPlatforms.length === 0 || formData.categories.length === 0}
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const OnboardingPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    // Set user type based on metadata from auth
    setUserType(user.user_metadata.type as UserType);
  };

  if (!userType) return null;

  return userType === 'business' ? <BusinessOnboarding /> : <InfluencerOnboarding />;
};

export default OnboardingPage; 