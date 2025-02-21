export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
} 