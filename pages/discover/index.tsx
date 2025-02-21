import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Platform, ContentCategory } from '@/types/onboarding';

interface Match {
  profile: any;
  score: number;
  matchReasons: string[];
}

export default function DiscoverPage() {
  const user = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all');

  useEffect(() => {
    if (!user) return;

    async function fetchMatches() {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        const response = await fetch(
          `/api/discover/matches?userId=${user.id}&userType=business`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();
        setMatches(data.matches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [user]);

  const filteredMatches = matches.filter((match) => {
    if (match.score < minScore) return false;
    if (selectedPlatform !== 'all' && !match.profile.platforms?.includes(selectedPlatform)) return false;
    if (selectedCategory !== 'all' && !match.profile.contentCategories?.includes(selectedCategory)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Discover Perfect Matches</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Match Score</label>
          <Slider
            value={[minScore]}
            onValueChange={([value]) => setMinScore(value)}
            max={1}
            step={0.1}
            className="w-full"
          />
          <div className="text-sm text-gray-500 mt-1">{Math.round(minScore * 100)}%</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <Select
            value={selectedPlatform}
            onValueChange={(value: Platform | 'all') => setSelectedPlatform(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Select
            value={selectedCategory}
            onValueChange={(value: ContentCategory | 'all') => setSelectedCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Makeup">Makeup</SelectItem>
              <SelectItem value="Beauty">Beauty</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Fashion">Fashion</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Travel">Travel</SelectItem>
              <SelectItem value="Lifestyle">Lifestyle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{match.profile.name}</h3>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(match.score * 100)}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.profile.platforms?.map((platform: Platform) => (
                      <span
                        key={platform}
                        className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Match Reasons</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {match.matchReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No matches found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
} 