import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { useRouter } from 'next/router';

interface FormData {
  type: 'influencer' | 'business';
  email: string;
  name: string;
  description: string;
  content_categories: string[];
  platforms: string[];
  follower_counts: {
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  social_links: {
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  location: string;
  website: string;
  avatar_url: string;
}

export default function CreateCustomProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: 'influencer',
    email: '',
    name: '',
    description: '',
    content_categories: [],
    platforms: [],
    follower_counts: {
      instagram: '',
      youtube: '',
      tiktok: ''
    },
    social_links: {
      instagram: '',
      youtube: '',
      tiktok: ''
    },
    location: '',
    website: '',
    avatar_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/create-custom-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }
      
      setSuccess(true);
      
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push(`/${formData.name.toLowerCase().replace(/\s+/g, '-')}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Custom Profile</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert>
            Successfully created profile! Redirecting...
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label>Profile Type</Label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1"
            >
              <option value="influencer">Influencer</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>{formData.type === 'business' ? 'Business Name' : 'Name'}</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>{formData.type === 'business' ? 'Industry Categories' : 'Content Categories'}</Label>
            <Input
              name="content_categories"
              placeholder="Enter categories separated by commas"
              value={formData.content_categories.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content_categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
              }))}
              required
            />
          </div>

          {formData.type === 'influencer' && (
            <>
              <div>
                <Label>Platforms</Label>
                <Input
                  name="platforms"
                  placeholder="Enter platforms separated by commas"
                  value={formData.platforms.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    platforms: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                  }))}
                  required
                />
              </div>

              <div>
                <Label>Instagram Followers</Label>
                <Input
                  name="follower_counts.instagram"
                  placeholder="e.g., 100K+"
                  value={formData.follower_counts.instagram}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    follower_counts: {
                      ...prev.follower_counts,
                      instagram: e.target.value
                    }
                  }))}
                />
              </div>

              <div>
                <Label>Instagram Handle</Label>
                <Input
                  name="social_links.instagram"
                  placeholder="@username"
                  value={formData.social_links.instagram}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: {
                      ...prev.social_links,
                      instagram: e.target.value
                    }
                  }))}
                />
              </div>
            </>
          )}

          <div>
            <Label>Location</Label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Avatar URL</Label>
            <Input
              name="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </Button>
      </form>
    </div>
  );
} 