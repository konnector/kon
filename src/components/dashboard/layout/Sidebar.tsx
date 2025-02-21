import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  InboxIcon,
  ChartBarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChartPieIcon,
  UserIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Inbox', href: '/dashboard/inbox', icon: InboxIcon },
  { name: 'Performances', href: '/dashboard/performances', icon: ChartBarIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: BriefcaseIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartPieIcon },
  { name: 'Client List', href: '/dashboard/clients', icon: UserGroupIcon },
  { name: 'Notification', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Help Center', href: '/dashboard/help', icon: QuestionMarkCircleIcon },
];

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onCollapsedChange }: SidebarProps) {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <motion.div
      initial={{ width: 72 }}
      animate={{ width: isCollapsed ? 72 : 256 }}
      onMouseEnter={() => onCollapsedChange(false)}
      onMouseLeave={() => onCollapsedChange(true)}
      className="h-screen bg-white flex flex-col fixed left-0 top-0 z-20 border-r border-gray-100"
    >
      <div className="h-16 flex items-center px-4">
        <div className="flex items-center">
          <motion.div
            initial={false}
            animate={{ 
              width: isCollapsed ? 40 : 32,
              height: isCollapsed ? 40 : 32
            }}
            className="bg-black rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white font-bold text-lg">K</span>
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-3 font-semibold text-base overflow-hidden whitespace-nowrap"
              >
                Konnect
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl transition-colors relative group",
                isActive
                  ? "bg-black/5 text-black"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 font-medium text-sm overflow-hidden whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-2 mt-auto">
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center px-3 py-2.5 rounded-xl transition-colors w-full",
            "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-3 font-medium text-sm overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
} 