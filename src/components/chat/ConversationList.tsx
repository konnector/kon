import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  lastMessage: {
    content: string;
    created_at: string;
  };
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (userId: string) => void;
  loading: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading
}: ConversationListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'h:mm a');
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (messageDate.getFullYear() === today.getFullYear()) {
      return format(messageDate, 'MMM d');
    } else {
      return format(messageDate, 'MM/dd/yy');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full p-4 flex items-start space-x-4 hover:bg-gray-50 transition-colors text-left",
                  selectedId === conversation.id && "bg-blue-50 hover:bg-blue-50"
                )}
              >
                <div className="relative">
                  {conversation.user.avatar_url ? (
                    <img
                      src={conversation.user.avatar_url}
                      alt={conversation.user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {conversation.user.name[0]}
                      </span>
                    </div>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(conversation.lastMessage.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.content}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 