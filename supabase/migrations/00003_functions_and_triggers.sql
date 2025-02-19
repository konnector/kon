-- Notification Functions
create or replace function public.create_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text,
    p_data jsonb default '{}'::jsonb
) returns uuid as $$
declare
    v_notification_id uuid;
begin
    insert into public.notifications (user_id, type, title, message, data)
    values (p_user_id, p_type, p_title, p_message, p_data)
    returning id into v_notification_id;
    
    return v_notification_id;
end;
$$ language plpgsql security definer;

-- Campaign Application Notification Trigger
create or replace function public.handle_campaign_application()
returns trigger as $$
begin
    -- Notify business when a new application is received
    if TG_OP = 'INSERT' then
        perform public.create_notification(
            (select business_id from public.campaigns where id = new.campaign_id),
            'new_application',
            'New Campaign Application',
            'An influencer has applied to your campaign',
            jsonb_build_object(
                'campaign_id', new.campaign_id,
                'application_id', new.id,
                'influencer_id', new.influencer_id
            )
        );
    -- Notify influencer when their application status changes
    elsif TG_OP = 'UPDATE' and old.status != new.status then
        perform public.create_notification(
            new.influencer_id,
            'application_status_change',
            'Application Status Updated',
            format('Your application status has been updated to %s', new.status),
            jsonb_build_object(
                'campaign_id', new.campaign_id,
                'application_id', new.id,
                'status', new.status
            )
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger on_campaign_application_change
    after insert or update on public.campaign_applications
    for each row
    execute function public.handle_campaign_application();

-- Collaboration Notification Trigger
create or replace function public.handle_collaboration()
returns trigger as $$
begin
    if TG_OP = 'INSERT' then
        -- Notify influencer when collaboration is created
        perform public.create_notification(
            new.influencer_id,
            'new_collaboration',
            'New Collaboration',
            'You have been selected for a campaign collaboration',
            jsonb_build_object(
                'collaboration_id', new.id,
                'campaign_id', new.campaign_id
            )
        );
    elsif TG_OP = 'UPDATE' then
        -- Notify on payment status change
        if old.payment_status != new.payment_status then
            perform public.create_notification(
                new.influencer_id,
                'payment_status_change',
                'Payment Status Updated',
                format('Payment status has been updated to %s', new.payment_status),
                jsonb_build_object(
                    'collaboration_id', new.id,
                    'payment_status', new.payment_status
                )
            );
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger on_collaboration_change
    after insert or update on public.collaborations
    for each row
    execute function public.handle_collaboration();

-- Message Notification Trigger
create or replace function public.handle_new_message()
returns trigger as $$
begin
    perform public.create_notification(
        new.receiver_id,
        'new_message',
        'New Message',
        'You have received a new message',
        jsonb_build_object(
            'message_id', new.id,
            'sender_id', new.sender_id,
            'campaign_id', new.campaign_id
        )
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_new_message
    after insert on public.messages
    for each row
    execute function public.handle_new_message();

-- Review Notification Trigger
create or replace function public.handle_new_review()
returns trigger as $$
begin
    perform public.create_notification(
        new.reviewee_id,
        'new_review',
        'New Review',
        'You have received a new review',
        jsonb_build_object(
            'review_id', new.id,
            'collaboration_id', new.collaboration_id,
            'rating', new.rating
        )
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_new_review
    after insert on public.reviews
    for each row
    execute function public.handle_new_review();

-- Utility Functions

-- Function to get user type (influencer or business)
create or replace function public.get_user_type(p_user_id uuid)
returns user_type as $$
begin
    if exists (select 1 from public.influencer_profiles where id = p_user_id) then
        return 'influencer'::user_type;
    elsif exists (select 1 from public.business_profiles where id = p_user_id) then
        return 'business'::user_type;
    else
        return null;
    end if;
end;
$$ language plpgsql security definer;

-- Function to get user profile data
create or replace function public.get_user_profile(p_user_id uuid)
returns jsonb as $$
declare
    v_user_type user_type;
    v_profile jsonb;
begin
    v_user_type := public.get_user_type(p_user_id);
    
    if v_user_type = 'influencer' then
        select jsonb_build_object(
            'type', v_user_type,
            'profile', row_to_json(p.*)
        ) into v_profile
        from public.influencer_profiles p
        where p.id = p_user_id;
    elsif v_user_type = 'business' then
        select jsonb_build_object(
            'type', v_user_type,
            'profile', row_to_json(p.*)
        ) into v_profile
        from public.business_profiles p
        where p.id = p_user_id;
    end if;
    
    return v_profile;
end;
$$ language plpgsql security definer;

-- Function to get campaign statistics
create or replace function public.get_campaign_stats(p_campaign_id uuid)
returns jsonb as $$
declare
    v_stats jsonb;
begin
    select jsonb_build_object(
        'total_applications', count(distinct a.id),
        'total_collaborations', count(distinct c.id),
        'total_completed', count(distinct c.id) filter (where c.deliverables_status->>'status' = 'completed'),
        'average_rating', coalesce(avg(r.rating) filter (where r.rating is not null), 0)
    ) into v_stats
    from public.campaigns cam
    left join public.campaign_applications a on a.campaign_id = cam.id
    left join public.collaborations c on c.campaign_id = cam.id
    left join public.reviews r on r.collaboration_id = c.id
    where cam.id = p_campaign_id;
    
    return v_stats;
end;
$$ language plpgsql security definer; 