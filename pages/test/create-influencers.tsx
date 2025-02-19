import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Alert } from '@/components/ui/alert';

export default function CreateTestInfluencers() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateTestInfluencers = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/create-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test influencers');
      }
      
      setSuccess(true);
      
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/discover/influencers');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Test Influencers</h1>
      
      <div className="max-w-md mx-auto space-y-4">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert>
            Successfully created test influencers! Redirecting...
          </Alert>
        )}
        
        <Button 
          onClick={handleCreateTestInfluencers}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Test Influencers...' : 'Create 10 Test Influencers'}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          This will create 10 test influencer profiles in your database.
        </p>
      </div>
    </div>
  );
} 