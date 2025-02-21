import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const { id: applicationId } = req.query;

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
        const { data: application, error } = await supabase
          .from('campaign_applications')
          .select(`
            *,
            campaign:campaign_id (
              id,
              title,
              description,
              budget_range,
              required_platforms,
              business:business_id (
                id,
                business_name,
                avatar_url,
                verified
              )
            ),
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
          .eq('id', applicationId)
          .single();

        if (error) throw error;

        if (!application) {
          return res.status(404).json({
            error: 'Application not found'
          });
        }

        // Check if user is authorized to view the application
        const isBusinessOwner = application.campaign.business.id === session.user.id;
        const isApplicant = application.influencer_id === session.user.id;

        if (!isBusinessOwner && !isApplicant) {
          return res.status(403).json({
            error: 'Not authorized to view this application'
          });
        }

        return res.status(200).json(application);
      } catch (error) {
        console.error('Error fetching application:', error);
        return res.status(500).json({ error: 'Error fetching application' });
      }

    case 'PUT':
      try {
        // Get the application and campaign details
        const { data: application, error: fetchError } = await supabase
          .from('campaign_applications')
          .select(`
            *,
            campaign:campaign_id (
              business_id
            )
          `)
          .eq('id', applicationId)
          .single();

        if (fetchError || !application) {
          return res.status(404).json({
            error: 'Application not found'
          });
        }

        // Check authorization
        const isBusinessOwner = application.campaign.business_id === session.user.id;
        const isApplicant = application.influencer_id === session.user.id;

        if (!isBusinessOwner && !isApplicant) {
          return res.status(403).json({
            error: 'Not authorized to update this application'
          });
        }

        const { status } = req.body;

        // Validate status transitions
        if (isBusinessOwner) {
          // Business can only update status to accepted or rejected
          if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
              error: 'Invalid status transition'
            });
          }
        } else {
          // Influencer can only withdraw their application
          if (status !== 'withdrawn') {
            return res.status(400).json({
              error: 'Influencers can only withdraw their applications'
            });
          }
        }

        const { data: updatedApplication, error } = await supabase
          .from('campaign_applications')
          .update({ status })
          .eq('id', applicationId)
          .select(`
            *,
            campaign:campaign_id (
              id,
              title,
              business:business_id (
                id,
                business_name,
                avatar_url
              )
            ),
            influencer:influencer_id (
              id,
              name,
              avatar_url
            )
          `)
          .single();

        if (error) throw error;

        // If application is accepted, create a collaboration
        if (status === 'accepted') {
          const { error: collaborationError } = await supabase
            .from('collaborations')
            .insert({
              campaign_id: application.campaign_id,
              influencer_id: application.influencer_id,
              agreed_rate: application.proposed_rate
            });

          if (collaborationError) throw collaborationError;
        }

        return res.status(200).json(updatedApplication);
      } catch (error) {
        console.error('Error updating application:', error);
        return res.status(500).json({ error: 'Error updating application' });
      }

    case 'DELETE':
      try {
        // Only allow influencers to delete their pending applications
        const { data: application, error: fetchError } = await supabase
          .from('campaign_applications')
          .select('influencer_id, status')
          .eq('id', applicationId)
          .single();

        if (fetchError || !application) {
          return res.status(404).json({
            error: 'Application not found'
          });
        }

        if (application.influencer_id !== session.user.id) {
          return res.status(403).json({
            error: 'Not authorized to delete this application'
          });
        }

        if (application.status !== 'pending') {
          return res.status(400).json({
            error: 'Can only delete pending applications'
          });
        }

        const { error } = await supabase
          .from('campaign_applications')
          .delete()
          .eq('id', applicationId);

        if (error) throw error;

        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting application:', error);
        return res.status(500).json({ error: 'Error deleting application' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 