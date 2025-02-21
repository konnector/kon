import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const { id } = req.query;

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
        const { data: campaign, error } = await supabase
          .from('campaigns')
          .select(`
            *,
            business:business_id (
              id,
              business_name,
              avatar_url,
              verified
            ),
            applications:campaign_applications (
              id,
              created_at,
              proposal,
              proposed_rate,
              status,
              influencer:influencer_id (
                id,
                name,
                avatar_url,
                follower_counts,
                engagement_rate,
                verified
              )
            ),
            collaborations:collaborations (
              id,
              created_at,
              agreed_rate,
              payment_status,
              deliverables_status,
              content_urls,
              metrics,
              influencer:influencer_id (
                id,
                name,
                avatar_url,
                verified
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!campaign) {
          return res.status(404).json({
            error: 'Campaign not found'
          });
        }

        return res.status(200).json(campaign);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        return res.status(500).json({ error: 'Error fetching campaign' });
      }

    case 'PUT':
      try {
        // Verify user owns the campaign
        const { data: existingCampaign, error: fetchError } = await supabase
          .from('campaigns')
          .select('business_id')
          .eq('id', id)
          .single();

        if (fetchError || !existingCampaign) {
          return res.status(404).json({
            error: 'Campaign not found'
          });
        }

        if (existingCampaign.business_id !== session.user.id) {
          return res.status(403).json({
            error: 'Not authorized to update this campaign'
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
          media_urls,
          status
        } = req.body;

        // Validate required fields
        if (!title || !description || !budget_range || !required_platforms) {
          return res.status(400).json({
            error: 'Missing required fields'
          });
        }

        const { data: campaign, error } = await supabase
          .from('campaigns')
          .update({
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
            status
          })
          .eq('id', id)
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

        return res.status(200).json(campaign);
      } catch (error) {
        console.error('Error updating campaign:', error);
        return res.status(500).json({ error: 'Error updating campaign' });
      }

    case 'DELETE':
      try {
        // Verify user owns the campaign
        const { data: existingCampaign, error: fetchError } = await supabase
          .from('campaigns')
          .select('business_id')
          .eq('id', id)
          .single();

        if (fetchError || !existingCampaign) {
          return res.status(404).json({
            error: 'Campaign not found'
          });
        }

        if (existingCampaign.business_id !== session.user.id) {
          return res.status(403).json({
            error: 'Not authorized to delete this campaign'
          });
        }

        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        return res.status(500).json({ error: 'Error deleting campaign' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 