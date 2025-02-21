-- Add avatar_url column to influencer_profiles
ALTER TABLE public.influencer_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS follower_counts JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Add avatar_url column to business_profiles
ALTER TABLE public.business_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false; 