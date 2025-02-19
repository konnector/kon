-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Set up storage for profile images and campaign media
insert into storage.buckets (id, name) values ('avatars', 'avatars');
insert into storage.buckets (id, name) values ('campaign-media', 'campaign-media');

-- Create enum types
create type user_type as enum ('influencer', 'business');
create type campaign_status as enum ('draft', 'active', 'completed', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed');

-- Create tables with RLS (Row Level Security) enabled

-- Influencer profiles
create table public.influencer_profiles (
    id uuid references auth.users(id) primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    username text unique,
    avatar_url text,
    bio text,
    location text,
    website text,
    email text not null,
    phone text,
    platforms jsonb default '[]'::jsonb,
    follower_counts jsonb default '{}'::jsonb,
    content_categories text[] default array[]::text[],
    social_links jsonb default '{}'::jsonb,
    engagement_rate numeric(5,2),
    average_views integer,
    verified boolean default false,
    onboarding_completed boolean default false,
    
    constraint username_length check (char_length(username) >= 3)
);

-- Business profiles
create table public.business_profiles (
    id uuid references auth.users(id) primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_name text not null,
    username text unique,
    avatar_url text,
    description text,
    website text,
    industry text,
    location text,
    email text not null,
    phone text,
    social_media_links jsonb default '{}'::jsonb,
    product_categories text[] default array[]::text[],
    verified boolean default false,
    onboarding_completed boolean default false,
    
    constraint username_length check (char_length(username) >= 3)
);

-- Campaigns
create table public.campaigns (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_id uuid references public.business_profiles(id) not null,
    title text not null,
    description text,
    requirements text,
    deliverables jsonb,
    budget_range jsonb,
    target_demographics jsonb,
    preferred_categories text[],
    required_platforms text[],
    min_followers integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    status campaign_status default 'draft',
    is_featured boolean default false,
    media_urls text[],
    
    constraint valid_date_range check (end_date > start_date)
);

-- Campaign applications
create table public.campaign_applications (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    campaign_id uuid references public.campaigns(id) not null,
    influencer_id uuid references public.influencer_profiles(id) not null,
    proposal text,
    proposed_rate numeric(10,2),
    status text default 'pending',
    
    unique(campaign_id, influencer_id)
);

-- Campaign collaborations (approved applications)
create table public.collaborations (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    campaign_id uuid references public.campaigns(id) not null,
    influencer_id uuid references public.influencer_profiles(id) not null,
    agreed_rate numeric(10,2) not null,
    payment_status payment_status default 'pending',
    deliverables_status jsonb default '{}'::jsonb,
    content_urls text[],
    metrics jsonb default '{}'::jsonb,
    
    unique(campaign_id, influencer_id)
);

-- Messages
create table public.messages (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    sender_id uuid references auth.users(id) not null,
    receiver_id uuid references auth.users(id) not null,
    campaign_id uuid references public.campaigns(id),
    content text not null,
    read boolean default false,
    
    constraint different_users check (sender_id != receiver_id)
);

-- Notifications
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) not null,
    type text not null,
    title text not null,
    message text not null,
    data jsonb default '{}'::jsonb,
    read boolean default false
);

-- Reviews
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    collaboration_id uuid references public.collaborations(id) not null,
    reviewer_id uuid references auth.users(id) not null,
    reviewee_id uuid references auth.users(id) not null,
    rating integer not null,
    comment text,
    
    constraint rating_range check (rating >= 1 and rating <= 5),
    constraint different_users check (reviewer_id != reviewee_id),
    unique(collaboration_id, reviewer_id, reviewee_id)
);

-- Create indexes for better query performance
create index idx_campaigns_business_id on public.campaigns(business_id);
create index idx_campaign_applications_campaign_id on public.campaign_applications(campaign_id);
create index idx_campaign_applications_influencer_id on public.campaign_applications(influencer_id);
create index idx_collaborations_campaign_id on public.collaborations(campaign_id);
create index idx_collaborations_influencer_id on public.collaborations(influencer_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_receiver_id on public.messages(receiver_id);
create index idx_notifications_user_id on public.notifications(user_id);

-- Enable Row Level Security (RLS)
alter table public.influencer_profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.collaborations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;

-- Create updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
    before update on public.influencer_profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.business_profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.campaigns
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.campaign_applications
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.collaborations
    for each row
    execute function public.handle_updated_at(); 