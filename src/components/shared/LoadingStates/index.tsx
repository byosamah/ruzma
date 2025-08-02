import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Card skeleton loader
 */
export function CardSkeleton({ 
  className,
  showHeader = true,
  showFooter = false,
  lines = 3 
}: { 
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}) {
  return (
    <Card className={cn('p-6', className)}>
      {showHeader && (
        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {showFooter && (
        <div className="mt-4 flex justify-end gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      )}
    </Card>
  );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ 
  className,
  columns = 4,
  rows = 5,
  showHeader = true 
}: { 
  className?: string;
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="flex gap-4 border-b p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={cn(
                  'h-4 flex-1',
                  colIndex === 0 && 'max-w-[200px]'
                )} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton loader
 */
export function FormSkeleton({ 
  className,
  fields = 4,
  showSubmit = true 
}: { 
  className?: string;
  fields?: number;
  showSubmit?: boolean;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      
      {showSubmit && (
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  );
}

/**
 * List skeleton loader
 */
export function ListSkeleton({ 
  className,
  items = 5,
  showAvatar = false,
  showActions = false 
}: { 
  className?: string;
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          
          {showActions && <Skeleton className="h-8 w-20" />}
        </div>
      ))}
    </div>
  );
}

/**
 * Grid skeleton loader
 */
export function GridSkeleton({ 
  className,
  items = 6,
  columns = 3 
}: { 
  className?: string;
  items?: number;
  columns?: number;
}) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        `grid-cols-${columns}`,
        className
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Spinner component
 */
export function Spinner({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizes[size],
        className
      )} 
    />
  );
}

/**
 * Full page spinner
 */
export function PageSpinner({ 
  message,
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center',
        className
      )}
    >
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

/**
 * Progress bar
 */
export function ProgressBar({ 
  progress,
  className,
  showLabel = false,
  size = 'md'
}: { 
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      
      <div 
        className={cn(
          'w-full overflow-hidden rounded-full bg-secondary',
          sizes[size]
        )}
      >
        <div
          className={cn(
            'h-full bg-primary transition-all duration-300',
            sizes[size]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Shimmer effect
 */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

/**
 * Loading states export
 */
export const LoadingStates = {
  Skeleton: ({ type, ...props }: { 
    type: 'card' | 'table' | 'form' | 'list' | 'grid';
    [key: string]: any;
  }) => {
    const components = {
      card: CardSkeleton,
      table: TableSkeleton,
      form: FormSkeleton,
      list: ListSkeleton,
      grid: GridSkeleton
    };
    
    const Component = components[type];
    return <Component {...props} />;
  },
  
  Card: CardSkeleton,
  Table: TableSkeleton,
  Form: FormSkeleton,
  List: ListSkeleton,
  Grid: GridSkeleton,
  Spinner,
  PageSpinner,
  ProgressBar,
  Shimmer
};

/**
 * Loading wrapper component
 */
export function LoadingWrapper({ 
  loading,
  children,
  fallback,
  className
}: { 
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={className}>
        {fallback || <PageSpinner />}
      </div>
    );
  }

  return <>{children}</>;
}