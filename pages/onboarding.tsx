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

const contentCategories = [
  {
    value: "beauty",
    label: "Beauty & Makeup",
    description: "Cosmetics, skincare, and beauty tutorials",
  },
  {
    value: "fashion",
    label: "Fashion",
    description: "Style tips, fashion trends, and outfit inspiration",
  },
  {
    value: "fitness",
    label: "Fitness & Health",
    description: "Workouts, nutrition, and wellness content",
  },
  {
    value: "tech",
    label: "Technology",
    description: "Tech reviews, gadgets, and digital content",
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    description: "Daily vlogs, life tips, and personal content",
  },
  {
    value: "education",
    label: "Education",
    description: "Tutorials, how-tos, and educational content",
  },
  {
    value: "gaming",
    label: "Gaming",
    description: "Gaming streams, reviews, and playthroughs",
  },
  {
    value: "food",
    label: "Food & Cooking",
    description: "Recipes, cooking tutorials, and food reviews",
  },
];

const socialPlatforms = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Youtube },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", icon: LinkedinIcon },
];

const BusinessOnboarding = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    socialPlatforms: [] as string[],
    revenue: "",
    productType: "",
    description: "",
  });

  const calculateProgress = () => {
    const fields = [
      formData.businessName,
      formData.website,
      formData.productType,
      formData.description,
    ];
    const filledFields = fields.filter(field => field && field.trim().length > 0).length;
    const hasSocialPlatforms = formData.socialPlatforms.length > 0;
    
    // Calculate percentage (4 required fields + social platforms)
    return Math.round((filledFields + (hasSocialPlatforms ? 1 : 0)) / 5 * 100);
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
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          id: user.id,
          business_name: formData.businessName,
          website_url: formData.website,
          social_media_links: formData.socialPlatforms.reduce((acc, platform) => ({
            ...acc,
            [platform]: ""
          }), {}),
          estimated_revenue: formData.revenue as any,
          product_categories: [formData.productType],
          description: formData.description,
          onboarding_completed: true,
        });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving business profile:', error);
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
                    <Select onValueChange={(value) => handleInputChange("revenue", value)} value={formData.revenue}>
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
                            formData.productType === type.value
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleInputChange("productType", type.value)}
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
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    socialPlatforms: [] as string[],
    socialLinks: {} as Record<string, string>,
    followerCounts: {} as Record<string, string>,
    followerRange: "",
    categories: [] as string[],
  });

  const calculateProgress = () => {
    const fields = [
      formData.name,
      formData.bio,
      formData.followerRange,
    ];
    const filledFields = fields.filter(field => field && field.trim().length > 0).length;
    const hasSocialPlatforms = formData.socialPlatforms.length > 0;
    const hasCategories = formData.categories.length > 0;
    
    // Calculate percentage (3 required fields + social platforms + categories)
    return Math.round((filledFields + (hasSocialPlatforms ? 1 : 0) + (hasCategories ? 1 : 0)) / 5 * 100);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('influencer_profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          platforms: formData.socialPlatforms,
          social_links: formData.socialLinks,
          follower_counts: formData.followerCounts,
          content_categories: formData.categories,
          description: formData.bio,
          onboarding_completed: true,
        });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving influencer profile:', error);
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
                    <Label>Content Categories</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contentCategories.map((category) => (
                        <div
                          key={category.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.categories.includes(category.value)
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleCategoryToggle(category.value)}
                        >
                          <div className="font-medium">{category.label}</div>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        </div>
                      ))}
                    </div>
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
              disabled={!formData.name || formData.socialPlatforms.length === 0 || formData.categories.length === 0}
            >
              Complete Profile
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