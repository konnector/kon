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

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { receiver_id, campaign_id } = req.query;
        
        let query = supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            receiver_id,
            campaign_id,
            sender:sender_id(
              id,
              influencer_profiles!sender_id(name, avatar_url),
              business_profiles!sender_id(business_name, avatar_url)
            ),
            receiver:receiver_id(
              id,
              influencer_profiles!receiver_id(name, avatar_url),
              business_profiles!receiver_id(business_name, avatar_url)
            )
          `)
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: true });

        // Add filters if provided
        if (receiver_id) {
          query = query.eq('receiver_id', receiver_id);
        }
        if (campaign_id) {
          query = query.eq('campaign_id', campaign_id);
        }

        const { data: messages, error } = await query;

        if (error) throw error;

        return res.status(200).json(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: 'Error fetching messages' });
      }

    case 'POST':
      try {
        const { receiver_id, content, campaign_id } = req.body;

        if (!receiver_id || !content) {
          return res.status(400).json({
            error: 'Missing required fields'
          });
        }

        const { data: message, error } = await supabase
          .from('messages')
          .insert({
            sender_id: userId,
            receiver_id,
            content,
            campaign_id: campaign_id || null
          })
          .select(`
            id,
            content,
            created_at,
            sender_id,
            receiver_id,
            campaign_id,
            sender:sender_id(
              id,
              influencer_profiles!sender_id(name, avatar_url),
              business_profiles!sender_id(business_name, avatar_url)
            ),
            receiver:receiver_id(
              id,
              influencer_profiles!receiver_id(name, avatar_url),
              business_profiles!receiver_id(business_name, avatar_url)
            )
          `)
          .single();

        if (error) throw error;

        return res.status(201).json(message);
      } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Error sending message' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 