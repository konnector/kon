"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, MessageSquare, Send, Heart, Building2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

// This would typically come from your authentication system
const userType: "influencer" | "business" = "influencer"

interface Business {
  id: string
  business_name: string
  description: string
  website_url: string
  location: string
  product_categories: string[]
  company_size: string
  media_url?: string
  media_type?: 'image' | 'video'
}

export default function DiscoveryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: "",
    location: "",
  })

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('onboarding_completed', true)

      if (error) throw error

      setBusinesses(data || [])
    } catch (err: any) {
      console.error('Error fetching businesses:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = businesses.filter((business) => {
    const matchesSearch =
      business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.product_categories.some(category => 
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesCategory = !filters.category || business.product_categories.includes(filters.category)
    const matchesLocation = !filters.location || business.location === filters.location

    return matchesSearch && matchesCategory && matchesLocation
  })

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]))
  }

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
      <h1 className="text-2xl font-bold mb-6">Discover Businesses</h1>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search businesses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Options</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(businesses.flatMap(b => b.product_categories))).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(businesses.map(b => b.location))).map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setFilters({ category: "", location: "" })}
              >
                Reset Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredData.map((business) => (
          <Card key={business.id} className="overflow-hidden">
            <div className="relative w-full h-48">
              {business.media_url ? (
                business.media_type === 'video' ? (
                  <video 
                    src={business.media_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <Image
                    src={business.media_url}
                    alt={`${business.business_name} media`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${favorites.includes(business.id) ? "text-red-500" : "text-gray-500"}`}
                onClick={() => toggleFavorite(business.id)}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <h3 className="font-medium text-sm">{business.business_name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{business.product_categories[0]}</p>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <span>Location: </span>
                  <span className="text-foreground">{business.location}</span>
                </p>
                <p className="text-muted-foreground">
                  <span>Campaigns: </span>
                  <span className="text-foreground">30</span>
                </p>
                <p className="text-muted-foreground">
                  <span>Budget: </span>
                  <span className="text-foreground">${business.company_size}</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button className="flex-1" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Proposal
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No businesses found matching your search.</p>
        </div>
      )}
    </div>
  )
}

function MessageDialog({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a Message</DialogTitle>
          <DialogDescription>Start a conversation with this business.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea placeholder="Type your message here..." />
        </div>
        <DialogFooter>
          <Button type="submit">Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OfferDialog({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Send Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a Proposal</DialogTitle>
          <DialogDescription>Propose a collaboration or campaign idea.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proposal-title" className="text-right">
              Title
            </Label>
            <Input id="proposal-title" className="col-span-3" placeholder="Enter proposal title" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proposal-details" className="text-right">
              Details
            </Label>
            <Textarea id="proposal-details" className="col-span-3" placeholder="Describe your proposal..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Send Proposal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 