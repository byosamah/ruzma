import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconContainerProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const IconContainer = ({
  icon: Icon,
  size = 'md',
  variant = 'muted',
  className
}: IconContainerProps) => {
  const sizeClasses = {
    sm: 'icon-container-sm',
    md: 'icon-container',
    lg: 'icon-container-lg'
  };

  const variantClasses = {
    primary: 'surface-primary',
    secondary: 'surface-secondary',
    muted: 'surface-muted',
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error',
    info: 'status-info'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn(sizeClasses[size], variantClasses[variant], className)}>
      <Icon className={iconSizes[size]} />
    </div>
  );
};