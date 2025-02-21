import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MessagesPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full">
        <ChatLayout />
      </div>
    </DashboardLayout>
  );
} 