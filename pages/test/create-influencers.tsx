import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function CreateTestInfluencers() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCreateTestInfluencers = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setResults(null);

    try {
      const response = await fetch('/api/create-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test influencers');
      }

      setResults(data);
      setSuccess(true);
      
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
            Successfully created test influencers!
          </Alert>
        )}

        {results && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h2 className="font-semibold">Results Summary:</h2>
            <p>Total: {results.summary.total}</p>
            <p className="text-green-600">Successful: {results.summary.successful}</p>
            <p className="text-red-600">Failed: {results.summary.failed}</p>
            
            <h3 className="font-semibold mt-4">Details:</h3>
            <div className="space-y-2">
              {results.data.map((result: any, index: number) => (
                <div 
                  key={index}
                  className={`p-2 rounded ${
                    result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  <p className="font-medium">{result.name}</p>
                  {result.email && <p className="text-sm">{result.email}</p>}
                  {result.error && <p className="text-sm text-red-500">{result.error}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleCreateTestInfluencers}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Test Influencers...' : 'Create Test Influencers'}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          This will create test influencer profiles in your database and update the spreadsheet.
        </p>
      </div>
    </div>
  );
} 