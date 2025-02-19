import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />
      <motion.div
        initial={{ paddingLeft: "72px" }}
        animate={{ 
          paddingLeft: isCollapsed ? "72px" : "256px",
        }}
        transition={{ duration: 0.2 }}
      >
        <TopNav isCollapsed={isCollapsed} />
        <main className="pt-20 px-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  );
} 