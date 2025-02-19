-- Add company_size column to business_profiles
ALTER TABLE public.business_profiles
ADD COLUMN IF NOT EXISTS company_size TEXT; 