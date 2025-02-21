-- Drop existing tables in reverse order of dependencies
drop table if exists public.reviews cascade;
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.collaborations cascade;
drop table if exists public.campaign_applications cascade;
drop table if exists public.campaigns cascade;
drop table if exists public.business_profiles cascade;
drop table if exists public.influencer_profiles cascade;

-- Drop existing types
drop type if exists payment_status cascade;
drop type if exists campaign_status cascade;
drop type if exists user_type cascade;

-- Drop existing functions
drop function if exists public.handle_updated_at() cascade; 