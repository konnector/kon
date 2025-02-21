import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const { id: campaignId } = req.query;

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
        // Check if user is authorized to view applications
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('business_id')
          .eq('id', campaignId)
          .single();

        if (campaignError || !campaign) {
          return res.status(404).json({
            error: 'Campaign not found'
          });
        }

        // Only allow business owner or applicants to view applications
        const isBusinessOwner = campaign.business_id === session.user.id;
        let query = supabase
          .from('campaign_applications')
          .select(`
            *,
            influencer:influencer_id (
              id,
              name,
              avatar_url,
              follower_counts,
              engagement_rate,
              verified,
              content_categories,
              social_links
            )
          `)
          .eq('campaign_id', campaignId);

        if (!isBusinessOwner) {
          // If not business owner, only show user's own application
          query = query.eq('influencer_id', session.user.id);
        }

        const { data: applications, error } = await query;

        if (error) throw error;

        return res.status(200).json(applications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ error: 'Error fetching applications' });
      }

    case 'POST':
      try {
        // Verify user is an influencer
        const { data: profile, error: profileError } = await supabase
          .from('influencer_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          return res.status(403).json({
            error: 'Only influencers can apply to campaigns'
          });
        }

        // Check if campaign exists and is active
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('status, business_id')
          .eq('id', campaignId)
          .single();

        if (campaignError || !campaign) {
          return res.status(404).json({
            error: 'Campaign not found'
          });
        }

        if (campaign.status !== 'active') {
          return res.status(400).json({
            error: 'Campaign is not accepting applications'
          });
        }

        if (campaign.business_id === session.user.id) {
          return res.status(400).json({
            error: 'Cannot apply to your own campaign'
          });
        }

        // Check if already applied
        const { data: existingApplication, error: applicationError } = await supabase
          .from('campaign_applications')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', session.user.id)
          .single();

        if (existingApplication) {
          return res.status(400).json({
            error: 'Already applied to this campaign'
          });
        }

        const { proposal, proposed_rate } = req.body;

        if (!proposal || !proposed_rate) {
          return res.status(400).json({
            error: 'Missing required fields'
          });
        }

        const { data: application, error } = await supabase
          .from('campaign_applications')
          .insert({
            campaign_id: campaignId,
            influencer_id: session.user.id,
            proposal,
            proposed_rate,
            status: 'pending'
          })
          .select(`
            *,
            influencer:influencer_id (
              id,
              name,
              avatar_url,
              follower_counts,
              engagement_rate,
              verified
            )
          `)
          .single();

        if (error) throw error;

        return res.status(201).json(application);
      } catch (error) {
        console.error('Error creating application:', error);
        return res.status(500).json({ error: 'Error creating application' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 