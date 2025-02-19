import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentActivitiesProps {
  userType: "influencer" | "business"
}

export function RecentActivities({ userType }: RecentActivitiesProps) {
  const activities =
    userType === "influencer"
      ? [
          { id: 1, description: "New campaign offer from Brand X", time: "2 hours ago" },
          { id: 2, description: "Completed campaign with Brand Y", time: "1 day ago" },
          { id: 3, description: "Received payment for Campaign Z", time: "3 days ago" },
        ]
      : [
          { id: 1, description: "New application from Influencer A", time: "1 hour ago" },
          { id: 2, description: "Campaign with Influencer B ended", time: "1 day ago" },
          { id: 3, description: "Started new campaign with Influencer C", time: "2 days ago" },
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex justify-between items-center">
              <span>{activity.description}</span>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
} 