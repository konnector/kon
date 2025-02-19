export type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn';
export type FollowerRange = '0-10000' | '10000-100000' | '100000+';
export type RevenueRange = '0-10000' | '10000-100000' | '100000+';
export type ContentCategory =
  | 'Makeup'
  | 'Beauty'
  | 'Fitness'
  | 'Education'
  | 'Business'
  | 'Technology'
  | 'Fashion'
  | 'Food'
  | 'Travel'
  | 'Lifestyle'
  | 'Gaming'
  | 'Entertainment';

export interface InfluencerProfile {
  name: string;
  platforms: Platform[];
  followerCounts: Partial<Record<Platform, FollowerRange>>;
  contentCategories: ContentCategory[];
}

export interface BusinessProfile {
  businessName: string;
  websiteUrl: string;
  socialMediaLinks?: Partial<Record<Platform, string>>;
  estimatedRevenue?: RevenueRange;
  productCategories: string[];
}

export type UserType = 'influencer' | 'business'; 