/**
 * Branded Progress Indicator Component
 * Uses dynamic brand colors for conversion-focused design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { FreelancerBranding } from '@/types/branding';
import { useBrandStyles } from '@/hooks/useBrandingSystem';
import { cn } from '@/lib/utils';

interface BrandedProgressProps {
  progress: number; // 0-100
  total?: number;
  completed?: number;
  branding?: FreelancerBranding | null;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  className?: string;
}

const BrandedProgress: React.FC<BrandedProgressProps> = ({
  progress,
  total,
  completed,
  branding,
  size = 'md',
  showStats = true,
  className
}) => {
  const styles = useBrandStyles(branding);
  
  const sizeConfig = {
    sm: {
      circle: 'w-8 h-8',
      stroke: '2',
      icon: 'w-3 h-3',
      text: 'text-xs',
      stats: 'text-xs'
    },
    md: {
      circle: 'w-12 h-12',
      stroke: '3',
      icon: 'w-4 h-4',
      text: 'text-sm',
      stats: 'text-sm'
    },
    lg: {
      circle: 'w-16 h-16',
      stroke: '4',
      icon: 'w-5 h-5',
      text: 'text-base',
      stats: 'text-base'
    }
  };
  
  const config = sizeConfig[size];
  const strokeDasharray = `${progress}, 100`;
  
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {showStats && total !== undefined && completed !== undefined && (
        <div className="text-right">
          <p className={cn('font-medium text-gray-900', config.stats)}>
            {completed}/{total} Complete
          </p>
          <p className={cn('text-gray-500', config.text)}>
            {Math.round(progress)}%
          </p>
        </div>
      )}
      
      <div className={cn('relative', config.circle)}>
        <svg className={cn(config.circle, 'transform -rotate-90')} viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          
          {/* Progress circle with brand color */}
          <motion.path
            className={branding?.primary_color ? '' : 'text-primary'}
            stroke={styles.progressStroke}
            strokeWidth={config.stroke}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 
            className={cn(
              config.icon,
              branding?.primary_color 
                ? `text-[${branding.primary_color}]`
                : 'text-primary'
            )} 
          />
        </div>
      </div>
    </div>
  );
};

export default BrandedProgress;