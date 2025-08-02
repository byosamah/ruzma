import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  FileText,
  Send,
  Ban
} from 'lucide-react';

/**
 * Status type definitions
 */
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type MilestoneStatus = 'pending' | 'payment_submitted' | 'approved' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ContractStatus = 'pending' | 'approved' | 'rejected';

/**
 * Status configurations
 */
const statusConfigs = {
  // Project statuses
  active: {
    label: 'Active',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  completed: {
    label: 'Completed',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  on_hold: {
    label: 'On Hold',
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  
  // Milestone statuses
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  },
  payment_submitted: {
    label: 'Payment Submitted',
    variant: 'default' as const,
    icon: DollarSign,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  approved: {
    label: 'Approved',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  
  // Invoice statuses
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileText,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  },
  sent: {
    label: 'Sent',
    variant: 'default' as const,
    icon: Send,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  paid: {
    label: 'Paid',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  overdue: {
    label: 'Overdue',
    variant: 'destructive' as const,
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  
  // Generic statuses
  success: {
    label: 'Success',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  warning: {
    label: 'Warning',
    variant: 'secondary' as const,
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  error: {
    label: 'Error',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  info: {
    label: 'Info',
    variant: 'default' as const,
    icon: AlertCircle,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  }
};

/**
 * Status badge props
 */
interface StatusBadgeProps {
  status: keyof typeof statusConfigs;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Status badge component
 */
export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'md',
  className
}: StatusBadgeProps) {
  const config = statusConfigs[status] || statusConfigs.info;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'shrink-0')} />}
      <span>{label || config.label}</span>
    </Badge>
  );
}

/**
 * Project status badge
 */
export function ProjectStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & { status: ProjectStatus }) {
  return <StatusBadge status={status} {...props} />;
}

/**
 * Milestone status badge
 */
export function MilestoneStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & { status: MilestoneStatus }) {
  return <StatusBadge status={status} {...props} />;
}

/**
 * Invoice status badge
 */
export function InvoiceStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & { status: InvoiceStatus }) {
  return <StatusBadge status={status} {...props} />;
}

/**
 * Contract status badge
 */
export function ContractStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & { status: ContractStatus }) {
  return <StatusBadge status={status} {...props} />;
}

/**
 * Generic status indicator
 */
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  size = 'md',
  pulse = false,
  className
}: StatusIndicatorProps) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'rounded-full',
          colors[status],
          sizes[size]
        )}
      />
      {pulse && status === 'online' && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            colors[status]
          )}
        />
      )}
    </div>
  );
}

/**
 * Status list for displaying multiple statuses
 */
interface StatusListProps {
  statuses: Array<{
    label: string;
    status: keyof typeof statusConfigs;
    count?: number;
  }>;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusList({
  statuses,
  orientation = 'horizontal',
  size = 'md',
  className
}: StatusListProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {statuses.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <StatusBadge 
            status={item.status} 
            label={item.label}
            size={size}
          />
          {item.count !== undefined && (
            <span className="text-sm text-muted-foreground">
              ({item.count})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Status badge exports
 */
export const StatusBadges = {
  Base: StatusBadge,
  Project: ProjectStatusBadge,
  Milestone: MilestoneStatusBadge,
  Invoice: InvoiceStatusBadge,
  Contract: ContractStatusBadge,
  Indicator: StatusIndicator,
  List: StatusList
};