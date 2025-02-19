import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Instagram, Twitter, Youtube, TwitterIcon as TikTok, Play } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Platform } from "@/types/onboarding"

interface InfluencerProfileProps {
  profile: {
    id: string;
    name: string;
    platforms: Platform[];
    follower_counts: Record<Platform, string>;
    content_categories: string[];
    social_links: Record<Platform, string>;
    description?: string;
  }
}

export default function InfluencerProfile({ profile }: InfluencerProfileProps) {
  const platformIcons = {
    Instagram,
    Twitter,
    YouTube: Youtube,
    TikTok,
    LinkedIn: Twitter
  };

  const platformColors = {
    Instagram: "text-pink-500",
    Twitter: "text-blue-400",
    YouTube: "text-red-500",
    TikTok: "text-black",
    LinkedIn: "text-blue-700"
  };

  const recentPosts = [
    {
      type: "Instagram",
      image: "/images/content/instagram-1.jpg",
      caption: "Enjoying a beautiful sunset in Bali! 📸 #TravelLife",
      likes: "2.3K",
      date: "2h ago"
    },
    {
      type: "YouTube",
      image: `https://img.youtube.com/vi/Nc3vIuPyQQ0/maxresdefault.jpg`,
      title: "10 Easy Summer Outfit Ideas",
      views: "45K",
      date: "1 day ago",
      videoId: "Nc3vIuPyQQ0"
    },
    {
      type: "TikTok",
      image: "/images/content/tiktok-1.jpg",
      title: "Quick Healthy Breakfast Hack",
      views: "120K",
      date: "3h ago",
      videoId: "6jRh2PRa1tQ"
    }
  ];

  const contentHighlights = [
    {
      type: "Latest Blog Post",
      title: "10 Must-Visit Hidden Gems in Southeast Asia",
      date: "2 days ago",
      link: "#"
    },
    {
      type: "Featured Video",
      title: "Spring Fashion Lookbook 2024",
      views: "128K",
      link: "#"
    },
    {
      type: "Recent Collaboration",
      title: "Sustainable Fashion Collection with EcoStyle",
      date: "1 week ago",
      link: "#"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-500"></div>
        <CardContent className="relative pt-16">
          <Avatar className="absolute -top-16 left-4 h-32 w-32 border-4 border-white">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt={profile.name} />
            <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">
                @{profile.social_links[profile.platforms[0]]?.split('/').pop() || 'username'}
              </p>
            </div>
            <Button>Follow</Button>
          </div>
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">Bio</h2>
            <p className="text-muted-foreground">
              {profile.description || "No bio available"}
            </p>
          </div>
          <SocialMediaStats 
            platforms={profile.platforms}
            followerCounts={profile.follower_counts}
            platformIcons={platformIcons}
            platformColors={platformColors}
          />
          <RecentContent posts={recentPosts} />
          <ContentHighlights highlights={contentHighlights} />
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Contact for Collaborations</h2>
            <ContactForm influencerName={profile.name} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface SocialMediaStatsProps {
  platforms: Platform[];
  followerCounts: Record<Platform, string>;
  platformIcons: Record<string, any>;
  platformColors: Record<string, string>;
}

function SocialMediaStats({ platforms, followerCounts, platformIcons, platformColors }: SocialMediaStatsProps) {
  const stats = [
    { platform: "Instagram", followers: "500K", icon: Instagram, color: "text-pink-500" },
    { platform: "Twitter", followers: "250K", icon: Twitter, color: "text-blue-400" },
    { platform: "YouTube", followers: "1M", icon: Youtube, color: "text-red-500" },
    { platform: "TikTok", followers: "2M", icon: TikTok, color: "text-black" }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Social Media</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.platform}
            className="flex flex-col p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-sm text-gray-600">{stat.platform}</span>
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.followers}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentContent({ posts }: { posts: any[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <div key={index} className="rounded-lg border bg-card overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title || post.caption}
                layout="fill"
                objectFit="cover"
                className="transition-transform hover:scale-105"
              />
              {(post.type === "YouTube" || post.type === "TikTok") && (
                <VideoModal post={post}>
                  <button className="absolute bottom-3 right-3 rounded-lg bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white">
                    <Play className="h-5 w-5" />
                  </button>
                </VideoModal>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium line-clamp-2 mb-2">
                {post.title || post.caption}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {post.type === "Instagram" ? (
                    <Instagram className="h-4 w-4 text-pink-500" />
                  ) : post.type === "YouTube" ? (
                    <Youtube className="h-4 w-4 text-red-500" />
                  ) : (
                    <TikTok className="h-4 w-4" />
                  )}
                  {post.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoModal({
  post,
  children,
}: {
  post: { type: string; videoId: string; title: string };
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          {post.type === "YouTube" && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${post.videoId}?autoplay=1`}
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          )}
          {post.type === "TikTok" && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.tiktok.com/embed/v2/${post.videoId}`}
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ContentHighlights({ highlights }: { highlights: any[] }) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold">Content Highlights</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.type}</CardTitle>
              <Badge variant="secondary">{item.type.split(" ")[0]}</Badge>
            </CardHeader>
            <CardContent>
              <a href={item.link} className="font-semibold hover:underline">
                {item.title}
              </a>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                {item.views ? (
                  <span>{item.views} views</span>
                ) : (
                  <span>{item.date}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface ContactFormProps {
  influencerName: string;
}

function ContactForm({ influencerName }: ContactFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    category: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formState.name || !formState.email || !formState.category) {
      setError("Please fill out all required fields.")
      return
    }
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", { ...formState, influencer: influencerName })
    setIsSubmitted(true)
  }

  const categories = [
    "Beauty",
    "Tech",
    "Fitness",
    "Fashion",
    "Travel",
    "Food",
    "Lifestyle",
    "Gaming",
    "Education",
    "Other",
  ]

  if (isSubmitted) {
    return (
      <Alert className="bg-green-50">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>Your collaboration inquiry has been sent. We'll get back to you soon!</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" value={formState.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formState.email} onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" value={formState.company} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          value={formState.website}
          onChange={handleChange}
          placeholder="https://"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          name="category"
          value={formState.category}
          onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit">Send Inquiry</Button>
    </form>
  )
} 