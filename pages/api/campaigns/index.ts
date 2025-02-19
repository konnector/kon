import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        let query = supabase
          .from('campaigns')
          .select(`
            *,
            business:business_id (
              id,
              business_name,
              avatar_url,
              verified
            ),
            applications:campaign_applications (count),
            collaborations:collaborations (count)
          `);

        // Add filters if provided
        const {
          category,
          platform,
          min_budget,
          max_budget,
          status,
          search
        } = req.query;

        if (category) {
          query = query.contains('preferred_categories', [category]);
        }

        if (platform) {
          query = query.contains('required_platforms', [platform]);
        }

        if (min_budget) {
          query = query.gte('budget_range->>min', min_budget);
        }

        if (max_budget) {
          query = query.lte('budget_range->>max', max_budget);
        }

        if (status) {
          query = query.eq('status', status);
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Add sorting
        query = query.order('created_at', { ascending: false });

        const { data: campaigns, error } = await query;

        if (error) throw error;

        return res.status(200).json(campaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        return res.status(500).json({ error: 'Error fetching campaigns' });
      }

    case 'POST':
      try {
        // Verify user is a business
        const { data: profile, error: profileError } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          return res.status(403).json({
            error: 'Only businesses can create campaigns'
          });
        }

        const {
          title,
          description,
          requirements,
          deliverables,
          budget_range,
          target_demographics,
          preferred_categories,
          required_platforms,
          min_followers,
          start_date,
          end_date,
          media_urls
        } = req.body;

        // Validate required fields
        if (!title || !description || !budget_range || !required_platforms) {
          return res.status(400).json({
            error: 'Missing required fields'
          });
        }

        const { data: campaign, error } = await supabase
          .from('campaigns')
          .insert({
            business_id: session.user.id,
            title,
            description,
            requirements,
            deliverables,
            budget_range,
            target_demographics,
            preferred_categories,
            required_platforms,
            min_followers,
            start_date,
            end_date,
            media_urls,
            status: 'draft'
          })
          .select(`
            *,
            business:business_id (
              id,
              business_name,
              avatar_url,
              verified
            )
          `)
          .single();

        if (error) throw error;

        return res.status(201).json(campaign);
      } catch (error) {
        console.error('Error creating campaign:', error);
        return res.status(500).json({ error: 'Error creating campaign' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 