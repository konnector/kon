import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ progress, showPercentage = true, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <p className="text-sm text-muted-foreground mt-2">
          Profile completion: {progress}%
        </p>
      )}
    </div>
  );
} 