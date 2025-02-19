import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface QuickActionsProps {
  userType: "influencer" | "business"
}

export function QuickActions({ userType }: QuickActionsProps) {
  const router = useRouter()

  const actions =
    userType === "influencer"
      ? [
          { id: 1, label: "View Opportunities", onClick: () => router.push("/discover/businesses") },
          { id: 2, label: "Update Profile", onClick: () => router.push("/settings") },
          { id: 3, label: "Analyze Performance", onClick: () => router.push("/analytics") },
        ]
      : [
          { id: 1, label: "Create Campaign", onClick: () => router.push("/campaigns/new") },
          { id: 2, label: "Find Influencers", onClick: () => router.push("/discover/influencers") },
          { id: 3, label: "View Analytics", onClick: () => router.push("/analytics") },
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {actions.map((action) => (
            <Button key={action.id} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 