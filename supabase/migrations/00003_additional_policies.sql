-- Allow public viewing of profiles (but with limited fields)
create policy "Enable read access for all users"
    on public.influencer_profiles
    for select
    to anon
    using (true);

create policy "Enable read access for all users"
    on public.business_profiles
    for select
    to anon
    using (true);

-- Campaign policies
create policy "Enable insert for businesses"
    on public.campaigns
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.business_profiles
            where id = auth.uid()
        )
    );

create policy "Enable update for businesses"
    on public.campaigns
    for update
    to authenticated
    using (business_id = auth.uid());

create policy "Enable read access for all users"
    on public.campaigns
    for select
    using (status = 'active' or business_id = auth.uid());

-- Application policies
create policy "Enable insert for influencers"
    on public.campaign_applications
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.influencer_profiles
            where id = auth.uid()
        )
    );

create policy "Enable read access for owners"
    on public.campaign_applications
    for select
    to authenticated
    using (
        influencer_id = auth.uid() or 
        exists (
            select 1 from public.campaigns
            where id = campaign_applications.campaign_id
            and business_id = auth.uid()
        )
    );

-- Message policies
create policy "Enable insert for authenticated users"
    on public.messages
    for insert
    to authenticated
    with check (sender_id = auth.uid());

create policy "Enable read access for participants"
    on public.messages
    for select
    to authenticated
    using (sender_id = auth.uid() or receiver_id = auth.uid());

-- Notification policies
create policy "Enable read access for owners"
    on public.notifications
    for select
    to authenticated
    using (user_id = auth.uid());

-- Grant additional permissions
grant usage on schema public to anon;
grant select on public.influencer_profiles to anon;
grant select on public.business_profiles to anon;
grant select on public.campaigns to anon;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema'; 