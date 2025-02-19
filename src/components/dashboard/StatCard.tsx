import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-xl border border-gray-100", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-black/5 rounded-lg">
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-600">{label}</span>
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.value >= 0 
              ? "bg-green-50 text-green-600" 
              : "bg-red-50 text-red-600"
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
      </div>
    </div>
  );
} 