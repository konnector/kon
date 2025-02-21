-- RLS Policies for influencer_profiles
create policy "Public profiles are viewable by everyone"
    on public.influencer_profiles for select
    using (true);

create policy "Users can insert their own profile"
    on public.influencer_profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.influencer_profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- RLS Policies for business_profiles
create policy "Public profiles are viewable by everyone"
    on public.business_profiles for select
    using (true);

create policy "Users can insert their own profile"
    on public.business_profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.business_profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- RLS Policies for campaigns
create policy "Campaigns are viewable by everyone"
    on public.campaigns for select
    using (true);

create policy "Businesses can create campaigns"
    on public.campaigns for insert
    with check (
        exists (
            select 1 from public.business_profiles
            where id = auth.uid()
        )
    );

create policy "Businesses can update own campaigns"
    on public.campaigns for update
    using (
        business_id = auth.uid()
    );

create policy "Businesses can delete own campaigns"
    on public.campaigns for delete
    using (
        business_id = auth.uid()
    );

-- RLS Policies for campaign_applications
create policy "Applications are viewable by involved parties"
    on public.campaign_applications for select
    using (
        auth.uid() = influencer_id or
        exists (
            select 1 from public.campaigns
            where id = campaign_id and business_id = auth.uid()
        )
    );

create policy "Influencers can create applications"
    on public.campaign_applications for insert
    with check (
        auth.uid() = influencer_id and
        exists (
            select 1 from public.influencer_profiles
            where id = auth.uid()
        )
    );

create policy "Influencers can update own applications"
    on public.campaign_applications for update
    using (
        auth.uid() = influencer_id
    );

-- RLS Policies for collaborations
create policy "Collaborations are viewable by involved parties"
    on public.collaborations for select
    using (
        auth.uid() = influencer_id or
        exists (
            select 1 from public.campaigns
            where id = campaign_id and business_id = auth.uid()
        )
    );

create policy "Only businesses can create collaborations"
    on public.collaborations for insert
    with check (
        exists (
            select 1 from public.campaigns
            where id = campaign_id and business_id = auth.uid()
        )
    );

create policy "Involved parties can update collaborations"
    on public.collaborations for update
    using (
        auth.uid() = influencer_id or
        exists (
            select 1 from public.campaigns
            where id = campaign_id and business_id = auth.uid()
        )
    );

-- RLS Policies for messages
create policy "Users can view their own messages"
    on public.messages for select
    using (
        auth.uid() = sender_id or
        auth.uid() = receiver_id
    );

create policy "Users can send messages"
    on public.messages for insert
    with check (
        auth.uid() = sender_id
    );

create policy "Users can update their own messages"
    on public.messages for update
    using (
        auth.uid() = sender_id
    );

-- RLS Policies for notifications
create policy "Users can view own notifications"
    on public.notifications for select
    using (
        auth.uid() = user_id
    );

create policy "System can create notifications"
    on public.notifications for insert
    with check (true);

create policy "Users can update own notifications"
    on public.notifications for update
    using (
        auth.uid() = user_id
    );

-- RLS Policies for reviews
create policy "Reviews are viewable by everyone"
    on public.reviews for select
    using (true);

create policy "Users can create reviews for their collaborations"
    on public.reviews for insert
    with check (
        exists (
            select 1 from public.collaborations
            where id = collaboration_id and
            (
                auth.uid() = influencer_id or
                exists (
                    select 1 from public.campaigns
                    where id = campaign_id and business_id = auth.uid()
                )
            )
        )
    );

create policy "Users can update own reviews"
    on public.reviews for update
    using (
        auth.uid() = reviewer_id
    ); 