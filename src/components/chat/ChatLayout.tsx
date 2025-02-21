import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { ChatWindow } from './ChatWindow';
import { ConversationList } from './ConversationList';
import { motion } from 'framer-motion';

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

export function ChatLayout() {
  const [mounted, setMounted] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:sender_id(
            id,
            influencer_profiles!sender_id(name, avatar_url),
            business_profiles!sender_id(business_name, avatar_url)
          ),
          receiver:receiver_id(
            id,
            influencer_profiles!receiver_id(name, avatar_url),
            business_profiles!receiver_id(business_name, avatar_url)
          )
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process messages into conversations
      const conversationsMap = new Map();
      messages?.forEach((message: any) => {
        const otherUser = message.sender_id === user?.id ? message.receiver : message.sender;
        const userId = otherUser.id;
        
        if (!conversationsMap.has(userId)) {
          const profile = otherUser.influencer_profiles || otherUser.business_profiles;
          conversationsMap.set(userId, {
            id: userId,
            user: {
              id: userId,
              name: profile?.name || profile?.business_name,
              avatar_url: profile?.avatar_url
            },
            lastMessage: {
              content: message.content,
              created_at: message.created_at
            },
            unreadCount: message.sender_id !== user?.id && !message.read ? 1 : 0
          });
        } else if (message.sender_id !== user?.id && !message.read) {
          const conv = conversationsMap.get(userId);
          conv.unreadCount += 1;
        }
      });

      setConversations(Array.from(conversationsMap.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleConversationSelect = (userId: string) => {
    setSelectedConversation(userId);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="w-80 border-r border-gray-100">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation}
          onSelect={handleConversationSelect}
          loading={loading}
        />
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            key={selectedConversation}
            receiverId={selectedConversation}
            onMessageSent={fetchConversations}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
} 