import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, Cog6ToothIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TopNavProps {
  isCollapsed: boolean;
}

export function TopNav({ isCollapsed }: TopNavProps) {
  const user = useUser();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <motion.div
      initial={{ left: "72px" }}
      animate={{ 
        left: isCollapsed ? "72px" : "256px"
      }}
      transition={{ duration: 0.2 }}
      className="h-16 bg-white fixed top-0 right-0 z-10"
    >
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800">Hey, User</h2>
            <span className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="ml-auto max-w-xl w-full">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Start searching here..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-8">
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <BellIcon className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-1 w-80 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>
                <div className="px-4 py-2 text-sm text-gray-700">
                  No new notifications
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2">
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 rounded-lg bg-black overflow-hidden flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-1 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/dashboard/profile"
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      Your Profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/dashboard/settings"
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'block w-full text-left px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </motion.div>
  );
} 