import { format } from 'date-fns';
import Image from 'next/image';

interface Activity {
  id: string;
  type: 'message' | 'offer' | 'collaboration' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="p-6">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10">
                  <Image
                    className="rounded-full"
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    fill
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user.name}
                </p>
                <p className="text-sm text-gray-500">{activity.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {activity.description}
                </p>
              </div>
              <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 