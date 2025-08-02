import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileX, 
  FolderOpen, 
  Search, 
  Users, 
  Calendar,
  DollarSign,
  AlertCircle,
  Plus,
  Upload,
  RefreshCw
} from 'lucide-react';

/**
 * Empty state props
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Base empty state component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          {icon}
        </div>
      )}
      
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * No data empty state
 */
export function NoDataState({
  message = 'No data available',
  className
}: {
  message?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<FileX className="h-12 w-12 text-muted-foreground" />}
      title={message}
      className={className}
    />
  );
}

/**
 * No results empty state
 */
export function NoResultsState({
  searchTerm,
  onClear,
  className
}: {
  searchTerm?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12 text-muted-foreground" />}
      title="No results found"
      description={
        searchTerm 
          ? `No results found for "${searchTerm}". Try adjusting your search.`
          : 'Try adjusting your filters or search terms.'
      }
      action={
        onClear 
          ? { label: 'Clear search', onClick: onClear, variant: 'outline' }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty projects state
 */
export function EmptyProjectsState({
  onCreateProject,
  className
}: {
  onCreateProject?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
      title="No projects yet"
      description="Get started by creating your first project."
      action={
        onCreateProject
          ? { 
              label: 'Create project', 
              onClick: onCreateProject,
              variant: 'default'
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty clients state
 */
export function EmptyClientsState({
  onAddClient,
  className
}: {
  onAddClient?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-muted-foreground" />}
      title="No clients yet"
      description="Add your first client to start managing projects."
      action={
        onAddClient
          ? { 
              label: 'Add client', 
              onClick: onAddClient,
              variant: 'default'
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty invoices state
 */
export function EmptyInvoicesState({
  onCreateInvoice,
  className
}: {
  onCreateInvoice?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<DollarSign className="h-12 w-12 text-muted-foreground" />}
      title="No invoices yet"
      description="Create your first invoice to start tracking payments."
      action={
        onCreateInvoice
          ? { 
              label: 'Create invoice', 
              onClick: onCreateInvoice,
              variant: 'default'
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty schedule state
 */
export function EmptyScheduleState({
  className
}: {
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
      title="No upcoming deadlines"
      description="You're all caught up! No deadlines in the near future."
      className={className}
    />
  );
}

/**
 * Error state
 */
export function ErrorState({
  error,
  onRetry,
  className
}: {
  error?: string | Error;
  onRetry?: () => void;
  className?: string;
}) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
      title="Something went wrong"
      description={errorMessage || 'An unexpected error occurred. Please try again.'}
      action={
        onRetry
          ? { 
              label: 'Try again', 
              onClick: onRetry,
              variant: 'default'
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Upload state
 */
export function UploadState({
  onUpload,
  acceptedFormats,
  maxSize,
  className
}: {
  onUpload?: () => void;
  acceptedFormats?: string[];
  maxSize?: string;
  className?: string;
}) {
  let description = 'Click to upload or drag and drop';
  
  if (acceptedFormats || maxSize) {
    const parts = [];
    if (acceptedFormats) {
      parts.push(acceptedFormats.join(', '));
    }
    if (maxSize) {
      parts.push(`Max ${maxSize}`);
    }
    description += ` (${parts.join(' • ')})`;
  }

  return (
    <EmptyState
      icon={<Upload className="h-12 w-12 text-muted-foreground" />}
      title="Upload files"
      description={description}
      action={
        onUpload
          ? { 
              label: 'Choose files', 
              onClick: onUpload,
              variant: 'default'
            }
          : undefined
      }
      className={cn('cursor-pointer transition-colors hover:border-primary', className)}
    />
  );
}

/**
 * Loading error state
 */
export function LoadingErrorState({
  onRetry,
  className
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<RefreshCw className="h-12 w-12 text-muted-foreground" />}
      title="Failed to load"
      description="There was a problem loading the data. Please try again."
      action={
        onRetry
          ? { 
              label: 'Retry', 
              onClick: onRetry,
              variant: 'default'
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Feature locked state
 */
export function FeatureLockedState({
  feature,
  onUpgrade,
  className
}: {
  feature: string;
  onUpgrade?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-warning" />}
      title="Feature locked"
      description={`${feature} is available on premium plans. Upgrade to unlock this feature.`}
      action={
        onUpgrade
          ? { 
              label: 'Upgrade plan', 
              onClick: onUpgrade,
              variant: 'default'
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty states collection
 */
export const EmptyStates = {
  Base: EmptyState,
  NoData: NoDataState,
  NoResults: NoResultsState,
  Projects: EmptyProjectsState,
  Clients: EmptyClientsState,
  Invoices: EmptyInvoicesState,
  Schedule: EmptyScheduleState,
  Error: ErrorState,
  Upload: UploadState,
  LoadingError: LoadingErrorState,
  FeatureLocked: FeatureLockedState
};