import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { decode } from 'base64-arraybuffer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
    case 'POST':
      try {
        const { image } = req.body;

        if (!image) {
          return res.status(400).json({
            error: 'No image provided'
          });
        }

        // Extract the base64 data and file type
        const [fileType, base64Data] = image.split(';base64,');
        const contentType = fileType.replace('data:', '');
        const fileExt = contentType.split('/')[1];
        
        // Generate a unique filename
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

        // Upload the image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, decode(base64Data), {
            contentType,
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        // Get user type
        const { data: profile } = await supabase
          .rpc('get_user_profile', {
            p_user_id: session.user.id
          });

        if (!profile) {
          return res.status(404).json({
            error: 'Profile not found'
          });
        }

        // Update the profile with the new avatar URL
        const table = profile.type === 'influencer' ? 'influencer_profiles' : 'business_profiles';
        const { error: updateError } = await supabase
          .from(table)
          .update({ avatar_url: publicUrl })
          .eq('id', session.user.id);

        if (updateError) throw updateError;

        return res.status(200).json({ avatar_url: publicUrl });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        return res.status(500).json({ error: 'Error uploading avatar' });
      }

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 