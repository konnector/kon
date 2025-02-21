import { useState, useEffect, useRef } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Profile {
  name?: string;
  business_name?: string;
  avatar_url: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender: {
    id: string;
    influencer_profiles?: Profile;
    business_profiles?: Profile;
  };
}

interface ChatWindowProps {
  receiverId: string;
  onMessageSent?: () => void;
}

export function ChatWindow({ receiverId, onMessageSent }: ChatWindowProps) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [receiverProfile, setReceiverProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (receiverId) {
      fetchMessages();
      fetchReceiverProfile();
      subscribeToMessages();
    }
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [receiverId]);

  const subscribeToMessages = () => {
    channelRef.current = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${receiverId},receiver_id=eq.${user?.id}`
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();
  };

  const fetchReceiverProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .rpc('get_user_profile', {
          p_user_id: receiverId
        });

      if (error) throw error;
      setReceiverProfile(profile);
    } catch (error) {
      console.error('Error fetching receiver profile:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
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
          )
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our Message type
      const transformedMessages = (data || []).map((msg: any) => ({
        ...msg,
        sender: {
          id: msg.sender.id,
          influencer_profiles: msg.sender.influencer_profiles?.[0],
          business_profiles: msg.sender.business_profiles?.[0]
        }
      }));

      setMessages(transformedMessages);
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user?.id,
          receiver_id: receiverId
        });

      if (error) throw error;

      setNewMessage('');
      onMessageSent?.();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: string) => {
    if (!mounted) return ''; // Return empty string during SSR
    
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'h:mm a');
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${format(messageDate, 'h:mm a')}`;
    } else {
      return format(messageDate, 'MMM d, h:mm a');
    }
  };

  if (!mounted) {
    return null; // Return null during SSR
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const receiverName = receiverProfile?.profile?.name || 
                      receiverProfile?.profile?.business_name || 
                      'User';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
        <div className="relative">
          {receiverProfile?.profile?.avatar_url ? (
            <img
              src={receiverProfile.profile.avatar_url}
              alt={receiverName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {receiverName[0]}
              </span>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{receiverName}</h3>
          <p className="text-sm text-gray-500">
            {receiverProfile?.type === 'influencer' ? 'Influencer' : 'Business'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isSender = message.sender_id === user?.id;
            const profile = message.sender.influencer_profiles || message.sender.business_profiles;
            const displayName = profile?.name || profile?.business_name || 'User';
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-start space-x-2 ${isSender ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className="flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {displayName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`max-w-[70%] ${isSender ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2`}>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 