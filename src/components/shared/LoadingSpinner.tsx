import React from 'react';
import { useT } from '@/lib/i18n';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ 
  message, 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) => {
  const t = useT();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;