import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

export default function TestIndex() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Pages</h1>
      <div className="space-y-4">
        <Button 
          onClick={() => router.push('/test/create-influencers')}
          className="w-full"
        >
          Create Test Influencers
        </Button>
        <Button 
          onClick={() => router.push('/test/create-businesses')}
          className="w-full"
        >
          Create Test Businesses
        </Button>
      </div>
    </div>
  );
} 