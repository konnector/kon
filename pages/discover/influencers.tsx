import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Instagram, Twitter, TwitterIcon as TikTok, YoutubeIcon as YouTube, Search, Filter, UserCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"

interface Influencer {
  id: string
  name: string
  image_url?: string
  media_url?: string
  media_type?: 'image' | 'video'
  description?: string
  content_categories: string[]
  follower_counts: Record<string, string>
  platforms: string[]
  social_links: Record<string, string>
}

export default function DiscoverInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInfluencers()
  }, [])

  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('onboarding_completed', true)

      if (error) throw error

      setInfluencers(data || [])
    } catch (err: any) {
      console.error('Error fetching influencers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.content_categories.some(category => 
      category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discover Influencers</h1>
      
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search influencers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredInfluencers.map((influencer) => (
          <Card key={influencer.id} className="overflow-hidden">
            <div className="relative w-full h-40">
              {influencer.media_url ? (
                influencer.media_type === 'video' ? (
                  <video 
                    src={influencer.media_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <Image
                    src={influencer.media_url}
                    alt={`${influencer.name} media`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw, 25vw"
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <UserCircle2 className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={influencer.image_url} alt={influencer.name} />
                  <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{influencer.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {influencer.content_categories.join(", ")}
                  </p>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs line-clamp-2">{influencer.description}</p>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-semibold mb-1.5">Platforms & Followers</h4>
                <div className="flex flex-wrap gap-2">
                  {influencer.platforms.map((platform) => (
                    <div key={platform} className="flex items-center text-xs text-muted-foreground">
                      {platform === 'instagram' && <Instagram className="h-3.5 w-3.5 mr-1" />}
                      {platform === 'twitter' && <Twitter className="h-3.5 w-3.5 mr-1" />}
                      {platform === 'tiktok' && <TikTok className="h-3.5 w-3.5 mr-1" />}
                      {platform === 'youtube' && <YouTube className="h-3.5 w-3.5 mr-1" />}
                      {influencer.follower_counts[platform]}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Message
              </Button>
              <Button size="sm" className="flex-1 h-8 text-xs">
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Send Offer
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredInfluencers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No influencers found matching your search.</p>
        </div>
      )}
    </div>
  )
} 