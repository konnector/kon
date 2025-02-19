-- Create verification status enum
create type verification_status as enum ('pending', 'approved', 'rejected');

-- Add verification status to profiles
alter table public.influencer_profiles
add column verification_status verification_status default null;

alter table public.business_profiles
add column verification_status verification_status default null;

-- Create verification requests table
create table public.verification_requests (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    user_type user_type not null,
    status verification_status not null default 'pending',
    submitted_at timestamp with time zone not null,
    reviewed_at timestamp with time zone,
    reviewer_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index idx_verification_requests_user_id on public.verification_requests(user_id);
create index idx_verification_requests_status on public.verification_requests(status);

-- Add RLS policies
alter table public.verification_requests enable row level security;

create policy "Users can view their own verification requests"
    on public.verification_requests for select
    using (auth.uid() = user_id);

create policy "Users can create their own verification requests"
    on public.verification_requests for insert
    with check (auth.uid() = user_id);

-- Add trigger for updated_at
create trigger handle_updated_at
    before update on public.verification_requests
    for each row
    execute function public.handle_updated_at();

-- Create function to check verification status
create or replace function public.check_verification_status(p_user_id uuid)
returns verification_status as $$
declare
    v_user_type user_type;
    v_status verification_status;
begin
    -- Get user type
    select public.get_user_type(p_user_id) into v_user_type;
    
    -- Get verification status based on user type
    if v_user_type = 'influencer' then
        select verification_status into v_status
        from public.influencer_profiles
        where id = p_user_id;
    elsif v_user_type = 'business' then
        select verification_status into v_status
        from public.business_profiles
        where id = p_user_id;
    end if;
    
    return v_status;
end;
$$ language plpgsql security definer;

-- Create function to update verification status
create or replace function public.update_verification_status(
    p_user_id uuid,
    p_status verification_status,
    p_reviewer_notes text default null
)
returns void as $$
declare
    v_user_type user_type;
begin
    -- Get user type
    select public.get_user_type(p_user_id) into v_user_type;
    
    -- Update verification request
    update public.verification_requests
    set status = p_status,
        reviewer_notes = p_reviewer_notes,
        reviewed_at = now(),
        updated_at = now()
    where user_id = p_user_id
    and status = 'pending';
    
    -- Update profile verification status
    if v_user_type = 'influencer' then
        update public.influencer_profiles
        set verification_status = p_status,
            updated_at = now()
        where id = p_user_id;
    elsif v_user_type = 'business' then
        update public.business_profiles
        set verification_status = p_status,
            updated_at = now()
        where id = p_user_id;
    end if;
end;
$$ language plpgsql security definer; 