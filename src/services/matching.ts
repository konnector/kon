import { InfluencerProfile, BusinessProfile, ContentCategory, Platform, FollowerRange, RevenueRange } from '@/types/onboarding';

interface MatchScore {
  score: number;
  matchReasons: string[];
}

export class MatchingService {
  private static readonly CATEGORY_WEIGHT = 0.35;
  private static readonly PLATFORM_WEIGHT = 0.25;
  private static readonly FOLLOWER_WEIGHT = 0.20;
  private static readonly REVENUE_WEIGHT = 0.20;

  /**
   * Calculate match score between a business and an influencer
   */
  static calculateMatchScore(business: BusinessProfile, influencer: InfluencerProfile): MatchScore {
    const matchReasons: string[] = [];
    let totalScore = 0;

    // Category matching
    const categoryScore = this.calculateCategoryMatch(
      business.productCategories,
      influencer.contentCategories
    );
    if (categoryScore > 0) {
      totalScore += categoryScore * this.CATEGORY_WEIGHT;
      matchReasons.push(`${Math.round(categoryScore * 100)}% category alignment`);
    }

    // Platform presence matching
    const platformScore = this.calculatePlatformMatch(
      Object.keys(business.socialMediaLinks || {}) as Platform[],
      influencer.platforms
    );
    if (platformScore > 0) {
      totalScore += platformScore * this.PLATFORM_WEIGHT;
      matchReasons.push(`Present on ${Math.round(platformScore * 100)}% of desired platforms`);
    }

    // Follower range matching based on revenue
    const followerScore = this.calculateFollowerRevenueMatch(
      business.estimatedRevenue,
      influencer.followerCounts
    );
    if (followerScore > 0) {
      totalScore += followerScore * this.FOLLOWER_WEIGHT;
      matchReasons.push('Follower count aligns with business scale');
    }

    // Revenue impact potential
    const revenueScore = this.calculateRevenueMatch(
      business.estimatedRevenue,
      Object.values(influencer.followerCounts)[0] // Using the largest platform as indicator
    );
    if (revenueScore > 0) {
      totalScore += revenueScore * this.REVENUE_WEIGHT;
      matchReasons.push('Potential revenue impact alignment');
    }

    return {
      score: Math.round(totalScore * 100) / 100,
      matchReasons
    };
  }

  private static calculateCategoryMatch(
    businessCategories: string[],
    influencerCategories: ContentCategory[]
  ): number {
    const matchingCategories = businessCategories.filter(category =>
      influencerCategories.includes(category as ContentCategory)
    );
    return matchingCategories.length / Math.max(businessCategories.length, 1);
  }

  private static calculatePlatformMatch(
    businessPlatforms: Platform[],
    influencerPlatforms: Platform[]
  ): number {
    const matchingPlatforms = businessPlatforms.filter(platform =>
      influencerPlatforms.includes(platform)
    );
    return matchingPlatforms.length / Math.max(businessPlatforms.length, 1);
  }

  private static calculateFollowerRevenueMatch(
    revenue?: RevenueRange,
    followerCounts: Partial<Record<Platform, FollowerRange>> = {}
  ): number {
    if (!revenue) return 0;

    // Get the highest follower count across all platforms
    const maxFollowers = Object.values(followerCounts).reduce((max, range) => {
      const [, upper] = range.split('-').map(Number);
      return Math.max(max, upper || 0);
    }, 0);

    // Simple matching based on revenue and follower tiers
    switch (revenue) {
      case '0-10000':
        return maxFollowers <= 10000 ? 1 : 0.5;
      case '10000-100000':
        return maxFollowers > 10000 && maxFollowers <= 100000 ? 1 : 0.5;
      case '100000+':
        return maxFollowers > 100000 ? 1 : 0.3;
      default:
        return 0;
    }
  }

  private static calculateRevenueMatch(
    revenue?: RevenueRange,
    followerRange?: FollowerRange
  ): number {
    if (!revenue || !followerRange) return 0;

    // Simple alignment check between revenue and follower tiers
    const revenueToFollowerMap: Record<RevenueRange, FollowerRange[]> = {
      '0-10000': ['0-10000'],
      '10000-100000': ['10000-100000'],
      '100000+': ['100000+']
    };

    return revenueToFollowerMap[revenue].includes(followerRange) ? 1 : 0.5;
  }
} 