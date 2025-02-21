"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart, Settings, HelpCircle, Search, MessageSquare } from "lucide-react"

const commonMenuItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Messages", icon: MessageSquare, path: "/messages" },
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Help", icon: HelpCircle, path: "/help" },
]

const influencerMenuItems = [
  { name: "My Campaigns", icon: BarChart, path: "/campaigns" },
  { name: "Find Opportunities", icon: Search, path: "/discover/businesses" },
]

const businessMenuItems = [
  { name: "Active Campaigns", icon: BarChart, path: "/campaigns" },
  { name: "Find Influencers", icon: Search, path: "/discover/influencers" },
]

interface SidebarProps {
  userType: "influencer" | "business"
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const menuItems = [...commonMenuItems, ...(userType === "influencer" ? influencerMenuItems : businessMenuItems)]

  return (
    <aside className="bg-white w-64 min-h-screen p-4 border-r">
      <div className="text-2xl font-bold mb-8 text-center">
        {userType === "influencer" ? "Influencer" : "Business"} Dashboard
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 ${
              pathname === item.path ? "bg-gray-100" : ""
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
} 