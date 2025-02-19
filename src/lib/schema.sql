-- Drop existing tables if they exist
DROP TABLE IF EXISTS influencer_profiles CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;

-- Create table for influencer profiles
CREATE TABLE influencer_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  follower_counts JSONB NOT NULL DEFAULT '{}',
  content_categories TEXT[] NOT NULL DEFAULT '{}',
  social_links JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Create table for business profiles
CREATE TABLE business_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT,
  social_media_links JSONB NOT NULL DEFAULT '{}',
  estimated_revenue revenue_range,
  product_categories TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_influencer_profiles_updated_at
    BEFORE UPDATE ON influencer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at
    BEFORE UPDATE ON business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 