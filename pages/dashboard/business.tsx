"use client"

import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AreaChart, Card } from "@tremor/react";
import {
  BanknotesIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const mockActivities = [
  {
    id: "1",
    type: "offer" as const,
    title: "New Campaign Offer",
    description: "Fashion Brand X wants to collaborate",
    timestamp: new Date().toISOString(),
    user: {
      name: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
    },
  },
  {
    id: "2",
    type: "collaboration" as const,
    title: "Campaign Started",
    description: "Beauty Brand Y campaign is now live",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: {
      name: "Mike Wilson",
      avatar: "https://ui-avatars.com/api/?name=Mike+Wilson",
    },
  },
];

const chartdata = [
  {
    date: "Jan",
    "Active Campaigns": 10,
    "Campaign ROI": 2400,
  },
  {
    date: "Feb",
    "Active Campaigns": 12,
    "Campaign ROI": 3000,
  },
  {
    date: "Mar",
    "Active Campaigns": 15,
    "Campaign ROI": 4500,
  },
  // Add more data points as needed
];

export default function BusinessDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Active Campaigns"
            value="12"
            icon={<BriefcaseIcon className="w-6 h-6 text-blue-600" />}
            trend={{ value: 8, label: "vs last month" }}
          />
          <StatCard
            label="Total Influencers"
            value="48"
            icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
            trend={{ value: 12, label: "vs last month" }}
          />
          <StatCard
            label="Campaign ROI"
            value="$12,500"
            icon={<BanknotesIcon className="w-6 h-6 text-purple-600" />}
            trend={{ value: 15, label: "vs last month" }}
          />
          <StatCard
            label="Engagement Rate"
            value="4.8%"
            icon={<ChartBarIcon className="w-6 h-6 text-orange-600" />}
            trend={{ value: 2, label: "vs last month" }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance</h3>
            <div className="h-72">
              <AreaChart
                data={chartdata}
                index="date"
                categories={["Active Campaigns", "Campaign ROI"]}
                colors={["blue", "purple"]}
                valueFormatter={(value) => `${value}`}
              />
            </div>
          </Card>
          
          {/* Activity Feed */}
          <ActivityFeed activities={mockActivities} />
        </div>
      </div>
    </DashboardLayout>
  );
} 