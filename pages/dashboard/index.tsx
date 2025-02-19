"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardIndex() {
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/")
        return
      }

      const userType = user.user_metadata?.type

      if (userType === "influencer") {
        router.push("/dashboard/influencer")
      } else if (userType === "business") {
        router.push("/dashboard/business")
      } else {
        router.push("/onboarding")
      }
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
} 