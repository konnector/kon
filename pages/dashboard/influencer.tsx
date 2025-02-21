"use client"

import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AreaChart, Card } from "@tremor/react";
import {
  BanknotesIcon,
  StarIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CampaignOfferCard } from '@/components/dashboard/CampaignOfferCard';
import { useRouter } from 'next/router';

const mockActivities = [
  {
    id: "1",
    type: "offer" as const,
    title: "New Campaign Offer",
    description: "You received a new campaign offer from Tech Brand Z",
    timestamp: new Date().toISOString(),
    user: {
      name: "Tech Brand Z",
      avatar: "https://ui-avatars.com/api/?name=Tech+Brand",
    },
  },
  {
    id: "2",
    type: "payment" as const,
    title: "Payment Received",
    description: "Payment received for Fashion Campaign X",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: {
      name: "Fashion Brand X",
      avatar: "https://ui-avatars.com/api/?name=Fashion+Brand",
    },
  },
];

const chartdata = [
  {
    date: "Jan",
    "Earnings": 2400,
    "Engagement": 5.2,
  },
  {
    date: "Feb",
    "Earnings": 3200,
    "Engagement": 5.8,
  },
  {
    date: "Mar",
    "Earnings": 4100,
    "Engagement": 6.3,
  },
  // Add more data points as needed
];

export default function InfluencerDashboard() {
  const router = useRouter();

  const recentCampaigns = [
    {
      brand: "Brand 1",
      amount: "$1500",
      duration: "2 weeks duration",
      type: "Social Media Campaign"
    },
    {
      brand: "Brand 2",
      amount: "$3000",
      duration: "2 weeks duration",
      type: "Social Media Campaign"
    },
    {
      brand: "Brand 3",
      amount: "$4500",
      duration: "2 weeks duration",
      type: "Social Media Campaign"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Active Campaigns"
            value="5"
            icon={<BriefcaseIcon className="w-5 h-5" />}
            trend={{
              value: 12,
              label: "vs last month"
            }}
          />
          <StatCard
            label="Total Earnings"
            value="$8,500"
            icon={<BanknotesIcon className="w-5 h-5" />}
            trend={{
              value: 15,
              label: "vs last month"
            }}
          />
          <StatCard
            label="Average Rating"
            value="4.8"
            icon={<StarIcon className="w-5 h-5" />}
            trend={{
              value: 10.2,
              label: "vs last month"
            }}
          />
          <StatCard
            label="Engagement Rate"
            value="6.3%"
            icon={<ChartBarIcon className="w-5 h-5" />}
            trend={{
              value: 10.5,
              label: "vs last month"
            }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
            <div className="h-72">
              <AreaChart
                data={chartdata}
                index="date"
                categories={["Earnings", "Engagement"]}
                colors={["green", "purple"]}
                valueFormatter={(value) => 
                  typeof value === 'number' 
                    ? value > 100 
                      ? `$${value}` 
                      : `${value}%`
                    : value
                }
              />
            </div>
          </Card>
          
          {/* Activity Feed */}
          <ActivityFeed activities={mockActivities} />
        </div>

        {/* Recent Campaign Offers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Campaign Offers</h2>
          <div className="divide-y divide-gray-100">
            {recentCampaigns.map((campaign, index) => (
              <CampaignOfferCard
                key={index}
                brand={campaign.brand}
                amount={campaign.amount}
                duration={campaign.duration}
                type={campaign.type}
                onViewDetails={() => router.push(`/campaigns/${index}`)}
              />
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 