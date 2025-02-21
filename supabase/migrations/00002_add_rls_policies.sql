-- First, enable RLS
alter table public.influencer_profiles enable row level security;
alter table public.business_profiles enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view their own influencer profile" on public.influencer_profiles;
drop policy if exists "Users can create their own influencer profile" on public.influencer_profiles;
drop policy if exists "Users can update their own influencer profile" on public.influencer_profiles;
drop policy if exists "Users can view their own business profile" on public.business_profiles;
drop policy if exists "Users can create their own business profile" on public.business_profiles;
drop policy if exists "Users can update their own business profile" on public.business_profiles;
drop policy if exists "Enable insert for authenticated users only" on public.influencer_profiles;
drop policy if exists "Enable select for users based on id" on public.influencer_profiles;
drop policy if exists "Enable update for users based on id" on public.influencer_profiles;
drop policy if exists "Enable insert for authenticated users only" on public.business_profiles;
drop policy if exists "Enable select for users based on id" on public.business_profiles;
drop policy if exists "Enable update for users based on id" on public.business_profiles;

-- Influencer profile policies
create policy "Enable insert for authenticated users"
    on public.influencer_profiles
    for insert
    to authenticated
    with check (true);

create policy "Enable select for own profile"
    on public.influencer_profiles
    for select
    to authenticated
    using (true);

create policy "Enable update for own profile"
    on public.influencer_profiles
    for update
    to authenticated
    using (auth.uid() = id);

-- Business profile policies
create policy "Enable insert for authenticated users"
    on public.business_profiles
    for insert
    to authenticated
    with check (true);

create policy "Enable select for own profile"
    on public.business_profiles
    for select
    to authenticated
    using (true);

create policy "Enable update for own profile"
    on public.business_profiles
    for update
    to authenticated
    using (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.influencer_profiles to authenticated;
grant all on public.business_profiles to authenticated;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema'; 