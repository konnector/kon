"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { AnalyticsCard } from "./analytics-card"
import { QuickActions } from "./quick-actions"
import { RecentActivities } from "./recent-activities"
import { supabase } from "@/lib/supabase"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [userType, setUserType] = useState<"influencer" | "business">()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserType(user.user_metadata.type)
    }
  }

  if (!userType) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType={userType} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <AnalyticsCard
              title="Total Campaigns"
              value="12"
              change="+2.5%"
            />
            <AnalyticsCard
              title={userType === "influencer" ? "Total Earnings" : "Total Spent"}
              value="$15,231"
              change="+12.3%"
            />
            <AnalyticsCard
              title="Engagement Rate"
              value="4.3%"
              change="-0.5%"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {children}
            </div>
            <div className="space-y-6">
              <QuickActions userType={userType} />
              <RecentActivities userType={userType} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 